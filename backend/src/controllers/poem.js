const mongoose = require('mongoose')
const poemRouter = require('express').Router()
const Poem = require('../models/Poem')
const Author = require('../models/Author')
const findPoemById = require('../middleware/findPoemById')
const userExtractor = require('../middleware/userExtractor')
const { computeRanking } = require('../utils/ranking')

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
  return poem || null
}

// ---------------------------------------------------------------------------
// Next poem (GET /:poemId/next)
//
// The control follows the DIMENSION the reader is browsing and never changes
// it. A dimension is what you are browsing by — `genre` or `author`. A bucket is
// one value of it (the Love genre; Marta Ruiz). Buckets PARTITION the
// collection: every poem has exactly one author and exactly one genre. That
// partition is the whole reason one lap visits every poem exactly once.
//
// Within a bucket, poems are ordered by ONE total order: date DESC, _id DESC as
// tie-break. The tie-break is not decoration — poems seeded in the same batch
// share an identical `date`, and with `date` alone "next" would ping-pong
// between two of them forever.
//
// "Strictly after the current poem" in that order is:
//   date < cur.date  OR  (date == cur.date AND _id < cur._id)
//
// Legacy poems with no `date` are the trap here. BSON sorts null/missing lowest,
// so a `date: -1` sort puts them at the very end — but MongoDB's range operators
// never compare across BSON types, so `{ date: { $lt: <a Date> } }` does NOT
// match a missing/null date. Left unhandled, a dated poem would find nothing
// after it and the undated tail would be unreachable, so it is named explicitly.
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

function escapeRegex (value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function findNext (filter) {
  return Poem.findOne(filter).sort(TOTAL_ORDER).populate('authorId', AUTHOR_FIELDS)
}

// --- Bucket navigation -------------------------------------------------------
//
// Each dimension knows how to (a) name the bucket a poem belongs to, (b) match
// every poem in a bucket, and (c) walk bucket names ALPHABETICALLY. Buckets are
// derived from the poems themselves, so an empty bucket cannot exist and the
// walk can never stall on one.
//
// Bucket keys are lowercased so that 'Love' and 'love' are ONE bucket. If they
// were two, membership (matched case-insensitively, mirroring the list filter in
// poems.js) would overlap them, the partition would break, and with it the
// visit-everything-once guarantee.

async function firstGenreBucket (match) {
  const [row] = await Poem.aggregate([
    { $match: { genre: { $type: 'string', $ne: '' } } },
    { $group: { _id: { $toLower: '$genre' } } },
    { $match: match },
    { $sort: { _id: 1 } },
    { $limit: 1 }
  ])
  return row ? { value: row._id } : null
}

async function firstAuthorBucket (match) {
  const [row] = await Poem.aggregate([
    { $match: { authorId: { $type: 'objectId' } } },
    { $group: { _id: '$authorId' } },
    { $lookup: { from: 'authors', localField: '_id', foreignField: '_id', as: 'author' } },
    { $unwind: '$author' },
    // Display name, matching how Poem.toJSON derives `author`.
    { $project: { sortKey: { $toLower: { $ifNull: ['$author.name', '$author.username'] } } } },
    { $match: match },
    // Two poets can share a display name, so _id breaks the tie and keeps the
    // bucket walk a strict total order of its own.
    { $sort: { sortKey: 1, _id: 1 } },
    { $limit: 1 }
  ])
  return row ? { id: row._id, sortKey: row.sortKey } : null
}

const DIMENSIONS = {
  genre: {
    async bucketOf (poem) {
      const genre = typeof poem.genre === 'string' ? poem.genre.trim() : ''
      return genre ? { value: genre.toLowerCase() } : null
    },
    members (bucket) {
      return { genre: { $regex: `^${escapeRegex(bucket.value)}$`, $options: 'i' } }
    },
    nextBucket (bucket) {
      return firstGenreBucket({ _id: { $gt: bucket.value } })
    },
    firstBucket () {
      return firstGenreBucket({})
    }
  },

  author: {
    async bucketOf (poem) {
      if (!poem.authorId) return null
      const author = await Author.findById(poem.authorId).select('name username')
      if (!author) return null
      return {
        id: poem.authorId,
        sortKey: String(author.name || author.username || '').toLowerCase()
      }
    },
    members (bucket) {
      return { authorId: bucket.id }
    },
    nextBucket (bucket) {
      return firstAuthorBucket({
        $or: [
          { sortKey: { $gt: bucket.sortKey } },
          { sortKey: bucket.sortKey, _id: { $gt: bucket.id } }
        ]
      })
    },
    firstBucket () {
      return firstAuthorBucket({})
    }
  }
}

poemRouter.get('/:poemId/next', async (req, res) => {
  let current
  try {
    current = await findPoemByIdOrSlug(req.params.poemId, { populate: false })
  } catch (error) {
    current = null
  }

  if (!current) {
    return res.status(404).json({ error: 'poem not found' })
  }

  // No ?dimension= means the reader has no browsing context — a direct link, a
  // refresh, a crawler. Default to genre and walk genres alphabetically from
  // this poem's own.
  const dimension = DIMENSIONS[req.query.dimension] || DIMENSIONS.genre

  try {
    const after = strictlyAfter(current)
    const bucket = await dimension.bucketOf(current)

    // Safety net: a poem with no genre (or no resolvable author) belongs to no
    // bucket. Rather than drop out of the walk entirely, it degrades to the
    // plain global date order. Scope is 'next-bucket' so the card labels itself
    // from the DESTINATION poem, which does have a bucket.
    if (!bucket) {
      const anywhere = await findNext(after)
      if (anywhere) return res.json({ poem: anywhere, scope: 'next-bucket' })

      const newest = await findNext({})
      if (newest && String(newest._id) !== String(current._id)) {
        return res.json({ poem: newest, scope: 'wrap' })
      }
      return res.json({ poem: null, scope: null })
    }

    // 1. Continue the current bucket.
    const sameBucket = await findNext({ ...dimension.members(bucket), ...after })
    if (sameBucket) return res.json({ poem: sameBucket, scope: 'same-bucket' })

    // 2. Bucket exhausted — open the next one alphabetically at its first poem.
    //    "First" is first in the SAME total order, i.e. the newest. Note the
    //    deliberate inconsistency: a fresh bucket is always entered by date even
    //    when the list the reader came from was ordered by likes or title.
    //    Honouring those would mean re-running the ranking aggregate per hop.
    const next = await dimension.nextBucket(bucket)
    if (next) {
      const firstOfNext = await findNext(dimension.members(next))
      if (firstOfNext) return res.json({ poem: firstOfNext, scope: 'next-bucket' })
    }

    // 3. Last bucket — wrap round to the first bucket alphabetically. If that
    //    lands back on this poem the collection holds nothing else, and the
    //    frontend hides the control: the only case where it is hidden.
    const first = await dimension.firstBucket()
    if (first) {
      const firstOfAll = await findNext(dimension.members(first))
      if (firstOfAll && String(firstOfAll._id) !== String(current._id)) {
        return res.json({ poem: firstOfAll, scope: 'wrap' })
      }
    }

    return res.json({ poem: null, scope: null })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to resolve next poem' })
  }
})

// Declared after /:poemId/next so the single-segment param route can never
// shadow it.
poemRouter.get('/:poemId', async (req, res) => {
  try {
    const poem = await findPoemByIdOrSlug(req.params.poemId)

    if (!poem) {
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

const ALLOWED_PATCH_FIELDS = ['poem', 'title', 'genre', 'date', 'likes', 'origin', 'userId']

// modify poem
poemRouter.patch('/:poemId', userExtractor, findPoemById, isOwnerOrAdmin, async (req, res) => {
  const doc = req.poem

  const update = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => ALLOWED_PATCH_FIELDS.includes(key))
  )

  try {
    const updated = await Poem.findByIdAndUpdate(
      doc._id,
      { $set: update },
      { new: true }
    ).populate('authorId', AUTHOR_FIELDS)

    res.json(updated)
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
