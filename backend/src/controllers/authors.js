const authorsRouter = require('express').Router()
const Author = require('../models/Author')

function buildFilter (query) {
  const filter = {}
  if (query.type) filter.type = query.type
  if (query.fake === 'true') filter.fake = true
  return filter
}

// GET /api/authors/letters — which letters have at least one author
authorsRouter.get('/letters', async (req, res) => {
  try {
    const results = await Author.aggregate([
      { $match: buildFilter(req.query) },
      { $project: { letter: { $toUpper: { $substrCP: [{ $trim: { input: '$name' } }, 0, 1] } } } },
      { $match: { letter: { $regex: '^[A-Z]$' } } },
      { $group: { _id: '$letter' } },
      { $sort: { _id: 1 } }
    ])
    res.json(results.map(r => r._id))
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/authors?letter=A   — authors starting with a letter (with poem counts)
// GET /api/authors?limit=15   — top authors by poem count
authorsRouter.get('/', async (req, res) => {
  try {
    const filter = buildFilter(req.query)

    const countLookup = {
      $lookup: {
        from: 'poems',
        let: { aid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$authorId', '$$aid'] } } },
          { $count: 'n' }
        ],
        as: 'poemCount'
      }
    }
    const countProject = { name: 1, slug: 1, picture: 1, username: 1, count: { $ifNull: [{ $arrayElemAt: ['$poemCount.n', 0] }, 0] } }

    if (req.query.letter) {
      const letter = req.query.letter.toUpperCase()
      const authors = await Author.aggregate([
        { $match: { name: { $regex: `^${letter}`, $options: 'i' }, ...filter } },
        countLookup,
        { $project: countProject },
        { $sort: { name: 1 } }
      ])
      return res.json(authors.map(a => ({ id: String(a._id), name: a.username || a.name, slug: a.slug, picture: a.picture, count: a.count })))
    }

    const limit = Math.min(parseInt(req.query.limit) || 15, 100)
    const authors = await Author.aggregate([
      { $match: filter },
      countLookup,
      { $project: countProject },
      { $sort: { count: -1 } },
      { $limit: limit }
    ])
    res.json(authors.map(a => ({ id: String(a._id), name: a.username || a.name, slug: a.slug, picture: a.picture, count: a.count })))
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/authors/:slug — single author profile (bio, preferredGenres, picture, type)
authorsRouter.get('/:slug', async (req, res) => {
  try {
    const author = await Author.findOne({ slug: req.params.slug }, 'name slug picture type bio preferredGenres')
    if (!author) return res.status(404).json({ error: 'Author not found' })
    res.json(author)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = authorsRouter
