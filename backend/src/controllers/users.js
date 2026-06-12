const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const Author = require('../models/Author')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')
const { signAuthorToken } = require('../utils/authToken')

const DEFAULT_PICTURE = 'https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg'

usersRouter.get('/', async (req, res) => {
  try {
    const users = await User.find({}).populate('poems', 'poem date')
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

usersRouter.post('/', async (req, res) => {
  try {
    const { username, name, password } = req.body
    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = new User({
      username,
      name,
      passwordHash,
      picture: DEFAULT_PICTURE,
      poems: []
    })

    const savedUser = await newUser.save()
    res.status(201).json(savedUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'User creation failed' })
  }
})

usersRouter.get('/me', userExtractor, async (req, res) => {
  try {
    const author = await Author.findById(req.userId)
    if (!author) return res.status(404).json({ error: 'User not found' })

    res.json(signAuthorToken(author))
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({ error: 'Failed to refresh token' })
  }
})

usersRouter.patch('/profile', userExtractor, async (req, res) => {
  try {
    const ALLOWED = ['bio', 'preferredGenres', 'name', 'surname', 'city', 'country', 'birthYear', 'gender', 'website', 'privateFields']
    const update = {}
    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) update[field] = req.body[field]
    }

    const author = await Author.findByIdAndUpdate(req.userId, update, { new: true })
    if (!author) return res.status(404).json({ error: 'User not found' })

    const newToken = signAuthorToken(author)

    res.json({ token: newToken, author })
  } catch (error) {
    console.error('Profile update error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Accepts { picture: "data:image/jpeg;base64,..." } — resized client-side
usersRouter.patch('/picture', userExtractor, async (req, res) => {
  try {
    const { picture } = req.body

    if (!picture || !picture.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' })
    }

    const author = await Author.findByIdAndUpdate(
      req.userId,
      { picture },
      { new: true }
    )

    // No need to update poems — picture comes from Author via populate
    const newToken = signAuthorToken(author)

    res.json({ token: newToken, picture })
  } catch (error) {
    console.error('Picture update error:', error)
    res.status(500).json({ error: 'Failed to update profile picture' })
  }
})

module.exports = usersRouter
