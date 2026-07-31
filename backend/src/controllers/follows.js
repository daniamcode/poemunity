const followsRouter = require('express').Router()
const Follow = require('../models/Follow')
const userExtractor = require('../middleware/userExtractor')
const { notify, NOTIFICATION_TYPE } = require('../utils/notifications')
const {
  FOLLOW_AUTHOR_FIELDS,
  resolveAuthorRef,
  toObjectId,
  followCounts,
  serializeFollowAuthor
} = require('../utils/follows')

// Mounted on /api/v1/authors, BEFORE the authors router, so these specific
// paths win the match before any future `/:slug/...` catch-all there.
//
//   POST   /api/v1/authors/:idOrSlug/follow      (auth)
//   DELETE /api/v1/authors/:idOrSlug/follow      (auth)
//   GET    /api/v1/authors/:idOrSlug/followers   (public, paginated)
//   GET    /api/v1/authors/:idOrSlug/following   (public, paginated)

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function parsePagination (req) {
  const pageParam = req.query.page !== undefined ? parseInt(req.query.page) : null
  const limitParam = req.query.limit !== undefined ? parseInt(req.query.limit) : null

  if (pageParam !== null && (isNaN(pageParam) || pageParam < 1)) {
    return { error: 'Page must be greater than 0' }
  }
  if (limitParam !== null && (isNaN(limitParam) || limitParam < 1)) {
    return { error: 'Limit must be greater than 0' }
  }

  const page = pageParam || 1
  const limit = Math.min(limitParam || DEFAULT_LIMIT, MAX_LIMIT)
  return { page, limit, skip: (page - 1) * limit }
}

// One handler for both directions. `field` is the side of the edge that is
// PINNED to the author being asked about; `populated` is the other end — the
// author whose row is actually rendered. Writing this twice is how the two
// lists drift into different orderings and different page shapes.
function listFollows ({ field, populated }) {
  return async (req, res) => {
    try {
      const author = await resolveAuthorRef(req.params.idOrSlug)
      if (!author) return res.status(404).json({ error: 'Author not found' })

      const { error, page, limit, skip } = parsePagination(req)
      if (error) return res.status(400).json({ error })

      const filter = { [field]: author._id }
      const total = await Follow.countDocuments(filter)
      const rows = await Follow.find(filter)
        // Newest follow first, `_id` breaking ties. Batch-created edges share a
        // createdAt to the millisecond, and an arbitrary tie-break makes
        // pagination lose and repeat rows across page boundaries.
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .populate(populated, FOLLOW_AUTHOR_FIELDS)

      const authors = rows
        .map(row => serializeFollowAuthor(row[populated], row.createdAt))
        // An edge whose author document is gone populates to null. Dropping the
        // row is right (there is nothing to render and nowhere to link), and it
        // is why `total` can exceed `authors.length` on the last page.
        .filter(Boolean)

      const totalPages = Math.ceil(total / limit)
      res.json({
        authors,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
}

followsRouter.get('/:idOrSlug/followers', listFollows({ field: 'following', populated: 'follower' }))
followsRouter.get('/:idOrSlug/following', listFollows({ field: 'follower', populated: 'following' }))

followsRouter.post('/:idOrSlug/follow', userExtractor, async (req, res) => {
  try {
    const author = await resolveAuthorRef(req.params.idOrSlug)
    if (!author) return res.status(404).json({ error: 'Author not found' })

    // req.userId is a string out of a JSON-serialized JWT; author._id is an
    // ObjectId. `===` between them is always false, which would silently make
    // self-follow legal.
    if (String(author._id) === String(req.userId)) {
      return res.status(400).json({ error: 'You cannot follow yourself' })
    }

    const follower = toObjectId(req.userId)
    if (!follower) return res.status(400).json({ error: 'Invalid session' })

    try {
      // Built from EXPLICIT fields. `follower` comes from the session and
      // nothing else in req.body is read at all — a body-supplied follower
      // would let anyone create follows in another user's name.
      await Follow.create({ follower, following: author._id })
    } catch (err) {
      // Already following (possibly because the user double-clicked, possibly
      // because two requests raced and the unique index rejected the loser).
      // Either way the requested state is the current state, so this is a
      // success, not a 409: `register` maps E11000 to a conflict because a
      // taken username is genuinely somebody else's; a follow you already have
      // is your own.
      if (!err || err.code !== 11000) throw err
    }

    // After the edge exists, so a follow that failed never announces itself.
    // Safe on the idempotent path too: a repeat follow collapses into the same
    // unread row rather than stacking another (see utils/notifications.js), so
    // someone toggling follow cannot use it to poke you.
    await notify({
      recipientId: author._id,
      actorId: req.userId,
      type: NOTIFICATION_TYPE.FOLLOW
    })

    res.json({ following: true, ...(await followCounts(author._id)) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

followsRouter.delete('/:idOrSlug/follow', userExtractor, async (req, res) => {
  try {
    const author = await resolveAuthorRef(req.params.idOrSlug)
    if (!author) return res.status(404).json({ error: 'Author not found' })

    const follower = toObjectId(req.userId)
    if (!follower) return res.status(400).json({ error: 'Invalid session' })

    // Idempotent for the same reason follow is: unfollowing something you do
    // not follow leaves you in exactly the state you asked for.
    await Follow.deleteOne({ follower, following: author._id })

    res.json({ following: false, ...(await followCounts(author._id)) })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = followsRouter
