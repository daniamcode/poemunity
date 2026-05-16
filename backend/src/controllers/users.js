const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const Author = require('../models/Author')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')

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

usersRouter.patch('/profile', userExtractor, async (req, res) => {
  try {
    const { bio, preferredGenres } = req.body

    const update = {}
    if (bio !== undefined) update.bio = bio
    if (preferredGenres !== undefined) update.preferredGenres = preferredGenres

    const author = await Author.findByIdAndUpdate(req.userId, update, { new: true })
    if (!author) return res.status(404).json({ error: 'User not found' })

    const newToken = jwt.sign(
      {
        id: author._id,
        username: author.username,
        picture: author.picture,
        bio: author.bio || '',
        preferredGenres: author.preferredGenres || []
      },
      process.env.SECRET,
      { expiresIn: 60 * 60 * 24 * 7 }
    )

    res.json({ token: newToken, bio: author.bio, preferredGenres: author.preferredGenres })
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
    const newToken = jwt.sign(
      { id: author._id, username: author.username, picture },
      process.env.SECRET,
      { expiresIn: 60 * 60 * 24 * 7 }
    )

    res.json({ token: newToken, picture })
  } catch (error) {
    console.error('Picture update error:', error)
    res.status(500).json({ error: 'Failed to update profile picture' })
  }
})

module.exports = usersRouter
