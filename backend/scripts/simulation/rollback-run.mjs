import 'dotenv/config'
import mongoose from 'mongoose'
import Comment from '../../src/models/Comment.js'
import Poem from '../../src/models/Poem.js'
import { getMongoUri } from './utils.mjs'

function parseRollbackArgs (argv = process.argv.slice(2)) {
  const args = {
    runIds: [],
    execute: false,
    confirmProduction: false,
    allowOrphanReplies: false
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--execute') args.execute = true
    else if (arg === '--confirm-production') args.confirmProduction = true
    else if (arg === '--allow-orphan-replies') args.allowOrphanReplies = true
    else if (arg === '--run-id') {
      args.runIds.push(argv[i + 1])
      i += 1
    } else if (arg.startsWith('--run-id=')) {
      args.runIds.push(arg.slice('--run-id='.length))
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  args.runIds = args.runIds.map(runId => String(runId || '').trim()).filter(Boolean)
  if (!args.runIds.length) throw new Error('At least one --run-id is required')
  return args
}

function groupLikeEventsByPoem (likeEvents) {
  const groups = new Map()
  for (const event of likeEvents) {
    const poemId = String(event.poemId)
    const authorIds = groups.get(poemId) || new Set()
    authorIds.add(String(event.authorId))
    groups.set(poemId, authorIds)
  }
  return groups
}

async function countLikesCurrentlyPresent (likeGroups) {
  if (!likeGroups.size) return 0

  const poems = await Poem.find({ _id: { $in: [...likeGroups.keys()] } })
    .select('_id likes')
    .lean()

  return poems.reduce((total, poem) => {
    const authorIds = likeGroups.get(String(poem._id)) || new Set()
    const matchingLikes = (poem.likes || []).filter(authorId => authorIds.has(String(authorId))).length
    return total + matchingLikes
  }, 0)
}

async function commentSummaryForRun (runId) {
  return Comment.aggregate([
    { $match: { simulationRunId: runId } },
    { $group: { _id: '$simulationKind', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ])
}

async function countExternalReplies (commentIds, runId) {
  if (!commentIds.length) return 0
  return Comment.countDocuments({
    parentId: { $in: commentIds },
    $or: [
      { simulationRunId: { $exists: false } },
      { simulationRunId: { $ne: runId } }
    ]
  })
}

async function rollbackLikes (likeGroups) {
  let modifiedPoems = 0
  for (const [poemId, authorIds] of likeGroups.entries()) {
    const result = await Poem.updateOne(
      { _id: poemId },
      { $pull: { likes: { $in: [...authorIds] } } }
    )
    modifiedPoems += result.modifiedCount
  }
  return modifiedPoems
}

async function rollbackRun (runId, args) {
  const likeEventsCollection = mongoose.connection.collection('simulation_like_events')
  const seedRunsCollection = mongoose.connection.collection('simulation_seed_runs')

  const [likeEvents, commentsByKind, comments] = await Promise.all([
    likeEventsCollection.find({ runId }).toArray(),
    commentSummaryForRun(runId),
    Comment.find({ simulationRunId: runId }).select('_id').lean()
  ])

  const likeGroups = groupLikeEventsByPoem(likeEvents)
  const [likesCurrentlyOnPoems, externalReplyCount] = await Promise.all([
    countLikesCurrentlyPresent(likeGroups),
    countExternalReplies(comments.map(comment => comment._id), runId)
  ])

  const preview = {
    runId,
    mode: args.execute ? 'execute' : 'dry-run',
    commentsFound: comments.length,
    commentsByKind,
    externalRepliesToDeleteTargets: externalReplyCount,
    likeEventsFound: likeEvents.length,
    poemsWithRunLikes: likeGroups.size,
    likesCurrentlyOnPoems
  }

  if (!args.execute) return preview
  if (externalReplyCount > 0 && !args.allowOrphanReplies) {
    throw new Error(
      `Run "${runId}" has ${externalReplyCount} non-run replies to comments that would be deleted. ` +
      'Inspect them first or rerun with --allow-orphan-replies.'
    )
  }

  const modifiedPoems = await rollbackLikes(likeGroups)
  const [deletedComments, deletedLikeEvents] = await Promise.all([
    Comment.deleteMany({ simulationRunId: runId }),
    likeEventsCollection.deleteMany({ runId })
  ])

  const rollbackSummary = {
    ...preview,
    modifiedPoems,
    commentsDeleted: deletedComments.deletedCount,
    likeEventsDeleted: deletedLikeEvents.deletedCount
  }

  await seedRunsCollection.updateOne(
    { _id: runId },
    {
      $set: {
        runId,
        status: 'rolled-back',
        rolledBackAt: new Date(),
        rollbackSummary
      },
      $setOnInsert: {
        startedAt: new Date()
      }
    },
    { upsert: true }
  )

  return rollbackSummary
}

async function main () {
  const args = parseRollbackArgs()
  if (process.env.NODE_ENV === 'production' && args.execute && !args.confirmProduction) {
    throw new Error('Refusing to rollback production data without --confirm-production')
  }

  await mongoose.connect(getMongoUri())
  console.log(`Connected to MongoDB (${process.env.NODE_ENV || 'unset'} mode)`)
  console.log(args.execute ? 'Executing rollback' : 'Dry run only; pass --execute to write changes')

  const results = []
  for (const runId of args.runIds) {
    results.push(await rollbackRun(runId, args))
  }

  console.log(JSON.stringify({ results }, null, 2))
  await mongoose.disconnect()
}

main().catch(async err => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
