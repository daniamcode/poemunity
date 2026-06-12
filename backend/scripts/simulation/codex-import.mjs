import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'
import Comment from '../../src/models/Comment.js'
import Poem from '../../src/models/Poem.js'
import {
  cleanGeneratedText,
  getMongoUri,
  parseArgs
} from './utils.mjs'

const DEFAULT_OUTPUT_DIR = 'scripts/simulation/codex-runs'

async function readJson (filePath) {
  return JSON.parse(await fs.readFile(filePath, 'utf8'))
}

async function assertRunHasNoActivity (runId) {
  const [summary, likeEventCount, commentCount] = await Promise.all([
    mongoose.connection.collection('simulation_seed_runs').findOne({ _id: runId }),
    mongoose.connection.collection('simulation_like_events').countDocuments({ runId }),
    mongoose.connection.collection('comments').countDocuments({ simulationRunId: runId })
  ])

  if (summary || likeEventCount > 0 || commentCount > 0) {
    throw new Error(`Run "${runId}" already has activity. Refusing to import twice.`)
  }
}

function validateBody (task) {
  const body = cleanGeneratedText(task.generatedBody)
  if (!body) throw new Error(`Missing generatedBody for ${task.localId}`)
  if (/^(TODO|TBD|placeholder)/i.test(body)) throw new Error(`Placeholder generatedBody for ${task.localId}`)
  if (/\b(as an ai|language model|prompt|task id|generatedBody)\b/i.test(body)) {
    throw new Error(`AI/process leakage in ${task.localId}: ${body}`)
  }
  return body
}

async function loadTasks (runDir) {
  const files = (await fs.readdir(runDir))
    .filter(file => /^comments-batch-\d+\.json$/.test(file))
    .sort()

  const batches = await Promise.all(files.map(file => readJson(path.join(runDir, file))))
  return batches.flatMap(batch => batch.tasks || [])
}

function validateTasksBeforeWrite (tasks) {
  const localIds = new Set(tasks.map(task => task.localId))
  tasks.forEach(task => {
    validateBody(task)
    if (task.parentLocalId && !localIds.has(task.parentLocalId)) {
      throw new Error(`Missing parentLocalId target for ${task.localId}: ${task.parentLocalId}`)
    }
  })
}

async function importLikes (likes, runId) {
  let created = 0
  const events = mongoose.connection.collection('simulation_like_events')

  for (const like of likes) {
    const result = await Poem.updateOne(
      { _id: like.poemId, likes: { $ne: like.authorId } },
      { $addToSet: { likes: like.authorId } }
    )

    if (result.modifiedCount > 0) {
      await events.updateOne(
        { runId, authorId: new mongoose.Types.ObjectId(like.authorId), poemId: new mongoose.Types.ObjectId(like.poemId) },
        {
          $setOnInsert: {
            runId,
            authorId: new mongoose.Types.ObjectId(like.authorId),
            poemId: new mongoose.Types.ObjectId(like.poemId),
            createdAt: new Date()
          }
        },
        { upsert: true }
      )
      created += 1
    }
  }

  return created
}

async function importComments (tasks, runId) {
  const byLocalId = new Map()
  let poemComments = 0
  let poemReplies = 0
  let profileComments = 0

  const topLevelTasks = tasks.filter(task => !task.parentLocalId)
  const replyTasks = tasks.filter(task => task.parentLocalId)

  for (const task of topLevelTasks) {
    const body = validateBody(task)
    const comment = await Comment.create({
      targetType: task.targetType,
      targetId: task.targetId,
      authorId: task.authorId,
      body,
      parentId: null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.createdAt),
      simulationRunId: runId,
      simulationKind: task.kind
    })
    byLocalId.set(task.localId, comment._id)
    if (task.kind === 'seed-profile-comment') profileComments += 1
    else poemComments += 1
  }

  for (const task of replyTasks) {
    const parentId = byLocalId.get(task.parentLocalId)
    if (!parentId) throw new Error(`Missing parent for ${task.localId}: ${task.parentLocalId}`)
    const body = validateBody(task)
    await Comment.create({
      targetType: task.targetType,
      targetId: task.targetId,
      authorId: task.authorId,
      body,
      parentId,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.createdAt),
      simulationRunId: runId,
      simulationKind: task.kind
    })
    poemReplies += 1
  }

  return { poemComments, poemReplies, profileComments }
}

async function main () {
  const args = parseArgs()
  const outputBase = process.env.SIMULATION_CODEX_OUTPUT_DIR || DEFAULT_OUTPUT_DIR
  const runDir = path.resolve(outputBase, args.runId)

  await mongoose.connect(getMongoUri())
  await assertRunHasNoActivity(args.runId)

  const [likes, tasks] = await Promise.all([
    readJson(path.join(runDir, 'likes.json')),
    loadTasks(runDir)
  ])
  validateTasksBeforeWrite(tasks)

  const likesCreated = await importLikes(likes, args.runId)
  const comments = await importComments(tasks, args.runId)
  const summary = {
    likesCreated,
    poemCommentsCreated: comments.poemComments,
    poemRepliesCreated: comments.poemReplies,
    profileCommentsCreated: comments.profileComments
  }

  await mongoose.connection.collection('simulation_seed_runs').updateOne(
    { _id: args.runId },
    {
      $set: {
        runId: args.runId,
        finishedAt: new Date(),
        summary,
        provider: 'codex-subagents'
      },
      $setOnInsert: {
        startedAt: new Date()
      }
    },
    { upsert: true }
  )

  console.log(JSON.stringify(summary, null, 2))
  await mongoose.disconnect()
}

main().catch(async err => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
