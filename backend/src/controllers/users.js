const mongoose = require('mongoose')
const usersRouter = require('express').Router()
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const userExtractor = require('../middleware/userExtractor')
const { signAuthorToken, buildAuthorProfile } = require('../utils/authToken')
const { PUBLISHED_MATCH } = require('../utils/poemVisibility')

// TWO LEGACY ROUTES WERE REMOVED FROM HERE (2026-08-10). Both were dead —
// nothing in the frontend, the scripts or the Cypress specs called either —
// and both were public, over the deprecated `User` model:
//
//   GET /api/v1/users   listed every legacy user document, EMAIL INCLUDED, with
//                       no authentication. `User.toJSON` strips only
//                       `passwordHash`.
//   POST /api/v1/users  created an account anonymously: no auth, no rate limit,
//                       no validation, no email, no unique index beyond
//                       `username`. Unlimited document insertion into
//                       production by anyone who found it.
//
// Neither is worth hardening, because neither is used: the real equivalents are
// `POST /api/v1/register` (rate-limited, validated, case-insensitively unique)
// and the profile routes below. Deleted rather than gated, so there is nothing
// left to re-expose by loosening a middleware later.
//
// `User` itself still exists: poems.js falls back to it when an old poem's
// author id resolves to the `users` collection. That fallback is the only
// remaining reference.

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
