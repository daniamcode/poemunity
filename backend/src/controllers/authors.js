const authorsRouter = require('express').Router()
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const userExtractor = require('../middleware/userExtractor')
const { PUBLISHED_MATCH } = require('../utils/poemVisibility')
const { followCounts, isFollowing } = require('../utils/follows')

function buildFilter (query) {
  const filter = {}
  if (query.type) filter.type = query.type
  if (query.fake === 'true') filter.fake = true
  // Never surface admin-created test accounts in public author listings.
  // testAccount is set only on those accounts, so { $ne: true } keeps every
  // real author (the field is absent on them).
  filter.testAccount = { $ne: true }
  return filter
}

const countLookup = {
  $lookup: {
    from: 'poems',
    let: { aid: '$_id' },
    pipeline: [
      // Drafts are not part of an author's public body of work: this count is
      // both the "35 poems" badge and — via HAS_POEMS — what decides whether the
      // author appears at all. Counting drafts would list authors whose page,
      // and whose letter in the index, then opens onto nothing.
      { $match: { $expr: { $eq: ['$authorId', '$$aid'] }, ...PUBLISHED_MATCH } },
      { $count: 'n' }
    ],
    as: 'poemCount'
  }
}

const countProject = {
  name: 1,
  slug: 1,
  picture: 1,
  username: 1,
  count: { $ifNull: [{ $arrayElemAt: ['$poemCount.n', 0] }, 0] }
}

// An author with nothing to read is not worth a row: registering creates an
// Author immediately, so the public list filled up with empty accounts. Applied
// to the letter index too — filtering the listings alone would leave letters
// enabled that open onto an empty page.
const HAS_POEMS = { $match: { count: { $gt: 0 } } }

// The same author list, counted from the OTHER END: group the poems once and
// join authors onto the result, instead of running `countLookup` as a
// sub-pipeline per author.
//
// WHICH SHAPE IS FASTER DEPENDS ENTIRELY ON WHETHER AUTHORS ARE FILTERED FIRST,
// which is why both survive. Measured at 3,300 authors / 16,000 poems:
//
//   /authors?limit=15   per-author 98ms -> grouped 43ms   (grouped wins ~2.3x)
//   /authors/letters    per-author 99ms -> grouped 46ms   (grouped wins ~2.2x)
//   /authors?letter=A   per-author  6ms -> grouped 50ms   (per-author wins 8x)
//
// With `?letter=`, the $match on `name` narrows to ~114 authors BEFORE the
// lookup, so only 114 sub-pipelines run and there is nothing to beat. Without
// it, every author pays. So the letter branch deliberately keeps `countLookup`
// — do not "unify" these onto one pipeline, it makes the fast case 8x slower.
//
// `HAS_POEMS` is implicit here: grouping poems can only ever yield authors who
// have at least one published one.
function countedAuthorsPipeline (filter) {
  return [
    { $match: PUBLISHED_MATCH },
    { $group: { _id: '$authorId', count: { $sum: 1 } } },
    { $lookup: { from: 'authors', localField: '_id', foreignField: '_id', as: 'author' } },
    // Drops the null bucket that poems with no author group into — they belong
    // to nobody, so they head no row. Same rule as the next-poem walk.
    { $unwind: '$author' },
    // BEFORE any $sort/$limit the caller appends. Filtering after a $limit
    // would let a testAccount author inside the top 15 silently shrink the list
    // to 14 rather than admit the next real author.
    { $match: onAuthor(filter) },
    {
      $project: {
        name: '$author.name',
        slug: '$author.slug',
        picture: '$author.picture',
        username: '$author.username',
        count: 1
      }
    }
  ]
}

// Re-points a filter built for the `authors` collection at the joined subdoc.
const onAuthor = (filter) =>
  Object.fromEntries(Object.entries(filter).map(([key, value]) => [`author.${key}`, value]))

// GET /api/authors/letters — which letters have at least one author WITH poems
authorsRouter.get('/letters', async (req, res) => {
  try {
    // Every author is in scope here, so this is the grouped shape — see
    // countedAuthorsPipeline for the measurements and for why ?letter= is not.
    const results = await Poem.aggregate([
      ...countedAuthorsPipeline(buildFilter(req.query)),
      { $project: { letter: { $toUpper: { $substrCP: [{ $trim: { input: '$name' } }, 0, 1] } } } },
      { $match: { letter: { $regex: '^[A-Z]$' } } },
      { $group: { _id: '$letter' } },
      { $sort: { _id: 1 } }
    ])
    res.json(results.map(r => r._id))
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/authors?letter=A   — authors starting with a letter (with poem counts)
// GET /api/authors?limit=15   — top authors by poem count
authorsRouter.get('/', async (req, res) => {
  try {
    const filter = buildFilter(req.query)

    if (req.query.letter) {
      const letter = req.query.letter.toUpperCase()
      const authors = await Author.aggregate([
        { $match: { name: { $regex: `^${letter}`, $options: 'i' }, ...filter } },
        countLookup,
        { $project: countProject },
        HAS_POEMS,
        { $sort: { name: 1 } }
      ])
      return res.json(authors.map(a => ({ id: String(a._id), name: a.name || a.username, slug: a.slug, picture: a.picture, count: a.count })))
    }

    const limit = Math.min(parseInt(req.query.limit) || 15, 100)
    const authors = await Poem.aggregate([
      ...countedAuthorsPipeline(filter),
      // `_id` tie-breaks for the same reason it does on the follow lists and
      // the next-poem walk: this is a $limit, and authors tie on poem count
      // constantly, so without it which authors make the cut can change between
      // identical requests.
      { $sort: { count: -1, _id: 1 } },
      { $limit: limit }
    ])
    res.json(authors.map(a => ({ id: String(a._id), name: a.name || a.username, slug: a.slug, picture: a.picture, count: a.count })))
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/authors/:slug — public author profile (personal fields filtered by privateFields)
//
// `userExtractor.optional` rather than the strict one: the page is public, but
// it answers `isFollowing` differently for a signed-in viewer.
//
// The three follow fields ride on THIS response rather than on a call of their
// own, deliberately. The author page already blocks on this document, and the
// extra work is two countDocuments and one exists, each on the prefix of an
// index built for exactly that. A separate endpoint would cost a second
// round-trip to a serverless backend that may be cold — and, worse, it would
// land AFTER first paint, so the Follow button would render in a default state
// and then flip once the answer arrived. A control that briefly claims you do
// not follow someone you do follow invites a click that undoes nothing.
authorsRouter.get('/:slug', userExtractor.optional, async (req, res) => {
  try {
    const author = await Author.findOne(
      { slug: req.params.slug },
      'name slug picture type bio preferredGenres surname city country birthYear gender website privateFields'
    )
    if (!author) return res.status(404).json({ error: 'Author not found' })

    const priv = new Set(author.privateFields || [])
    const result = {
      id: author.id,
      name: author.name,
      slug: author.slug,
      picture: author.picture,
      type: author.type,
      bio: author.bio,
      preferredGenres: author.preferredGenres,
      website: author.website
    }
    if (!priv.has('surname')) result.surname = author.surname
    if (!priv.has('city')) result.city = author.city
    if (!priv.has('country')) result.country = author.country
    if (!priv.has('birthYear')) result.birthYear = author.birthYear
    if (!priv.has('gender')) result.gender = author.gender

    const [counts, viewerFollows] = await Promise.all([
      followCounts(author._id),
      isFollowing(req.userId, author._id)
    ])
    result.followerCount = counts.followerCount
    result.followingCount = counts.followingCount
    // Always present, never omitted for logged-out visitors: `undefined` and
    // `false` are the same thing to the client, but only one of them is a
    // stated answer, and the button's whole job is to state the current state.
    result.isFollowing = viewerFollows

    res.json(result)
  } catch {
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = authorsRouter
