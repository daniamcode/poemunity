const mongoose = require('mongoose')
const poemsRouter = require('express').Router()
const Poem = require('../models/Poem')
const Author = require('../models/Author')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')
const { generatePoemSlug } = require('../utils/slugUtils')

const AUTHOR_FIELDS = 'name slug picture username type'

async function buildUniqueSlug(title, authorName) {
  const base = generatePoemSlug(title, authorName)
  let slug = base
  let counter = 2
  while (await Poem.exists({ slug })) {
    slug = `${base}-${counter++}`
  }
  return slug
}

poemsRouter.get('/', async (req, res) => {
  try {
    const filter = {}

    if (req.query.origin) {
      filter.origin = req.query.origin
    }

    // userId filter — check authorId (new) and legacy userId field (string or ObjectId)
    if (req.query.userId) {
      const id = new mongoose.Types.ObjectId(req.query.userId)
      filter.$or = [{ authorId: id }, { userId: id }, { userId: req.query.userId }]
    }

    if (req.query.likedBy) {
      filter.likes = req.query.likedBy
    }

    // Author filter by slug — O(1) indexed lookup, no regex or reconstruction
    if (req.query.author) {
      const author = await Author.findOne({ slug: req.query.author })
      if (!author) {
        return res.json({ poems: [], total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false })
      }
      filter.authorId = author._id
    }

    if (req.query.genre) {
      filter.genre = { $regex: `^${req.query.genre}$`, $options: 'i' }
    }

    const isPaginationRequested = req.query.page !== undefined || req.query.limit !== undefined

    if (isPaginationRequested) {
      const pageParam = req.query.page !== undefined ? parseInt(req.query.page) : null
      const limitParam = req.query.limit !== undefined ? parseInt(req.query.limit) : null

      if (pageParam !== null && (isNaN(pageParam) || pageParam < 1)) {
        return res.status(400).json({ error: 'Page must be greater than 0' })
      }
      if (limitParam !== null && (isNaN(limitParam) || limitParam < 1)) {
        return res.status(400).json({ error: 'Limit must be greater than 0' })
      }

      const page = pageParam || 1
      const limit = limitParam || 10
      const effectiveLimit = Math.min(limit, 100)
      const skip = (page - 1) * effectiveLimit

      const total = await Poem.countDocuments(filter)
      const poems = await Poem.find(filter)
        .populate('authorId', AUTHOR_FIELDS)
        .sort({ date: -1 })
        .skip(skip)
        .limit(effectiveLimit)

      const totalPages = Math.ceil(total / effectiveLimit)
      const hasMore = page < totalPages

      res.json({ poems, total, page, limit: effectiveLimit, totalPages, hasMore })
    } else {
      const poems = await Poem.find(filter)
        .populate('authorId', AUTHOR_FIELDS)
        .sort({ date: -1 })
      res.json(poems)
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

poemsRouter.post('/', userExtractor, async (req, res) => {
  const poemData = req.body
  const { userId } = req

  const adminId = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

  // If admin posts with a userId override, use that author; otherwise use logged-in author
  const authorId = (poemData.userId && userId === adminId)
    ? poemData.userId
    : userId

  let author = await Author.findById(authorId)
  let isLegacyUser = false
  if (!author) {
    author = await User.findById(authorId)
    isLegacyUser = true
  }
  if (!author) {
    return res.status(404).json({ error: 'Author not found' })
  }

  const slug = await buildUniqueSlug(poemData.title, author.name || author.username)

  const newPoem = new Poem({
    ...poemData,
    authorId: author._id,
    origin: author.type || 'user',
    slug
  })

  try {
    const savedPoem = await newPoem.save()

    author.poems = author.poems.concat(savedPoem._id)
    await author.save()

    if (isLegacyUser) {
      // populate won't cross collections; build response manually
      const poemObj = savedPoem.toJSON()
      poemObj.author = author.username || author.name
      poemObj.authorName = author.name
      poemObj.picture = author.picture
      poemObj.userId = String(author._id)
      poemObj.authorSlug = author.slug
      delete poemObj.authorId
      return res.status(201).json(poemObj)
    }

    const populated = await savedPoem.populate('authorId', AUTHOR_FIELDS)
    res.status(201).json(populated)
  } catch (error) {
    console.error('Error saving poem:', error)
    res.status(500).json({ error: 'Failed to save poem' })
  }
})

// add new property to all existing poems
poemsRouter.patch('/', async (req, res) => {
  const newProperty = req.body
  const response = await Poem.updateMany({}, { $set: newProperty })
  if (response === null) {
    return res.status(404).json({ error: 'error' })
  }
  res.status(204).end()
})

module.exports = poemsRouter
