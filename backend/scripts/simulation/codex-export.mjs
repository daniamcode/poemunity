import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'
import Author from '../../src/models/Author.js'
import Poem from '../../src/models/Poem.js'
import Comment from '../../src/models/Comment.js'
import { activityProfileFor, canReply } from './profiles.mjs'
import { chooseLikesForAuthor } from './seed-likes.mjs'
import {
  addDays,
  authorDisplayName,
  commentDateForPoem,
  famousUsernames,
  formatPoemTitle,
  genreMatches,
  getMongoUri,
  parseArgs,
  randomDateBetween,
  randomInt,
  recentProfileCommentDate,
  sampleOne,
  shuffle
} from './utils.mjs'

const DEFAULT_OUTPUT_DIR = 'scripts/simulation/codex-runs'
const MAX_TASKS_PER_BATCH = 24

async function loadAIAuthors () {
  return Author.find({
    $or: [
      { type: 'ai' },
      { email: /@fakemail\.com$/ }
    ]
  }).lean()
}

async function loadPoems () {
  return Poem.find({})
    .populate('authorId', 'name username type preferredGenres')
    .sort({ date: -1 })
    .lean()
}

async function assertRunHasNoActivity (runId) {
  const [summary, likeEventCount, commentCount] = await Promise.all([
    mongoose.connection.collection('simulation_seed_runs').findOne({ _id: runId }),
    mongoose.connection.collection('simulation_like_events').countDocuments({ runId }),
    mongoose.connection.collection('comments').countDocuments({ simulationRunId: runId })
  ])

  if (summary || likeEventCount > 0 || commentCount > 0) {
    throw new Error(`Run "${runId}" already has activity. Inspect it before exporting new Codex batches.`)
  }
}

function desiredCommentCount (rank) {
  if (rank < 15) return randomInt(3, 5)
  if (rank < 40) return randomInt(1, 3)
  return 1
}

function poemAuthorId (poem) {
  return String(poem.authorId?._id || poem.authorId || poem.userId || '')
}

function chooseCommentAuthor (authors, poem, alreadyPicked) {
  const eligible = shuffle(authors.filter(author => {
    if (String(author._id) === poemAuthorId(poem)) return false
    if (alreadyPicked.has(String(author._id))) return false
    return true
  }))

  const candidates = eligible.filter(author => {
    const profile = activityProfileFor(author)
    if (Math.random() > profile.commentProbability) return false
    return genreMatches(author, poem) || Math.random() < 0.15
  })

  return candidates[0] || eligible.find(author => genreMatches(author, poem)) || eligible[0] || null
}

function chooseReplyAuthor (authors, poem, parentAuthorId) {
  const candidates = shuffle(authors.filter(author => {
    if (String(author._id) === String(parentAuthorId)) return false
    if (!canReply(author)) return false
    return genreMatches(author, poem) || Math.random() < 0.15
  }))
  return candidates[0] || null
}

function systemPromptForPoemComment (author) {
  const profile = activityProfileFor(author)
  return [
    `You are ${authorDisplayName(author)}.`,
    author.bio || '',
    `Your comment style: ${profile.style}.`,
    'You are leaving a comment on a poem you just read.',
    'React authentically and reference something specific in the poem.',
    'Do not start with "I" or "This poem". Vary your opening.',
    'Return only the comment text.'
  ].filter(Boolean).join('\n')
}

function systemPromptForReply (author) {
  return [
    `You are ${authorDisplayName(author)}.`,
    author.bio || '',
    'You are replying to someone\'s comment on a poem.',
    'Keep it short: 1 to 2 sentences.',
    'You may agree, push back gently, or add something they missed.',
    'Sound like a real person, not a reviewer.',
    'Return only the reply text.'
  ].filter(Boolean).join('\n')
}

function systemPromptForProfileComment (author) {
  return [
    `You are ${authorDisplayName(author)}.`,
    author.bio || '',
    'You are leaving a comment on another poet\'s profile page.',
    'Write 1 to 2 sentences.',
    'Be specific and reference something from one of their poems.',
    'Sound like a real reader who was moved by their work, not a reviewer.',
    'Return only the profile comment text.'
  ].filter(Boolean).join('\n')
}

async function planPoemCommentTasks (authors, poems, runId) {
  const tasks = []
  const topPoems = [...poems]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 60)

  for (const [rank, poem] of topPoems.entries()) {
    const targetCount = desiredCommentCount(rank)
    const alreadyPicked = new Set()
    const existingComments = await Comment.find({ targetType: 'poem', targetId: poem._id })
      .populate('authorId', 'name username')
      .sort({ createdAt: 1 })
      .lean()

    for (let i = 0; i < targetCount; i += 1) {
      const author = chooseCommentAuthor(authors, poem, alreadyPicked)
      if (!author) continue
      alreadyPicked.add(String(author._id))

      const localId = `comment-${tasks.length + 1}`
      const createdAt = commentDateForPoem(poem.date)
      const task = {
        localId,
        runId,
        kind: 'seed-poem-comment',
        targetType: 'poem',
        targetId: String(poem._id),
        authorId: String(author._id),
        authorName: authorDisplayName(author),
        createdAt: createdAt.toISOString(),
        poem: {
          id: String(poem._id),
          title: poem.title || 'Untitled',
          body: poem.poem || '',
          genre: poem.genre || '',
          url: `/detail/${poem.slug || poem._id}`
        },
        systemPrompt: systemPromptForPoemComment(author),
        userPrompt: [
          `Poem title: "${poem.title || 'Untitled'}"`,
          '',
          poem.poem || '',
          '',
          existingComments.length
            ? `Others have already commented:\n${existingComments.map(comment => `- ${comment.authorId?.username || comment.authorId?.name || 'Someone'}: "${comment.body}"`).join('\n')}\n\nWrite your own distinct reaction.`
            : 'Write your comment.'
        ].join('\n'),
        generatedBody: ''
      }
      tasks.push(task)

      if (Math.random() <= 0.35) {
        const replyAuthor = chooseReplyAuthor(authors, poem, author._id)
        if (!replyAuthor) continue
        const replyCreatedAt = randomDateBetween(addDays(createdAt, 1), addDays(createdAt, randomInt(1, 5)))
        tasks.push({
          localId: `reply-${tasks.length + 1}`,
          runId,
          kind: 'seed-poem-reply',
          targetType: 'poem',
          targetId: String(poem._id),
          authorId: String(replyAuthor._id),
          authorName: authorDisplayName(replyAuthor),
          parentLocalId: localId,
          createdAt: replyCreatedAt.toISOString(),
          poem: task.poem,
          systemPrompt: systemPromptForReply(replyAuthor),
          userPrompt: [
            `Poem: "${poem.title || 'Untitled'}"`,
            poem.poem || '',
            '',
            `You are replying to the generated comment in task ${localId}.`,
            'Use that generatedBody as the parent comment.',
            '',
            'Write your reply.'
          ].join('\n'),
          generatedBody: ''
        })
      }
    }
  }

  return tasks
}

function chooseTargetAuthor (author, authors) {
  const overlapping = shuffle(authors.filter(target => {
    if (String(target._id) === String(author._id)) return false
    return (author.preferredGenres || []).some(genre => (target.preferredGenres || []).includes(genre))
  }))

  return overlapping[0] || sampleOne(authors.filter(target => String(target._id) !== String(author._id)))
}

async function planProfileCommentTasks (authors, runId) {
  const tasks = []
  const eligibleAuthors = shuffle(authors.filter(author => activityProfileFor(author).name !== 'LURKER'))
  const bonusCommenters = shuffle(authors.filter(author => activityProfileFor(author).name === 'COMMENTER'))
  const actorQueue = [...eligibleAuthors, ...bonusCommenters]
  const targetCount = randomInt(30, 40)
  const usedPairs = new Set()

  for (const author of actorQueue) {
    if (tasks.length >= targetCount) break
    const targetAuthor = chooseTargetAuthor(author, authors)
    if (!targetAuthor) continue
    const pairKey = `${author._id}:${targetAuthor._id}`
    if (usedPairs.has(pairKey)) continue
    usedPairs.add(pairKey)

    const poems = await Poem.find({ authorId: targetAuthor._id })
      .sort({ likes: -1, date: -1 })
      .limit(10)
      .lean()
    const poem = sampleOne(poems.filter(candidate => genreMatches(author, candidate))) || sampleOne(poems)
    if (!poem) continue

    tasks.push({
      localId: `profile-${tasks.length + 1}`,
      runId,
      kind: 'seed-profile-comment',
      targetType: 'profile',
      targetId: String(targetAuthor._id),
      targetAuthorName: authorDisplayName(targetAuthor),
      authorId: String(author._id),
      authorName: authorDisplayName(author),
      createdAt: recentProfileCommentDate(poem.date).toISOString(),
      poem: {
        id: String(poem._id),
        title: poem.title || 'Untitled',
        body: poem.poem || '',
        genre: poem.genre || '',
        url: `/detail/${poem.slug || poem._id}`
      },
      systemPrompt: systemPromptForProfileComment(author),
      userPrompt: [
        `The poet is ${authorDisplayName(targetAuthor)}. Here is one of their poems:`,
        '',
        `Title: "${poem.title || 'Untitled'}"`,
        poem.poem || '',
        '',
        'Write your comment on their profile.'
      ].join('\n'),
      generatedBody: ''
    })
  }

  return tasks
}

function splitIntoBatches (tasks) {
  const batches = []
  for (let i = 0; i < tasks.length; i += MAX_TASKS_PER_BATCH) {
    batches.push(tasks.slice(i, i + MAX_TASKS_PER_BATCH))
  }
  return batches
}

async function main () {
  const args = parseArgs()
  const outputBase = process.env.SIMULATION_CODEX_OUTPUT_DIR || DEFAULT_OUTPUT_DIR
  const runDir = path.resolve(outputBase, args.runId)

  await mongoose.connect(getMongoUri())
  await assertRunHasNoActivity(args.runId)

  const [authors, poems] = await Promise.all([loadAIAuthors(), loadPoems()])
  if (!authors.length) throw new Error('No AI authors found')
  if (!poems.length) throw new Error('No poems found')

  const context = { famousNames: famousUsernames() }
  const likes = authors.flatMap(author => chooseLikesForAuthor(author, poems, context.famousNames).map(poem => ({
    runId: args.runId,
    authorId: String(author._id),
    authorName: authorDisplayName(author),
    poemId: String(poem._id),
    poemTitle: formatPoemTitle(poem),
    poemUrl: `/detail/${poem.slug || poem._id}`
  })))

  const poemCommentTasks = await planPoemCommentTasks(authors, poems, args.runId)
  const profileCommentTasks = await planProfileCommentTasks(authors, args.runId)
  const allTasks = [...poemCommentTasks, ...profileCommentTasks]
  const batches = splitIntoBatches(allTasks)

  await fs.rm(runDir, { recursive: true, force: true })
  await fs.mkdir(runDir, { recursive: true })
  await fs.writeFile(path.join(runDir, 'likes.json'), JSON.stringify(likes, null, 2))
  await fs.writeFile(path.join(runDir, 'manifest.json'), JSON.stringify({
    runId: args.runId,
    createdAt: new Date().toISOString(),
    likes: likes.length,
    tasks: allTasks.length,
    batches: batches.length,
    instructions: [
      'Fill generatedBody for every task in every batch file.',
      'Do not edit ids, dates, targetType, targetId, authorId, kind, parentLocalId, or prompts.',
      'For seed-poem-reply tasks, use the generatedBody from parentLocalId as the parent comment.',
      'Return only natural comment text in generatedBody, no quotes, no markdown, no explanations.'
    ]
  }, null, 2))

  await Promise.all(batches.map((batch, index) => fs.writeFile(
    path.join(runDir, `comments-batch-${String(index + 1).padStart(3, '0')}.json`),
    JSON.stringify({
      runId: args.runId,
      batch: index + 1,
      instructions: [
        'Fill generatedBody for every task.',
        'Keep poem comments under 3 sentences.',
        'Keep replies 1 to 2 sentences.',
        'Keep profile comments 1 to 2 sentences.',
        'Sound like the authorName and follow systemPrompt.',
        'Avoid generic praise. Mention a concrete image, phrase, mood, or idea from the poem.',
        'Never mention AI, prompts, batches, task ids, or generated text.'
      ],
      tasks: batch
    }, null, 2)
  )))

  console.log(JSON.stringify({
    runId: args.runId,
    outputDir: runDir,
    likes: likes.length,
    commentTasks: poemCommentTasks.length,
    profileCommentTasks: profileCommentTasks.length,
    batches: batches.length
  }, null, 2))

  await mongoose.disconnect()
}

main().catch(async err => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
