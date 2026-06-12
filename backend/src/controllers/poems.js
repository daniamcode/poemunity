const mongoose = require('mongoose')
const poemsRouter = require('express').Router()
const Poem = require('../models/Poem')
const Author = require('../models/Author')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')
const { generatePoemSlug } = require('../utils/slugUtils')

const AUTHOR_FIELDS = 'name slug picture username type'
const ORDER_BY_DATE = 'date'
const ORDER_BY_LIKES = 'likes'
const ORDER_BY_TITLE = 'title'

async function buildUniqueSlug (title, authorName) {
  const base = generatePoemSlug(title, authorName)
  let slug = base
  let counter = 2
  while (await Poem.exists({ slug })) {
    slug = `${base}-${counter++}`
  }
  return slug
}

function normalizeOrderBy (orderBy) {
  return String(orderBy || ORDER_BY_DATE).trim().toLowerCase()
}

function findSortForOrder (orderBy) {
  switch (normalizeOrderBy(orderBy)) {
    case ORDER_BY_TITLE:
      return { title: 1, _id: 1 }
    case ORDER_BY_DATE:
      return { date: -1, _id: -1 }
    default:
      return { date: -1, _id: -1 }
  }
}

function serializePoem (poem) {
  const returnedObject = typeof poem.toJSON === 'function' ? poem.toJSON() : { ...poem }
  returnedObject.id = returnedObject._id
  delete returnedObject._id
  delete returnedObject.__v
  delete returnedObject.likesCount

  const rawAuthor = returnedObject.authorId
  const author = rawAuthor && typeof rawAuthor.toJSON === 'function' ? rawAuthor.toJSON() : rawAuthor
  if (author && (author.name || author.username)) {
    returnedObject.author = author.username || author.name
    returnedObject.authorName = author.name
    returnedObject.picture = author.picture
    returnedObject.userId = String(author._id || author.id)
    returnedObject.authorSlug = author.slug
    returnedObject.authorType = author.type
    delete returnedObject.authorId
  }

  return returnedObject
}

async function findPoems (filter, { orderBy, skip, limit } = {}) {
  if (normalizeOrderBy(orderBy) === ORDER_BY_LIKES) {
    const pipeline = [
      { $match: filter },
      { $addFields: { likesCount: { $size: { $ifNull: ['$likes', []] } } } },
      { $sort: { likesCount: -1, date: -1, _id: 1 } }
    ]

    if (skip !== undefined) pipeline.push({ $skip: skip })
    if (limit !== undefined) pipeline.push({ $limit: limit })

    const poems = await Poem.aggregate(pipeline)
    const populatedPoems = await Poem.populate(poems, { path: 'authorId', select: AUTHOR_FIELDS })
    return populatedPoems.map(serializePoem)
  }

  let query = Poem.find(filter)
    .populate('authorId', AUTHOR_FIELDS)
    .sort(findSortForOrder(orderBy))

  if (skip !== undefined) query = query.skip(skip)
  if (limit !== undefined) query = query.limit(limit)

  return query
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
      const poems = await findPoems(filter, {
        orderBy: req.query.orderBy,
        skip,
        limit: effectiveLimit
      })

      const totalPages = Math.ceil(total / effectiveLimit)
      const hasMore = page < totalPages

      res.json({ poems, total, page, limit: effectiveLimit, totalPages, hasMore })
    } else {
      const poems = await findPoems(filter, { orderBy: req.query.orderBy })
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

// add new property to all existing poems — admin only
poemsRouter.patch('/', userExtractor, async (req, res) => {
  const adminId = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

  if (req.userId !== adminId) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const newProperty = req.body
  const response = await Poem.updateMany({}, { $set: newProperty })
  if (response === null) {
    return res.status(404).json({ error: 'error' })
  }
  res.status(204).end()
})

module.exports = poemsRouter
