const authorsRouter = require('express').Router()
const Poem = require('../models/Poem')

// GET /api/authors?limit=15        → top authors by poem count
// GET /api/authors?letter=A        → all authors starting with letter A
// GET /api/authors/letters         → which letters have at least one author
authorsRouter.get('/letters', async (req, res) => {
  try {
    const authors = await Poem.distinct('author', { author: { $ne: null, $ne: '' } })
    const letters = [...new Set(
      authors
        .filter(a => a && a.trim())
        .map(a => a.trim()[0].toUpperCase())
        .filter(c => /[A-Z]/.test(c))
    )].sort()
    res.json(letters)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

authorsRouter.get('/', async (req, res) => {
  try {
    if (req.query.letter) {
      const letter = req.query.letter.toUpperCase()
      const authors = await Poem.aggregate([
        {
          $match: {
            author: { $regex: `^${letter}`, $options: 'i' }
          }
        },
        {
          $group: {
            _id: '$author',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
      return res.json(
        authors.map(a => ({
          name: a._id,
          count: a.count,
          slug: slugify(a._id)
        }))
      )
    }

    const limit = Math.min(parseInt(req.query.limit) || 15, 100)
    const authors = await Poem.aggregate([
      {
        $match: { author: { $ne: null, $ne: '' } }
      },
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ])

    res.json(
      authors.map(a => ({
        name: a._id,
        count: a.count,
        slug: slugify(a._id)
      }))
    )
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

module.exports = authorsRouter
