const { Schema, model } = require('mongoose')

// The social graph, stored as EDGES rather than as an array on Author.
//
// An `Author.following: [ObjectId]` array would have been fewer lines, and it
// is the wrong shape for three separate reasons: a document caps at 16MB so a
// popular poet's follower list has a hard ceiling; you cannot page an array
// without pulling the whole thing into memory first; and "who follows X" would
// need a scan of every author's array because the array only indexes the side
// that owns it. One document per edge pages, indexes and counts in both
// directions.
//
// `updatedAt` is deliberately off: an edge is created or destroyed, never
// edited, so a second timestamp would only ever equal the first.
const followSchema = new Schema({
  // Who is doing the following. ALWAYS taken from the session on the write
  // routes, never from the request body — a `follower` the client could name
  // would let anyone forge follows on somebody else's behalf.
  follower: { type: Schema.Types.ObjectId, ref: 'Author', required: true },
  // Who is being followed.
  following: { type: Schema.Types.ObjectId, ref: 'Author', required: true }
}, { timestamps: { createdAt: true, updatedAt: false } })

// The one invariant of the whole feature: an edge exists at most once.
//
// A read-then-write check ("do I already follow them? no → insert") loses to a
// double-clicked button, because both requests read `no` before either writes.
// The unique index makes the second insert impossible at the storage layer
// instead, and the controller maps the resulting E11000 to SUCCESS rather than
// a conflict — double-clicking Follow is not an error, and the state the user
// asked for is the state they got.
followSchema.index({ follower: 1, following: 1 }, { unique: true })

// The two list endpoints. Neither is redundant with the unique index above:
// that one has `follower` as its prefix, so it can serve "does A follow B" and
// "everyone A follows" — but its second key is `following`, so it cannot sort
// by `createdAt`, and it cannot answer "everyone who follows B" at all (a
// compound index is only usable from a prefix).
//
// `_id` is the third key, not decoration: follows seeded in one batch share an
// identical `createdAt`, and a paginated sort whose ties break arbitrarily can
// show the same follower on page 1 and page 2 while skipping another entirely.
// Putting it in the index keeps the whole sort index-served rather than pushing
// the tie-break into an in-memory sort.
followSchema.index({ following: 1, createdAt: -1, _id: -1 })
followSchema.index({ follower: 1, createdAt: -1, _id: -1 })

followSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
  }
})

module.exports = model('Follow', followSchema)
