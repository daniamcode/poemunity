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

// GET /api/authors/:slug — public author profile (personal fields filtered by privateFields)
authorsRouter.get('/:slug', async (req, res) => {
  try {
    const author = await Author.findOne(
      { slug: req.params.slug },
      'name slug picture type bio preferredGenres surname city country birthYear gender website privateFields'
    )
    if (!author) return res.status(404).json({ error: 'Author not found' })

    const priv = new Set(author.privateFields || [])
    const result = {
      id: author.id,
      name: author.name,
      slug: author.slug,
      picture: author.picture,
      type: author.type,
      bio: author.bio,
      preferredGenres: author.preferredGenres,
      website: author.website
    }
    if (!priv.has('surname')) result.surname = author.surname
    if (!priv.has('city')) result.city = author.city
    if (!priv.has('country')) result.country = author.country
    if (!priv.has('birthYear')) result.birthYear = author.birthYear
    if (!priv.has('gender')) result.gender = author.gender

    res.json(result)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = authorsRouter
