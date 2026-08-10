const mongoose = require('mongoose')
const poemsRouter = require('express').Router()
const Poem = require('../models/Poem')
const Author = require('../models/Author')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')
const requireVerified = require('../middleware/requireVerified')
const { generatePoemSlug } = require('../utils/slugUtils')
const { computeRanking } = require('../utils/ranking')
const { normalizeGenre } = require('../utils/genre')
const { POEM_STATUS, PUBLISHED_MATCH, publishedOnly, normalizeStatus } = require('../utils/poemVisibility')
const { notifyMany, NOTIFICATION_TYPE } = require('../utils/notifications')
const { escapeRegex, MAX_REGEX_INPUT } = require('../utils/escapeRegex')
const Follow = require('../models/Follow')

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

// `Poem.likes` is `[String]` (author ids as strings) and every like comparison
// is strict, so a non-string entry would be a like nobody can ever remove.
// Only reachable from the admin seeding path — see the create handler.
function sanitizeLikes (likes) {
  if (!Array.isArray(likes)) return []
  return likes.filter(id => typeof id === 'string' && id.trim()).map(id => id.trim())
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

// Free-text search over poem titles and author names.
//
// The regex is deliberately UNANCHORED, which means it cannot use an index and
// scans the collection. That is the intended trade at this size: an anchored
// `^term` regex would use an index but would only match titles that START with
// the term, so searching "love" would miss "A Song of Love" — not what anyone
// means by search. A `$text` index is not an option either: it stems whole
// words, so the partial words produced by search-as-you-type ("lov") match
// nothing. If the collection outgrows a scan, the upgrade is Atlas Search, not
// an index on this query.
async function buildSearchCondition (q) {
  const rx = { $regex: escapeRegex(String(q).slice(0, MAX_REGEX_INPUT)), $options: 'i' }

  // Author names live in another collection, so matching them takes a second
  // query. Only _id is selected to keep it light. This $in grows with the
  // number of matching authors; it is fine at the current author count, and is
  // the other thing Atlas Search would replace.
  const authors = await Author.find({ $or: [{ name: rx }, { username: rx }] }).select('_id')

  const conditions = [{ title: rx }]
  if (authors.length > 0) {
    conditions.push({ authorId: { $in: authors.map((a) => a._id) } })
  }

  return { $or: conditions }
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
    returnedObject.author = author.name || author.username
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

// Author ranking, computed in the database instead of shipping every poem to the
// client. Points per author = poemsCount * poemPoints + totalLikes * likePoints.
// The weights are passed by the client (defaults 3 / 1) so tuning them needs no
// backend deploy. Declared before '/' so the literal path wins the route match.
poemsRouter.get('/ranking', async (req, res) => {
  try {
    const poemPoints = req.query.poemPoints !== undefined ? Number(req.query.poemPoints) : 3
    const likePoints = req.query.likePoints !== undefined ? Number(req.query.likePoints) : 1
    const limit = req.query.limit !== undefined ? parseInt(req.query.limit) : 10

    if (Number.isNaN(poemPoints) || Number.isNaN(likePoints) || Number.isNaN(limit) || limit < 1) {
      return res.status(400).json({ error: 'Invalid ranking parameters' })
    }
    const ranking = await computeRanking({ poemPoints, likePoints, limit, origin: req.query.origin })

    res.json(ranking)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Distance to jump per week. Prime, and far larger than any cluster of
// similarly-titled poems, so consecutive weeks land in unrelated parts of the
// collection. See the note at the skip below for why stepping by one failed.
const WEEK_STRIDE = 7919

// Poem of the week — one famous poem, rotating every Monday.
//
// Deterministic, not stored: the week number indexes into the famous poems, so
// every visitor sees the same poem all week, it changes on its own, and there is
// no cron job, no state and nothing to back up. A stored "current pick" would
// need a scheduler AND a fallback for when the scheduler misses.
//
// Week boundary: 1 Jan 1970 was a Thursday, so day 0 is a Thursday. Adding 3
// before dividing by 7 moves the boundary to Monday, which is what people mean
// by "this week".
function weekIndex (now = new Date()) {
  const day = Math.floor(now.getTime() / 86400000)
  return Math.floor((day + 3) / 7)
}

// Start of that week, as a plain date — the UI labels the section with it.
function weekStart (index) {
  return new Date((index * 7 - 3) * 86400000)
}

poemsRouter.get('/poem-of-the-week', async (req, res) => {
  try {
    // `origin` on the poem, not a join through the author: it is the same field
    // the list endpoint filters on, and it avoids an $in over 3,300 author ids.
    const filter = publishedOnly({ origin: 'famous' })

    const total = await Poem.countDocuments(filter)
    if (total === 0) return res.json({ poem: null })

    // Stride by a large prime instead of stepping one position per week.
    //
    // The collection is in TITLE order, so consecutive positions are
    // alphabetically adjacent: stepping by one produced eight straight weeks of
    // "Dear Mr. Fanelli", "Dear Mr. Merrill", "Dear One Absent...", "Dear
    // Proofreader" — different poets, but it reads as broken curation. A prime
    // stride jumps thousands of entries each week, and being coprime with most
    // totals it still walks the whole collection before repeating.
    // Keep these two separate. `week` identifies the WEEK and is what weekStart
    // must be given; `index` is a position in the collection. Passing the strided
    // index to weekStart dated the card to the year 2131.
    const week = weekIndex()
    const index = (week * WEEK_STRIDE) % total

    // Sorting by _id lets the seek walk the _id index rather than sorting 15k
    // documents in memory. Famous poems are ~97% of the collection, so the scan
    // rejects almost nothing on the way — no extra index is worth carrying for
    // one query a week.
    const poem = await Poem.findOne(filter)
      .sort({ _id: 1 })
      .skip(index)
      .populate('authorId', AUTHOR_FIELDS)

    // NOT serializePoem: that helper exists for raw aggregate output, where
    // `_id` is still present. This is a Mongoose document, whose toJSON has
    // already moved _id -> id, so serializing again read a field that was gone
    // and set `id: undefined` — which the frontend treats as "no poem" and
    // renders nothing at all.
    return res.json({
      poem: poem ? poem.toJSON() : null,
      weekStart: weekStart(week).toISOString().slice(0, 10)
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// `userExtractor.optional` rather than the strict one: this route is public, but
// it answers differently for a logged-in owner asking for their own drafts.
poemsRouter.get('/', userExtractor.optional, async (req, res) => {
  try {
    const filter = {}

    // The Drafts tab. Drafts are private, so this is the ONE way to read them
    // and it is scoped to the caller by the session, never by a query param.
    const wantsDrafts = String(req.query.status || '') === POEM_STATUS.DRAFT
    if (wantsDrafts && !req.userId) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    if (req.query.origin) {
      filter.origin = req.query.origin
    }

    // userId filter — check authorId (new) and legacy userId field (string or ObjectId)
    //
    // The validity check is not decoration: `new ObjectId('junk')` THROWS, and
    // the throw landed in this handler's catch-all, so `?userId=junk` answered
    // 500 Internal Server Error. Nothing internal went wrong — the request was
    // malformed, which is a 400. A 500 also reads as "the site is broken" in
    // logs and uptime monitoring, so it buries real failures among typos.
    if (req.query.userId && !wantsDrafts) {
      if (!mongoose.Types.ObjectId.isValid(String(req.query.userId))) {
        return res.status(400).json({ error: 'Invalid userId' })
      }
      const id = new mongoose.Types.ObjectId(String(req.query.userId))
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

    // ESCAPED, and length-capped — the third caller of this helper, and the one
    // that was still raw. The regex itself stays: it is anchored `^...$` with
    // `i`, which is how a request for `/Love` finds poems filed under `love`
    // (the collection holds mixed-case genres, and the frontend redirects the
    // URL casing but the API is called directly too).
    //
    // Raw, the anchors bought nothing: `?genre=.*` matched every genre, so the
    // one filter that is supposed to PARTITION the collection returned all of
    // it, and `(a+)+$` was catastrophic backtracking on a public,
    // unauthenticated endpoint over 16k documents. Same failure as `?letter=`,
    // found the same way — a shared helper that one call site never reached.
    if (req.query.genre) {
      const genre = escapeRegex(String(req.query.genre).slice(0, MAX_REGEX_INPUT))
      filter.genre = { $regex: `^${genre}$`, $options: 'i' }
    }

    // Search goes under $and rather than $or, because the userId filter above
    // already owns the top-level $or. Top-level keys are implicitly ANDed, so
    // the two compose: "poems by me" AND "matching this text".
    const q = String(req.query.q || '').trim()
    if (q) {
      filter.$and = [await buildSearchCondition(q)]
    }

    // Visibility is applied LAST, over the fully-composed filter, so no branch
    // above can accidentally leave it off. Both the countDocuments (`total`) and
    // the find below read this same object — a filtered total with an unfiltered
    // count would advertise the drafts it refused to show.
    if (wantsDrafts) {
      // Deliberately overrides anything `?userId=` or `?author=` set: a draft is
      // only ever readable by the author who wrote it.
      filter.authorId = new mongoose.Types.ObjectId(req.userId)
      filter.status = POEM_STATUS.DRAFT
    } else {
      Object.assign(filter, PUBLISHED_MATCH)
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

poemsRouter.post('/', userExtractor, requireVerified, async (req, res) => {
  const poemData = req.body
  const { userId } = req

  // A POEM NEEDS WORDS AND A NAME.
  //
  // `Poem` declares neither `title` nor `poem` as required, so the API happily
  // stored an empty one — which is not merely untidy: it is listed like any
  // other poem, it gets a detail page, it is emitted into the sitemap, and its
  // slug is derived from an absent title. The form has always required both, so
  // this only ever produced junk from direct API calls.
  //
  // Enforced HERE rather than with `required: true` on the schema, deliberately.
  // The like route mutates and `save()`s an existing document, and save runs
  // validators over the WHOLE document — so a schema rule would make any legacy
  // poem that happens to lack one of these fields impossible to like, turning a
  // write-path rule into a read-path outage on data nobody has audited. The
  // boundary is where the bad value enters.
  const title = typeof poemData.title === 'string' ? poemData.title.trim() : ''
  const body = typeof poemData.poem === 'string' ? poemData.poem.trim() : ''
  if (!title || !body) {
    return res.status(400).json({ error: 'A poem needs a title and a body' })
  }

  const adminId = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

  const isAdmin = userId === adminId

  // If admin posts with a userId override, use that author; otherwise use logged-in author
  const authorId = (poemData.userId && isAdmin)
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

  const slug = await buildUniqueSlug(title, author.name || author.username)

  // The dropdown constrains the UI only — this endpoint spreads the body into a
  // `strict: false` model, so an unvalidated genre would be stored verbatim and
  // the poem would land on a page with no category nav and no sitemap entry.
  const genre = normalizeGenre(poemData.genre)
  if (!genre.ok) {
    return res.status(400).json({ error: genre.error })
  }

  // An explicit allowlist, NOT `...poemData`. `Poem` is `strict: false`, so the
  // spread this replaces persisted every field the client chose to send —
  // including two that are supposed to be server-owned:
  //
  //   likes — the author ranking is `3×poems + 1×likes` (utils/ranking.js), so
  //           `POST /poems { likes: [...] }` bought points in the public
  //           sidebar directly, one request per fabricated like.
  //   date  — the sort key for every list and for the next-poem walk, so a
  //           future date pinned a poem to the top of the site indefinitely.
  //
  // The allowlist is the point: a field added to the form later is inert until
  // someone deliberately makes it writable, whereas a delete-list silently
  // admits whatever it was not updated to exclude.
  const newPoem = new Poem({
    // The TRIMMED values, so a title of spaces cannot slip past the check
    // above and then be stored verbatim.
    poem: body,
    title,
    genre: genre.genre,
    authorId: author._id,
    // Derived from the author, never the request — an ordinary poet must not be
    // able to file their poem under `famous`.
    origin: author.type || 'user',
    // Server clock for an ordinary poet: the form sends a client-formatted
    // "now" anyway, so nothing legitimate is lost, and a wrong or hostile
    // client clock no longer decides list order. The admin keeps the override
    // because they backdate seeded fake-poet content.
    date: isAdmin && poemData.date ? new Date(poemData.date) : new Date(),
    // Admin-gated for the same reason as the `userId` override above: the admin
    // seeds fake poems with a starting like count from this form. Everyone else
    // creates an unliked poem, whatever they asked for.
    likes: isAdmin ? sanitizeLikes(poemData.likes) : [],
    // Normalized rather than passed through: an unrecognised value would fail
    // schema validation as a 500, and "Save as draft" is the only caller that
    // sends anything but the default.
    status: normalizeStatus(poemData.status),
    slug
  })

  try {
    const savedPoem = await newPoem.save()

    author.poems = author.poems.concat(savedPoem._id)
    await author.save()

    // A poem created straight to published tells the author's followers. One
    // saved as a DRAFT does not — it tells them when it is published, from the
    // PATCH route, which is the only other place this fan-out lives.
    if (savedPoem.status !== POEM_STATUS.DRAFT) {
      const followers = await Follow.find({ following: author._id }).select('follower')
      await notifyMany({
        recipientIds: followers.map(f => f.follower),
        // The AUTHOR, not the requester: on the admin's post-on-behalf path
        // those differ, and the notification is about whose poem it is.
        actorId: author._id,
        type: NOTIFICATION_TYPE.NEW_POEM,
        poemId: savedPoem._id
      })
    }

    // Embed the freshly recomputed ranking so the client updates the sidebar in
    // the same round-trip (the new poem added POEM_POINTS to its author). Matches
    // the sidebar's origin:'user' view — see GET /ranking.
    const ranking = await computeRanking({ origin: 'user' })

    if (isLegacyUser) {
      // populate won't cross collections; build response manually
      const poemObj = savedPoem.toJSON()
      poemObj.author = author.name || author.username
      poemObj.authorName = author.name
      poemObj.picture = author.picture
      poemObj.userId = String(author._id)
      poemObj.authorSlug = author.slug
      delete poemObj.authorId
      return res.status(201).json({ ...poemObj, ranking })
    }

    const populated = await savedPoem.populate('authorId', AUTHOR_FIELDS)
    res.status(201).json({ ...populated.toJSON(), ranking })
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
module.exports.weekIndex = weekIndex
module.exports.weekStart = weekStart
module.exports.WEEK_STRIDE = WEEK_STRIDE
