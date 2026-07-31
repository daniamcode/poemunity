const mongoose = require('mongoose')
const poemRouter = require('express').Router()
const Poem = require('../models/Poem')
const Author = require('../models/Author')
const findPoemById = require('../middleware/findPoemById')
const userExtractor = require('../middleware/userExtractor')
const { computeRanking } = require('../utils/ranking')
const { normalizeGenre } = require('../utils/genre')
const {
  POEM_STATUS,
  publishedOnly,
  isDraft,
  normalizeStatus,
  canReadPoem
} = require('../utils/poemVisibility')

const AUTHOR_FIELDS = 'name slug picture username'

// A poem is addressable by ObjectId or by slug. Both GET /:poemId and
// GET /:poemId/next resolve the same way, so the lookup lives here once.
async function findPoemByIdOrSlug (poemId, { populate = true } = {}) {
  const withAuthor = (query) => (populate ? query.populate('authorId', AUTHOR_FIELDS) : query)

  let poem
  if (mongoose.Types.ObjectId.isValid(poemId)) {
    poem = await withAuthor(Poem.findById(poemId))
  }
  if (!poem) {
    poem = await withAuthor(Poem.findOne({ slug: poemId }))
  }
  // Last resort: a slug this poem used to have. Cleaning the scraped titles
  // changed 1,899 slugs that were already public, so old links keep working —
  // the page then canonicalises to the current slug, which is how the new URL
  // eventually replaces the old one in search results.
  if (!poem) {
    poem = await withAuthor(Poem.findOne({ slugHistory: poemId }))
  }
  return poem || null
}

// ---------------------------------------------------------------------------
// Next poem (GET /:poemId/next)
//
// ONE rule, the same on every screen and from every entry point: continue with
// the poem's author, and when that author is exhausted open the next author
// alphabetically at their newest poem. After the last author it wraps to the
// first, so the walk is an endless loop with no dead ends.
//
// It deliberately ignores where the reader came from. An earlier version
// followed the list you were browsing (genre lists walked genres, author pages
// walked authors) and upgraded the link client-side from the Redux list cache.
// That meant the same poem offered different "next" links depending on your
// history, and a refresh silently changed the answer. One rule is worth more
// than the context-sensitivity was.
//
// Two orderings, both fixed:
//   * within an author — date DESC, _id DESC as tie-break
//   * between authors  — display name ASC, _id ASC as tie-break
//
// Neither tie-break is decoration. Poems seeded in one batch share an identical
// `date`, and two poets can share a display name; without the second key "next"
// is ambiguous and the walk can ping-pong between two records forever.
//
// Authors PARTITION the collection — every poem has exactly one — which is why
// one lap visits every poem exactly once before repeating.
//
// Legacy poems with no `date` are the trap. BSON sorts null/missing lowest so a
// `date: -1` sort puts them last, but MongoDB range operators never compare
// across BSON types, so `{ date: { $lt: <a Date> } }` does NOT match a missing
// date. Left unhandled the undated tail would be unreachable, so it is named.
//
// Poems with no author are SKIPPED as destinations (a product decision): they
// belong to no bucket, so the walk cannot place them. Landing ON one is still
// handled — it starts you at the first author rather than dead-ending.
// ---------------------------------------------------------------------------

const TOTAL_ORDER = { date: -1, _id: -1 }

function strictlyAfter (poem) {
  const { date, _id: id } = poem

  if (!date) {
    // Undated poems already sort last; only another undated poem with a smaller
    // _id comes after this one. (`date: null` matches null AND missing.)
    return { date: null, _id: { $lt: id } }
  }

  return {
    $or: [
      { date: { $lt: date } },
      { date, _id: { $lt: id } },
      // Every undated poem sorts after every dated one.
      { date: null }
    ]
  }
}

// Drafts are never destinations: the walk is the public reading path, and it is
// applied here rather than at the three call sites so a new one cannot forget.
function findNext (filter) {
  return Poem.findOne(publishedOnly(filter)).sort(TOTAL_ORDER).populate('authorId', AUTHOR_FIELDS)
}

// Authors that actually HAVE poems, walked alphabetically. Derived from the
// poems rather than the authors collection, so an empty author cannot exist and
// the walk can never stall on one. Drafts do not count towards "has poems" — an
// author with nothing but drafts is not a stop on the public walk, and including
// them would hand every reader a step that findNext then refuses to fill.
async function firstAuthorAfter (match) {
  const [row] = await Poem.aggregate([
    { $match: publishedOnly({ authorId: { $type: 'objectId' } }) },
    { $group: { _id: '$authorId' } },
    { $lookup: { from: 'authors', localField: '_id', foreignField: '_id', as: 'author' } },
    { $unwind: '$author' },
    // Display name, matching how Poem.toJSON derives `author`.
    { $project: { sortKey: { $toLower: { $ifNull: ['$author.name', '$author.username'] } } } },
    { $match: match },
    { $sort: { sortKey: 1, _id: 1 } },
    { $limit: 1 }
  ])
  return row ? { id: row._id, sortKey: row.sortKey } : null
}

async function authorOf (poem) {
  if (!poem.authorId) return null
  const author = await Author.findById(poem.authorId).select('name username')
  if (!author) return null
  return {
    id: poem.authorId,
    sortKey: String(author.name || author.username || '').toLowerCase()
  }
}

poemRouter.get('/:poemId/next', userExtractor.optional, async (req, res) => {
  let current
  try {
    current = await findPoemByIdOrSlug(req.params.poemId, { populate: false })
  } catch (error) {
    current = null
  }

  // Same answer as GET /:poemId for a draft — 404 to everyone but its author.
  // A different status here would turn this route into an oracle for whether a
  // guessed draft slug exists.
  if (!current || !canReadPoem(current, req.userId)) {
    return res.status(404).json({ error: 'poem not found' })
  }

  try {
    const author = await authorOf(current)

    // 1. Continue with this author.
    if (author) {
      const sameAuthor = await findNext({ authorId: author.id, ...strictlyAfter(current) })
      if (sameAuthor) return res.json({ poem: sameAuthor })
    }

    // 2. Author exhausted (or this poem has none) — open the next author
    //    alphabetically at their newest poem. With no author to start from, the
    //    walk begins at the first author rather than dead-ending.
    const next = author
      ? await firstAuthorAfter({
          $or: [
            { sortKey: { $gt: author.sortKey } },
            { sortKey: author.sortKey, _id: { $gt: author.id } }
          ]
        })
      : await firstAuthorAfter({})

    if (next) {
      const firstOfNext = await findNext({ authorId: next.id })
      if (firstOfNext && String(firstOfNext._id) !== String(current._id)) {
        return res.json({ poem: firstOfNext })
      }
    }

    // 3. Last author — wrap to the first. If that lands back on this poem, the
    //    collection holds nothing else to show and the card hides itself: the
    //    only case where it is hidden.
    const first = await firstAuthorAfter({})
    if (first) {
      const firstOfAll = await findNext({ authorId: first.id })
      if (firstOfAll && String(firstOfAll._id) !== String(current._id)) {
        return res.json({ poem: firstOfAll })
      }
    }

    return res.json({ poem: null })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resolve next poem' })
  }
})

// Declared after /:poemId/next so the single-segment param route can never
// shadow it.
poemRouter.get('/:poemId', userExtractor.optional, async (req, res) => {
  try {
    const poem = await findPoemByIdOrSlug(req.params.poemId)

    // 404, not 403: a draft is invisible, and "forbidden" would confirm that a
    // poem exists at that slug. The author (and the admin) still read it here —
    // that is what makes the Drafts tab's edit/preview work.
    if (!poem || !canReadPoem(poem, req.userId)) {
      return res.status(404).json({ error: 'poem not found' })
    }
    return res.json(poem)
  } catch (error) {
    return res.status(404).json({ error: 'poem not found' })
  }
})

// like poem
poemRouter.put('/:poemId', userExtractor, findPoemById, async (req, res) => {
  const { poem } = req

  // Nobody can see a draft, so nobody can like one — including its author, whose
  // own like would otherwise show up in the ranking before the poem is public.
  if (isDraft(poem)) {
    return res.status(404).json({ error: 'poem not found' })
  }

  if (poem.likes.some((id) => id === req.userId)) {
    poem.likes.splice(poem.likes.indexOf(req.userId), 1)
  } else {
    poem.likes.push(req.userId)
  }

  try {
    await poem.save()
    // Embed the recomputed ranking so the client refreshes the sidebar in the same
    // request — a like changes the poem author's points. Matches the sidebar's
    // origin:'user' view (see GET /ranking).
    const ranking = await computeRanking({ origin: 'user' })
    res.json({ ...poem.toJSON(), ranking })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update poem' })
  }
})

const isOwnerOrAdmin = (req, res, next) => {
  const { poem, userId } = req
  const adminId = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

  if (String(poem.authorId) !== userId && userId !== adminId) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

const ALLOWED_PATCH_FIELDS = ['poem', 'title', 'genre', 'date', 'likes', 'origin', 'userId', 'status']

// modify poem — also the publish/unpublish route (`{ status }`), which is why it
// is owner-gated and why it can return a ranking.
poemRouter.patch('/:poemId', userExtractor, findPoemById, isOwnerOrAdmin, async (req, res) => {
  const doc = req.poem

  const update = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => ALLOWED_PATCH_FIELDS.includes(key))
  )

  if (update.status !== undefined) {
    update.status = normalizeStatus(update.status)
  }

  // Same rule as creation: an edit must not be a way around genre validation.
  if (update.genre !== undefined) {
    const genre = normalizeGenre(update.genre)
    if (!genre.ok) {
      return res.status(400).json({ error: genre.error })
    }
    update.genre = genre.genre
  }

  // Publishing and unpublishing move the author's poem count, so they move their
  // ranking points — the same reason create/delete/like embed a fresh ranking
  // (see AGENTS.md). An edit that does not cross that line still carries none.
  const statusChanged =
    update.status !== undefined &&
    update.status !== (doc.status || POEM_STATUS.PUBLISHED)

  try {
    const updated = await Poem.findByIdAndUpdate(
      doc._id,
      { $set: update },
      { new: true }
    ).populate('authorId', AUTHOR_FIELDS)

    if (!statusChanged) {
      return res.json(updated)
    }

    const ranking = await computeRanking({ origin: 'user' })
    res.json({ ...updated.toJSON(), ranking })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update poem' })
  }
})

poemRouter.delete('/:poemId', userExtractor, findPoemById, isOwnerOrAdmin, async (req, res) => {
  const { poem } = req

  try {
    const response = await Poem.findByIdAndDelete(poem._id)
    if (response === null) {
      return res.status(404).json({
        error: 'poem not found or not deleted'
      })
    }

    // Return the recomputed ranking (the author lost this poem's points) so the
    // client refreshes the sidebar without a second call. This replaces the old
    // 204 No Content. Matches the sidebar's origin:'user' view (see GET /ranking).
    const ranking = await computeRanking({ origin: 'user' })
    res.json({ ranking })
  } catch (error) {
    return res.status(404).json({
      error: 'poem not found or not deleted'
    })
  }
})

module.exports = poemRouter
