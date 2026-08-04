const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const usersRouter = require('express').Router()
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')
const { signAuthorToken, buildAuthorProfile } = require('../utils/authToken')
const { PUBLISHED_MATCH } = require('../utils/poemVisibility')

const DEFAULT_PICTURE = 'https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg'

// Maps common image mime types to file extensions for the blob pathname.
const MIME_EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg'
}

// Persists a profile picture supplied as a base64 data URL.
// When BLOB_READ_WRITE_TOKEN is configured, the image is decoded and uploaded
// to Vercel Blob and a public CDN URL is returned. Otherwise (tests / local dev
// without blob configured) the original base64 data URL is stored as-is.
async function storePicture (dataUrl, userId) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return dataUrl
  }

  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(dataUrl)
  if (!match) {
    return dataUrl
  }

  const contentType = match[1]
  const buffer = Buffer.from(match[2], 'base64')
  const ext = MIME_EXTENSIONS[contentType] || 'jpg'
  const pathname = `avatars/${userId}-${Date.now()}.${ext}`

  // Lazy-require so environments without blob configured (tests / local dev)
  // never load @vercel/blob's undici dependency at module load time.
  const { put } = require('@vercel/blob')
  const blob = await put(pathname, buffer, { access: 'public', contentType })
  return blob.url
}

usersRouter.get('/', async (req, res) => {
  try {
    // Legacy route over the legacy User model, but it still dereferences poem
    // ids — so it gets the same visibility match as every other public read.
    const users = await User.find({}).populate({ path: 'poems', select: 'poem date', match: PUBLISHED_MATCH })
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

// GET /api/v1/users/stats — the profile stats panel.
//
// Deliberately returns TWO numbers and no rank. The rank the panel shows comes
// from the ranking already cached client-side (`GET /poems/ranking`, fetched
// once app-wide), because that is the only way the number can be guaranteed to
// agree with the public sidebar — computing "your rank" here from a second
// aggregation would let the two disagree after any mutation, and would put
// computeRanking()'s full-collection $group on every profile load. See TODO.md.
//
// Both numbers count PUBLISHED poems only, matching the ranking's basis and the
// public poem count on the author page. The edge that makes this a real choice
// rather than a formality: a poem can be liked while public and then withdrawn
// to a draft, so its likes exist but are no longer part of anything visible.
// Counting them would show a poet likes that no reader can find.
usersRouter.get('/stats', userExtractor, async (req, res) => {
  try {
    const [stats] = await Poem.aggregate([
      { $match: { authorId: new mongoose.Types.ObjectId(String(req.userId)), ...PUBLISHED_MATCH } },
      {
        $group: {
          _id: null,
          poemsPublished: { $sum: 1 },
          // $ifNull because `likes` is absent on older poems, and $size throws
          // on a missing field rather than treating it as empty.
          likesReceived: { $sum: { $size: { $ifNull: ['$likes', []] } } }
        }
      }
    ])

    // A poet with nothing published aggregates to NO rows, not a row of zeroes.
    res.json({
      poemsPublished: stats?.poemsPublished ?? 0,
      likesReceived: stats?.likesReceived ?? 0
    })
  } catch (error) {
    console.error('Stats error:', error)
    res.status(500).json({ error: 'Failed to load stats' })
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

// Full, DB-fresh profile for the authenticated user. This is the source of
// truth for the client's AppContext (picture, birthYear, …) — the JWT no
// longer carries these fields, so display data never goes stale.
usersRouter.get('/profile', userExtractor, async (req, res) => {
  try {
    const author = await Author.findById(req.userId)
    if (!author) return res.status(404).json({ error: 'User not found' })

    res.json(buildAuthorProfile(author))
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to load profile' })
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

    const storedPicture = await storePicture(picture, req.userId)

    const author = await Author.findByIdAndUpdate(
      req.userId,
      { picture: storedPicture },
      { new: true }
    )

    // No need to update poems — picture comes from Author via populate
    const newToken = signAuthorToken(author)

    res.json({ token: newToken, picture: storedPicture })
  } catch (error) {
    console.error('Picture update error:', error)
    res.status(500).json({ error: 'Failed to update profile picture' })
  }
})

module.exports = usersRouter
