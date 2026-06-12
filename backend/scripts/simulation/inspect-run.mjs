import 'dotenv/config'
import mongoose from 'mongoose'
import Comment from '../../src/models/Comment.js'
import '../../src/models/Author.js'
import { getMongoUri, parseArgs } from './utils.mjs'

function detailPath (slug, id) {
  return `/detail/${slug || id}`
}

async function main () {
  const args = parseArgs(process.argv.slice(2).filter(arg => !['--dry-run', '--call-ai', '--confirm-production', '--use-api-likes'].includes(arg)))
  await mongoose.connect(getMongoUri())

  const runId = args.runId
  const likeEvents = mongoose.connection.collection('simulation_like_events')

  const [runSummary, likesByPoem, commentsByPoem, commentSamples, likesByAuthor, commentsByAuthor] = await Promise.all([
    mongoose.connection.collection('simulation_seed_runs').findOne({ _id: runId }),
    likeEvents.aggregate([
      { $match: { runId } },
      { $group: { _id: '$poemId', likes: { $sum: 1 }, likerIds: { $addToSet: '$authorId' } } },
      { $lookup: { from: 'poems', localField: '_id', foreignField: '_id', as: 'poem' } },
      { $unwind: '$poem' },
      {
        $project: {
          _id: 0,
          poemId: '$_id',
          title: '$poem.title',
          slug: '$poem.slug',
          runLikes: '$likes',
          totalLikes: { $size: { $ifNull: ['$poem.likes', []] } }
        }
      },
      { $sort: { runLikes: -1, totalLikes: -1, title: 1 } },
      { $limit: 20 }
    ]).toArray(),
    Comment.aggregate([
      { $match: { simulationRunId: runId, targetType: 'poem' } },
      { $group: { _id: '$targetId', comments: { $sum: 1 }, kinds: { $addToSet: '$simulationKind' } } },
      { $lookup: { from: 'poems', localField: '_id', foreignField: '_id', as: 'poem' } },
      { $unwind: '$poem' },
      { $project: { _id: 0, poemId: '$_id', title: '$poem.title', slug: '$poem.slug', comments: 1, kinds: 1 } },
      { $sort: { comments: -1, title: 1 } },
      { $limit: 20 }
    ]),
    Comment.find({ simulationRunId: runId })
      .populate('authorId', 'name username type')
      .sort({ createdAt: 1 })
      .limit(12)
      .lean(),
    likeEvents.aggregate([
      { $match: { runId } },
      { $group: { _id: '$authorId', likes: { $sum: 1 } } },
      { $lookup: { from: 'authors', localField: '_id', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $project: { _id: 0, author: { $ifNull: ['$author.username', '$author.name'] }, likes: 1 } },
      { $sort: { likes: -1, author: 1 } },
      { $limit: 10 }
    ]).toArray(),
    Comment.aggregate([
      { $match: { simulationRunId: runId } },
      { $group: { _id: '$authorId', comments: { $sum: 1 } } },
      { $lookup: { from: 'authors', localField: '_id', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      { $project: { _id: 0, author: { $ifNull: ['$author.username', '$author.name'] }, comments: 1 } },
      { $sort: { comments: -1, author: 1 } },
      { $limit: 10 }
    ])
  ])

  const output = {
    runId,
    runSummary,
    topLikedPoems: likesByPoem.map(item => ({
      ...item,
      url: detailPath(item.slug, item.poemId)
    })),
    topCommentedPoems: commentsByPoem.map(item => ({
      ...item,
      url: detailPath(item.slug, item.poemId)
    })),
    topLikers: likesByAuthor,
    topCommenters: commentsByAuthor,
    sampleComments: commentSamples.map(comment => ({
      body: comment.body,
      author: comment.authorId?.username || comment.authorId?.name,
      kind: comment.simulationKind,
      targetType: comment.targetType,
      targetId: comment.targetId,
      createdAt: comment.createdAt
    }))
  }

  console.log(JSON.stringify(output, null, 2))
  await mongoose.disconnect()
}

main().catch(async err => {
  console.error(err)
  await mongoose.disconnect().catch(() => {})
  process.exit(1)
})
