const mongoose = require('mongoose')
const Follow = require('../models/Follow')
const Author = require('../models/Author')

// Fields every follow surface needs: the display name (`name || username`, the
// same derivation `Poem` uses), the slug to link to, the avatar — and `type`,
// which is what lets the client put the AI badge on the row. Following an AI
// persona is allowed, but it must never look like following a person.
const FOLLOW_AUTHOR_FIELDS = 'name username slug picture type'

// Authors are addressed by SLUG in public URLs and by ID in the client's
// normalized store, and both need to reach these routes: the author page has a
// slug, the signed-in user's own profile tabs have only their id (the session
// carries identity, not a slug). Slug is tried first so it stays the canonical
// form — the same id-or-slug resolution `GET /poem/:idOrSlug` already uses.
async function resolveAuthorRef (idOrSlug) {
  if (!idOrSlug) return null
  const bySlug = await Author.findOne({ slug: idOrSlug }).select(FOLLOW_AUTHOR_FIELDS)
  if (bySlug) return bySlug
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    return Author.findById(idOrSlug).select(FOLLOW_AUTHOR_FIELDS)
  }
  return null
}

// `req.userId` is a STRING — the JWT payload is JSON-serialized, so it comes
// back as text and `String(objectId) === req.userId` is the only comparison
// that works. It also reaches Mongo as a filter value, and an id that is not a
// valid ObjectId makes the driver throw a CastError (a 500 on what should be a
// quiet `false`), so every entry point normalizes through here.
function toObjectId (value) {
  if (!value) return null
  const str = String(value)
  return mongoose.Types.ObjectId.isValid(str) ? new mongoose.Types.ObjectId(str) : null
}

async function followCounts (authorId) {
  const id = toObjectId(authorId)
  if (!id) return { followerCount: 0, followingCount: 0 }
  const [followerCount, followingCount] = await Promise.all([
    Follow.countDocuments({ following: id }),
    Follow.countDocuments({ follower: id })
  ])
  return { followerCount, followingCount }
}

// Does `viewerId` follow `authorId`? Answers false — never throws — for a
// logged-out viewer or an unusable id.
async function isFollowing (viewerId, authorId) {
  const follower = toObjectId(viewerId)
  const following = toObjectId(authorId)
  if (!follower || !following) return false
  return Boolean(await Follow.exists({ follower, following }))
}

// Serialize an Author (populated or fetched) for a follow list row.
function serializeFollowAuthor (author, followedAt) {
  if (!author) return null
  return {
    id: String(author._id || author.id),
    // Same rule as everywhere else: famous poets have a `name`, registered
    // users may only have a `username`.
    name: author.name || author.username || '',
    slug: author.slug,
    picture: author.picture,
    type: author.type,
    followedAt
  }
}

module.exports = {
  FOLLOW_AUTHOR_FIELDS,
  resolveAuthorRef,
  toObjectId,
  followCounts,
  isFollowing,
  serializeFollowAuthor
}
