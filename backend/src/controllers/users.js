const jwt = require('jsonwebtoken')
const usersRouter = require('express').Router()
const Author = require('../models/Author')
const userExtractor = require('../middleware/userExtractor')

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
