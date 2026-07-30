const { Schema, model } = require('mongoose')

const poemSchema = new Schema({
  poem: String,
  title: String,
  genre: String,
  likes: [String],
  date: Date,
  origin: String,
  slug: { type: String, unique: true, sparse: true },
  // Slugs this poem used to have. Cleaning the scraped titles (see
  // scripts/clean-poem-titles.js) regenerates slugs, and the old ones are
  // already in the sitemap, in canonicals and in anything indexed — so they stay
  // resolvable here instead of 404ing. Not unique: a slug freed by one poem
  // could legitimately be taken by another later.
  slugHistory: { type: [String], index: true, default: undefined },
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', index: true }
}, { strict: false })

// Back the next-poem walk (GET /api/v1/poem/:poemId/next), which seeks the first
// poem of an author or the first strictly after the current one, always in the
// order `date DESC, _id DESC`. The equality prefix is followed by the sort keys
// in order, so the seek is an index range scan rather than a collection scan
// plus an in-memory sort.
poemSchema.index({ authorId: 1, date: -1, _id: -1 })
//
// Listing the authors that have poems uses aggregation, grouping by authorId —
// which this index can serve as a DISTINCT_SCAN — and it runs only when an
// author is exhausted, not on every hop.

poemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    // Flatten populated author — keeps API shape identical, adds authorSlug
    const a = returnedObject.authorId
    if (a && a.name) {
      returnedObject.author = a.name || a.username
      returnedObject.authorName = a.name
      returnedObject.picture = a.picture
      returnedObject.userId = String(a._id || a.id)
      returnedObject.authorSlug = a.slug
      returnedObject.authorType = a.type
      delete returnedObject.authorId
    }
  }
})

const Poem = model('Poem', poemSchema)

module.exports = Poem
