// Draft visibility — the ONE place that decides what "publicly readable" means
// for a poem.
//
// A poem is either a private `draft` or a public `published`. The ~16k poems
// that predate the field carry no `status` at all, which is exactly why the
// match treats a MISSING status as published: defaulting the schema field means
// new poems are correct, and this fragment means the existing collection is
// correct without a backfill on a live production database.
//
// It is written as a single TOP-LEVEL key so it can be spread into any filter
// without colliding with the `$or` (userId) and `$and` (search) the list
// endpoint already composes.
//
// It is an ALLOWLIST (`$in`), not `{ $ne: 'draft' }`. If a future status is
// added — scheduled, archived, hidden — the allowlist keeps it invisible until
// somebody deliberately decides it should be public. `$ne` would leak it by
// default, and the whole point of concentrating this in one helper is that
// getting it wrong is a privacy bug, not a display bug.
//
// Every public read path composes this. `src/__tests__/drafts.test.js`
// enumerates those paths and fails if one of them stops.

const POEM_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published'
}

// `{ status: null }` matches documents where the field is null AND where it is
// absent, which is what covers the pre-field collection.
const PUBLISHED_MATCH = Object.freeze({ status: { $in: [POEM_STATUS.PUBLISHED, null] } })

// Narrow a Mongo filter (or an aggregation $match) to publicly readable poems.
function publishedOnly (filter = {}) {
  return { ...filter, ...PUBLISHED_MATCH }
}

function isDraft (poem) {
  return Boolean(poem) && poem.status === POEM_STATUS.DRAFT
}

// Normalize a client-supplied status. Anything unrecognised becomes
// `published`, so a typo can never park a poem in a state nothing can read.
function normalizeStatus (value) {
  return value === POEM_STATUS.DRAFT ? POEM_STATUS.DRAFT : POEM_STATUS.PUBLISHED
}

// The author id of a poem, as a string, whether or not `authorId` was populated.
// `req.userId` comes out of a JSON-serialized JWT payload and is therefore a
// STRING; comparing it against a populated Mongoose document (rather than that
// document's _id) silently never matches.
function authorIdOf (poem) {
  const author = poem && poem.authorId
  if (!author) return ''
  return String(author._id ? author._id : author)
}

function getAdminId () {
  return process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN
}

// Who may read a draft: its author, and the admin.
function canReadDraft (poem, userId) {
  if (!userId) return false
  return authorIdOf(poem) === String(userId) || String(userId) === getAdminId()
}

// A single poem is readable when it is published, or when the caller owns it.
function canReadPoem (poem, userId) {
  return !isDraft(poem) || canReadDraft(poem, userId)
}

module.exports = {
  POEM_STATUS,
  PUBLISHED_MATCH,
  publishedOnly,
  isDraft,
  normalizeStatus,
  authorIdOf,
  canReadDraft,
  canReadPoem
}
