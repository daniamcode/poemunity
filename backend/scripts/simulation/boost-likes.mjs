import 'dotenv/config'
import mongoose from 'mongoose'
import Author from '../../src/models/Author.js'
import Poem from '../../src/models/Poem.js'
import Comment from '../../src/models/Comment.js'
import {
  authorDisplayName,
  formatPoemTitle,
  genreMatches,
  getMongoUri,
  randomInt,
  shuffle,
  weightedSample
} from './utils.mjs'
import { activityProfileFor } from './profiles.mjs'
import { recordLikeEvent } from './seed-likes.mjs'

const COMMUNITY_ORIGINS = new Set(['user', 'ai'])
const COMMUNITY_AUTHOR_TYPES = new Set(['user', 'ai'])

function parseBoostArgs (argv = process.argv.slice(2)) {
  const args = {
    dryRun: false,
    confirmProduction: false,
    runId: process.env.SIMULATION_RUN_ID || 'seed-activity-v1.1-likes',
    sourceRunId: process.env.SIMULATION_SOURCE_RUN_ID || 'seed-activity-v1',
    targetCount: Number(process.env.SIMULATION_LIKE_TARGET_COUNT || 35),
    maxAddedPerAuthor: Number(process.env.SIMULATION_MAX_ADDED_LIKES_PER_AUTHOR || 12)
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--confirm-production') args.confirmProduction = true
    else if (arg === '--run-id') {
      args.runId = argv[i + 1]
      i += 1
    } else if (arg.startsWith('--run-id=')) {
      args.runId = arg.slice('--run-id='.length)
    } else if (arg === '--source-run-id') {
      args.sourceRunId = argv[i + 1]
      i += 1
    } else if (arg.startsWith('--source-run-id=')) {
      args.sourceRunId = arg.slice('--source-run-id='.length)
    } else if (arg === '--target-count') {
      args.targetCount = Number(argv[i + 1])
      i += 1
    } else if (arg.startsWith('--target-count=')) {
      args.targetCount = Number(arg.slice('--target-count='.length))
    } else if (arg === '--max-added-per-author') {
      args.maxAddedPerAuthor = Number(argv[i + 1])
      i += 1
    } else if (arg.startsWith('--max-added-per-author=')) {
      args.maxAddedPerAuthor = Number(arg.slice('--max-added-per-author='.length))
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!args.runId) throw new Error('Missing run id')
  if (!args.sourceRunId) throw new Error('Missing source run id')
  if (!Number.isInteger(args.targetCount) || args.targetCount <= 0) {
    throw new Error('target-count must be a positive integer')
  }
  if (!Number.isInteger(args.maxAddedPerAuthor) || args.maxAddedPerAuthor <= 0) {
    throw new Error('max-added-per-author must be a positive integer')
  }

  return args
}

function isCommunityPoem (poem) {
  const author = poem.authorId && typeof poem.authorId === 'object' ? poem.authorId : null
  return COMMUNITY_ORIGINS.has(poem.origin) || (author && COMMUNITY_AUTHOR_TYPES.has(author.type))
}

function likeCount (poem) {
  return poem.likes?.length || 0
}

function likedBy (poem, author) {
  return (poem.likes || []).some(id => String(id) === String(author._id))
}

function poemAuthorId (poem) {
  return String(poem.authorId?._id || poem.authorId || '')
}

function desiredTotalLikes (target, index) {
  if (target.commentCount >= 8) return randomInt(24, 30)
  if (target.commentCount >= 6) return randomInt(19, 25)
  if (target.commentCount >= 4) return randomInt(15, 20)
  if (target.commentCount >= 2) return randomInt(11, 16)
  return index < 20 ? randomInt(9, 13) : randomInt(6, 10)
}

function authorLikeWeight (author, poem) {
  const profile = activityProfileFor(author)
  let weight = 1
  if (genreMatches(author, poem)) weight *= 3
  if (profile.name === 'LURKER') weight *= 1.8
  else if (profile.name === 'REGULAR') weight *= 1.3
  return weight
}

async function assertRunHasNotStarted (runId, dryRun) {
  if (dryRun) return

  const [summary, likeEventCount] = await Promise.all([
    mongoose.connection.collection('simulation_seed_runs').findOne({ _id: runId }),
    mongoose.connection.collection('simulation_like_events').countDocuments({ runId })
  ])

  if (summary || likeEventCount > 0) {
    throw new Error(
      `Simulation run "${runId}" already has like activity. Use a new --run-id after inspecting/cleaning the previous run.`
    )
  }
}

async function loadAIAuthors () {
  return Author.find({
    $or: [
      { type: 'ai' },
      { email: /@fakemail\.com$/ }
    ]
  }).lean()
}

async function loadCommentedCommunityPoems (sourceRunId, limit) {
  return Comment.aggregate([
    { $match: { simulationRunId: sourceRunId, targetType: 'poem' } },
    { $group: { _id: '$targetId', commentCount: { $sum: 1 } } },
    { $lookup: { from: 'poems', localField: '_id', foreignField: '_id', as: 'poem' } },
    { $unwind: '$poem' },
    { $lookup: { from: 'authors', localField: 'poem.authorId', foreignField: '_id', as: 'author' } },
    { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
    {
      $match: {
        $or: [
          { 'poem.origin': { $in: [...COMMUNITY_ORIGINS] } },
          { 'author.type': { $in: [...COMMUNITY_AUTHOR_TYPES] } }
        ]
      }
    },
    {
      $project: {
        _id: '$poem._id',
        poem: '$poem',
        author: '$author',
        commentCount: 1
      }
    },
    { $sort: { commentCount: -1, 'poem.date': -1, 'poem.title': 1 } },
    { $limit: limit }
  ])
}

async function loadRecentCommunityPoems (limit, excludedIds) {
  const poems = await Poem.find({
    _id: { $nin: [...excludedIds] },
    origin: { $in: [...COMMUNITY_ORIGINS] }
  })
    .populate('authorId', 'name username type preferredGenres')
    .sort({ date: -1 })
    .limit(limit)
    .lean()

  return poems
    .filter(isCommunityPoem)
    .map(poem => ({
      _id: poem._id,
      poem,
      author: poem.authorId,
      commentCount: 0
    }))
}

async function loadTargets (sourceRunId, targetCount) {
  const commented = await loadCommentedCommunityPoems(sourceRunId, targetCount)
  const seen = new Set(commented.map(target => String(target._id)))
  const recent = await loadRecentCommunityPoems(Math.max(targetCount - commented.length, 0), seen)
  return [...commented, ...recent].slice(0, targetCount)
}

function chooseAuthorsForTarget (authors, target, needed, addedByAuthor, maxAddedPerAuthor) {
  const poem = target.poem
  const candidates = authors
    .filter(author => {
      if (String(author._id) === poemAuthorId(poem)) return false
      if (likedBy(poem, author)) return false
      return (addedByAuthor.get(String(author._id)) || 0) < maxAddedPerAuthor
    })
    .map(author => ({
      item: author,
      weight: authorLikeWeight(author, poem)
    }))

  return weightedSample(candidates, needed)
}

async function addLikesToTarget (target, authors, context) {
  const currentLikes = likeCount(target.poem)
  const desiredLikes = desiredTotalLikes(target, context.targetIndex)
  const needed = Math.max(0, desiredLikes - currentLikes)
  const selectedAuthors = chooseAuthorsForTarget(
    authors,
    target,
    needed,
    context.addedByAuthor,
    context.maxAddedPerAuthor
  )
  let created = 0

  for (const author of shuffle(selectedAuthors)) {
    if (context.dryRun) {
      target.poem.likes = [...(target.poem.likes || []), String(author._id)]
      context.addedByAuthor.set(String(author._id), (context.addedByAuthor.get(String(author._id)) || 0) + 1)
      created += 1
      continue
    }

    const result = await Poem.updateOne(
      { _id: target.poem._id, likes: { $ne: String(author._id) } },
      { $addToSet: { likes: String(author._id) } }
    )

    if (result.modifiedCount > 0) {
      await recordLikeEvent(author, target.poem, context)
      target.poem.likes = [...(target.poem.likes || []), String(author._id)]
      context.addedByAuthor.set(String(author._id), (context.addedByAuthor.get(String(author._id)) || 0) + 1)
      created += 1
    }
  }

  const afterLikes = currentLikes + created
  console.log(
    `${context.dryRun ? 'dry-' : ''}boosted: ${formatPoemTitle(target.poem)} ` +
    `(${currentLikes} -> ${afterLikes}, target ${desiredLikes}, comments ${target.commentCount})`
  )

  return {
    poemId: target.poem._id,
    slug: target.poem.slug,
    title: target.poem.title,
    author: authorDisplayName(target.author || target.poem.authorId || {}),
    origin: target.poem.origin,
    commentCount: target.commentCount,
    beforeLikes: currentLikes,
    desiredLikes,
    likesCreated: created,
    afterLikes
  }
}

async function writeRunSummary (context, summary) {
  if (context.dryRun) return

  await mongoose.connection.collection('simulation_seed_runs').updateOne(
    { _id: context.runId },
    {
      $set: {
        runId: context.runId,
        provider: 'codex-focused-like-booster',
        finishedAt: new Date(),
        summary,
        dryRun: false
      },
      $setOnInsert: {
        startedAt: new Date()
      }
    },
    { upsert: true }
  )
}

async function main () {
  const args = parseBoostArgs()
  if (process.env.NODE_ENV === 'production' && !args.confirmProduction) {
    throw new Error('Refusing to write production data without --confirm-production')
  }

  await mongoose.connect(getMongoUri())
  await assertRunHasNotStarted(args.runId, args.dryRun)

  console.log(`Connected to MongoDB (${process.env.NODE_ENV || 'unset'} mode)`)
  console.log(`Focused like run: ${args.runId}${args.dryRun ? ' (dry-run)' : ''}`)
  console.log(`Source comment run: ${args.sourceRunId}`)

  const [authors, targets] = await Promise.all([
    loadAIAuthors(),
    loadTargets(args.sourceRunId, args.targetCount)
  ])

  if (!authors.length) throw new Error('No AI authors found')
  if (!targets.length) throw new Error(`No target poems found from source run "${args.sourceRunId}"`)

  const context = {
    ...args,
    addedByAuthor: new Map(),
    log: message => console.log(message)
  }

  const results = []
  for (let i = 0; i < targets.length; i += 1) {
    context.targetIndex = i
    results.push(await addLikesToTarget(targets[i], authors, context))
  }

  const summary = {
    sourceRunId: args.sourceRunId,
    targetCount: targets.length,
    likesCreated: results.reduce((sum, result) => sum + result.likesCreated, 0),
    maxAddedPerAuthor: args.maxAddedPerAuthor,
    targets: results
  }

  await writeRunSummary(context, summary)
  console.log('\nSummary:')
  console.log(JSON.stringify(summary, null, 2))

  await mongoose.disconnect()
}

main().catch(async err => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
