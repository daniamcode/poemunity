const notificationsRouter = require('express').Router()
const mongoose = require('mongoose')
const Notification = require('../models/Notification')
const Author = require('../models/Author')
const userExtractor = require('../middleware/userExtractor')
const { NOTIFICATION_TYPES } = require('../models/Notification')

// Everything here is private to the signed-in user, so every route is behind
// userExtractor and every query is scoped by `recipient: req.userId` — never by
// a query parameter. Same rule as the Drafts tab: a private list scoped by
// anything the client can name is not private.

// The panel is a dropdown, not a page: ten rows fill it without turning it into
// something you scroll. "Show more" pages through the rest, so nothing is
// hidden — only fewer things are loaded before you ask.
const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

const ACTOR_FIELDS = 'name username slug picture type'
const POEM_FIELDS = 'title slug'
const PROFILE_FIELDS = 'slug name username'

function recipientId (req) {
  return new mongoose.Types.ObjectId(String(req.userId))
}

// GET /api/v1/notifications?page=&limit=
notificationsRouter.get('/', userExtractor, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT)

    const filter = { recipient: recipientId(req) }

    // ONE query, not two. This used to run a `countDocuments` alongside the
    // find, purely to compute `hasMore` — a second round trip on every panel
    // open, on a serverless backend, for a total nothing renders. Asking for
    // one row MORE than the page size answers the same question: if it comes
    // back, there is another page.
    //
    // The cost of that choice is that `total` is no longer known, so there is
    // no "37 notifications" to display. Nothing wants one; if something ever
    // does, bring the count back rather than guessing from the page count.
    const rows = await Notification.find(filter)
      // updatedAt, not createdAt: a collapse updates in place, and ordering by
      // creation would leave a poem that gathered fifty likes this morning
      // wherever its first like landed last week.
      .sort({ updatedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)
      .populate('actors', ACTOR_FIELDS)
      .populate('poem', POEM_FIELDS)
      // The author page a profile comment or reply happened on. Served, not
      // derived: the client builds a slug from the username, while the real one
      // comes from the display NAME and gains a numeric suffix on collision, so
      // a guessed URL 404s for anyone whose slug was ever contested. It is a
      // field of its own rather than the recipient, because a reply on somebody
      // else's page is addressed to you but LIVES on theirs.
      .populate('profile', PROFILE_FIELDS)

    const hasMore = rows.length > limit
    // The probe row is NOT part of the page — returning it would render an
    // eleventh row on a ten-row page and then show it again on page two.
    const notifications = hasMore ? rows.slice(0, limit) : rows

    res.json({ notifications, page, limit, hasMore })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/notifications/unread-count — the header bell.
//
// Declared before any parameterised route so the literal path wins the match,
// and kept separate from the list because the bell renders on every page while
// the list renders on one.
notificationsRouter.get('/unread-count', userExtractor, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ recipient: recipientId(req), read: false })
    res.json({ count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// POST /api/v1/notifications/read — mark as read.
//
// Takes optional `ids`; with none, marks everything read (opening the panel).
// It is a POST rather than a PATCH on each row because the panel marks what the
// user just saw in one go, and a request per visible row would be a dozen
// round-trips for one glance.
notificationsRouter.post('/read', userExtractor, async (req, res) => {
  try {
    const filter = { recipient: recipientId(req), read: false }

    if (Array.isArray(req.body?.ids) && req.body.ids.length > 0) {
      // The recipient scope above still applies, so a caller naming somebody
      // else's notification ids marks nothing — the ids narrow the query, they
      // never widen it.
      filter._id = {
        $in: req.body.ids
          .filter(id => mongoose.Types.ObjectId.isValid(String(id)))
          .map(id => new mongoose.Types.ObjectId(String(id)))
      }
    }

    const result = await Notification.updateMany(filter, { $set: { read: true } })
    const count = await Notification.countDocuments({ recipient: recipientId(req), read: false })

    res.json({ updated: result.modifiedCount ?? 0, unreadCount: count })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/v1/notifications/preferences
notificationsRouter.get('/preferences', userExtractor, async (req, res) => {
  try {
    const author = await Author.findById(req.userId).select('notificationPrefs')
    if (!author) return res.status(404).json({ error: 'Author not found' })

    // Built explicitly with `!== false` rather than returned raw: every author
    // predates the field, so the raw value is `undefined` for most of them and
    // the client would render every toggle off while the server happily
    // notifies. Absent means ON, in exactly one place.
    const prefs = Object.fromEntries(
      NOTIFICATION_TYPES.map(type => [type, author.notificationPrefs?.[type] !== false])
    )
    res.json(prefs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// PATCH /api/v1/notifications/preferences { like?, comment?, follow?, newPoem? }
notificationsRouter.patch('/preferences', userExtractor, async (req, res) => {
  try {
    const author = await Author.findById(req.userId)
    if (!author) return res.status(404).json({ error: 'Author not found' })

    // An allowlist, and only booleans — the same rule the poem write routes
    // learned. A key outside NOTIFICATION_TYPES is dropped rather than 400'd,
    // so a settings form that grows a field does not break saving.
    for (const type of NOTIFICATION_TYPES) {
      if (typeof req.body?.[type] === 'boolean') {
        author.notificationPrefs = author.notificationPrefs || {}
        author.notificationPrefs[type] = req.body[type]
      }
    }
    await author.save()

    const prefs = Object.fromEntries(
      NOTIFICATION_TYPES.map(type => [type, author.notificationPrefs?.[type] !== false])
    )
    res.json(prefs)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = notificationsRouter
