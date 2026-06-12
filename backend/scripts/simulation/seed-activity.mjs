import 'dotenv/config'
import mongoose from 'mongoose'
import Author from '../../src/models/Author.js'
import Poem from '../../src/models/Poem.js'
import { seedComments } from './seed-comments.mjs'
import { seedLikes } from './seed-likes.mjs'
import { seedProfileComments } from './seed-profile-comments.mjs'
import {
  famousUsernames,
  getApiBase,
  getMongoUri,
  parseArgs,
  parseAuthorCredentials
} from './utils.mjs'

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

function createContext (args) {
  return {
    ...args,
    apiBase: getApiBase(),
    credentials: parseAuthorCredentials(),
    famousNames: famousUsernames(),
    log: message => console.log(message)
  }
}

async function writeRunSummary (context, summary) {
  if (context.dryRun) return
  await mongoose.connection.collection('simulation_seed_runs').updateOne(
    { _id: context.runId },
    {
      $set: {
        runId: context.runId,
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

async function assertRunHasNotStarted (context) {
  if (context.dryRun) return

  const [summary, likeEventCount, commentCount] = await Promise.all([
    mongoose.connection.collection('simulation_seed_runs').findOne({ _id: context.runId }),
    mongoose.connection.collection('simulation_like_events').countDocuments({ runId: context.runId }),
    mongoose.connection.collection('comments').countDocuments({ simulationRunId: context.runId })
  ])

  if (summary || likeEventCount > 0 || commentCount > 0) {
    throw new Error(
      `Simulation run "${context.runId}" already has activity. Use a new --run-id after inspecting/cleaning the previous run.`
    )
  }
}

async function main () {
  const args = parseArgs()
  if (process.env.NODE_ENV === 'production' && !args.confirmProduction) {
    throw new Error('Refusing to write production data without --confirm-production')
  }
  if (!args.dryRun && !process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required unless --dry-run is used')
  }

  const context = createContext(args)
  await mongoose.connect(getMongoUri())
  await assertRunHasNotStarted(context)
  console.log(`Connected to MongoDB (${process.env.NODE_ENV || 'unset'} mode)`)
  console.log(`Simulation run: ${context.runId}${context.dryRun ? ' (dry-run)' : ''}`)
  console.log(`Likes mode: ${context.useApiLikes ? 'api' : 'db'}`)

  const [authors, poems] = await Promise.all([loadAIAuthors(), loadPoems()])
  if (!authors.length) throw new Error('No AI authors found')
  if (!poems.length) throw new Error('No poems found')

  console.log(`Loaded ${authors.length} AI authors and ${poems.length} poems`)

  const likes = await seedLikes(authors, poems, context)
  const refreshedPoems = context.dryRun ? poems : await loadPoems()
  const comments = await seedComments(authors, refreshedPoems, context)
  const profileComments = await seedProfileComments(authors, context)

  const summary = {
    likesCreated: likes.created,
    poemCommentsCreated: comments.createdTopLevel,
    poemRepliesCreated: comments.createdReplies,
    profileCommentsCreated: profileComments.created
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
