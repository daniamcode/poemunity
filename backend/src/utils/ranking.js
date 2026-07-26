const Poem = require('../models/Poem')

// Default scoring weights and size for the author ranking. The ranking is the
// single source of truth for author points; keeping the formula here means the
// GET /poems/ranking endpoint AND the mutation responses (like/create/delete,
// which embed a freshly recomputed ranking so the client never needs a second
// round-trip) all score identically.
const DEFAULT_POEM_POINTS = 3
const DEFAULT_LIKE_POINTS = 1
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

// Author ranking, computed in the database instead of shipping every poem to the
// client. Points per author = poemsCount * poemPoints + totalLikes * likePoints.
async function computeRanking ({
  poemPoints = DEFAULT_POEM_POINTS,
  likePoints = DEFAULT_LIKE_POINTS,
  limit = DEFAULT_LIMIT,
  origin
} = {}) {
  const effectiveLimit = Math.min(limit, MAX_LIMIT)

  const match = {}
  if (origin) {
    match.origin = origin
  }

  return Poem.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$authorId',
        poemsCount: { $sum: 1 },
        totalLikes: { $sum: { $size: { $ifNull: ['$likes', []] } } }
      }
    },
    {
      $addFields: {
        points: {
          $add: [
            { $multiply: ['$poemsCount', poemPoints] },
            { $multiply: ['$totalLikes', likePoints] }
          ]
        }
      }
    },
    { $sort: { points: -1 } },
    { $limit: effectiveLimit },
    {
      $lookup: {
        from: 'authors',
        localField: '_id',
        foreignField: '_id',
        as: 'author'
      }
    },
    { $unwind: '$author' },
    {
      $project: {
        _id: 0,
        userId: { $toString: '$_id' },
        author: { $ifNull: ['$author.name', '$author.username'] },
        picture: '$author.picture',
        authorSlug: '$author.slug',
        points: 1
      }
    }
  ])
}

module.exports = {
  computeRanking,
  DEFAULT_POEM_POINTS,
  DEFAULT_LIKE_POINTS,
  DEFAULT_LIMIT
}
