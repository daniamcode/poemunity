const jwt = require('jsonwebtoken')
const poemsRouter = require('express').Router()
const Poem = require('../models/Poem')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')

poemsRouter.get('/', async (req, res) => {
  try {
    // Build filter
    const filter = {}

    // Add origin filter if provided
    if (req.query.origin) {
      filter.origin = req.query.origin
    }

    // Add userId filter if provided (for MyPoems - filter by poem author)
    if (req.query.userId) {
      filter.userId = req.query.userId
    }

    // Add likedBy filter if provided (for MyFavouritePoems - filter by user who liked)
    if (req.query.likedBy) {
      filter.likes = req.query.likedBy
    }

    // Check if pagination is requested (if page or limit params are present)
    const isPaginationRequested = req.query.page !== undefined || req.query.limit !== undefined

    if (isPaginationRequested) {
      // Parse pagination parameters first (without applying defaults)
      const pageParam = req.query.page !== undefined ? parseInt(req.query.page) : null
      const limitParam = req.query.limit !== undefined ? parseInt(req.query.limit) : null

      // Validate parameters if they were provided
      if (pageParam !== null && (isNaN(pageParam) || pageParam < 1)) {
        return res.status(400).json({ error: 'Page must be greater than 0' })
      }
      if (limitParam !== null && (isNaN(limitParam) || limitParam < 1)) {
        return res.status(400).json({ error: 'Limit must be greater than 0' })
      }

      // Apply defaults after validation
      const page = pageParam || 1
      const limit = limitParam || 10
      const maxLimit = 100

      // Enforce maximum limit
      const effectiveLimit = Math.min(limit, maxLimit)

      // Calculate skip value for pagination
      const skip = (page - 1) * effectiveLimit

      // Get total count for pagination metadata
      const total = await Poem.countDocuments(filter)

      // Fetch paginated poems, sorted by date descending (newest first)
      const poems = await Poem.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(effectiveLimit)

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / effectiveLimit)
      const hasMore = page < totalPages

      // Return paginated response
      res.json({
        poems,
        total,
        page,
        limit: effectiveLimit,
        totalPages,
        hasMore
      })
    } else {
      // No pagination requested - return all poems as simple array (used for ranking calculation)
      // TODO: In the future, move ranking calculation to backend to avoid fetching all poems
      const poems = await Poem.find(filter).sort({ date: -1 })
      res.json(poems)
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// create poem
poemsRouter.post('/', userExtractor, async (req, res) => {
  const poem = req.body
  const { userId } = req

  const adminId = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

  const fakeUsers = [
    { id: 1, username: 'cathy2', name: 'Catherine Cawley', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/catherine-cawley.jpg' },
    { id: 2, username: 'StaceyCosgrove', name: 'Stacey Cosgrove', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/stacey-cosgrove.jpg' },
    { id: 3, username: 'sarahGR', name: 'Sarah Griffin', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/sarah-griffin.jpg' },
    { id: 4, username: 'rayson', name: 'Ray Higgins', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/ray-higgins.jpg' },
    { id: 5, username: 'typp', name: 'Ty Lue', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/ty-lue.jpg' },
    { id: 6, username: 'John Donne', name: 'John Donne', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/john-donne.jpg' },
    { id: 7, username: 'Walt Whitman', name: 'Walt Whitman', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/walt-whitman.jpg' },
  ]

  const fakeUser = (poem.userId && userId === adminId) ? fakeUsers.find(user => user.id === parseInt(poem.userId)) : null

  const user = await User.findById(userId)

  const newPoem = new Poem({
    ...poem,
    userId: (poem.userId && userId === adminId) ? poem.userId : user._id,
    author: (poem.userId && userId === adminId) ? fakeUser.username : user.username,
    picture: (poem.userId && userId === adminId) ? fakeUser.picture : user.picture,
  })
  try {
    const savedPoem = await newPoem.save()

    user.poems = user.poems.concat(savedPoem._id)
    await user.save()

    res.status(201)
    res.json(savedPoem)
  } catch {
    console.log('backend error')
    console.log(error)
  }
})

// add new property to all existing poems
poemsRouter.patch('/', async (req, res) => {
  const newProperty = req.body

  const response = await Poem.updateMany({}, { $set: newProperty });

  if (response === null) {
    return res.status(404).json({
      error: 'error'
    })
  }
  console.log(newProperty)
  res.status(204).end()
})

module.exports = poemsRouter

