const { Schema, model } = require('mongoose')

const poemSchema = new Schema({
  poem: String,
  title: String,
  genre: String,
  likes: [String],
  date: Date,
  origin: String,
  slug: { type: String, unique: true, sparse: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'Author', index: true }
}, { strict: false })

// Back the next-poem walk (GET /api/v1/poem/:poemId/next), which seeks either
// the first poem of a bucket or the first strictly after the current one, always
// in the total order `date DESC, _id DESC`. A bucket is one author or one genre,
// so each index is that bucket's equality prefix followed by the sort keys in
// order — an index range scan instead of a collection scan + in-memory sort.
poemSchema.index({ authorId: 1, date: -1, _id: -1 })
poemSchema.index({ genre: 1, date: -1, _id: -1 })
// Serves the genreless-poem fallback, which walks the plain global date order.
poemSchema.index({ date: -1, _id: -1 })
//
// Two caveats, both deliberate:
// - Genre bucket membership matches case-insensitively (`^genre$` /i) to mirror
//   the list filter, and a case-insensitive regex cannot use a plain index
//   prefix. The index still serves the sort. A true seek needs a normalized
//   lowercase `genre` field or a collation index — deferred, see TODO.md.
// - Listing bucket names uses aggregation. Grouping by authorId can use the
//   authorId index as a DISTINCT_SCAN; grouping genres by `$toLower` cannot, and
//   scans. Both run only when a bucket is exhausted, not on every hop.

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
