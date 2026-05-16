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

poemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    // Flatten populated author — keeps API shape identical, adds authorSlug
    const a = returnedObject.authorId
    if (a && a.name) {
      returnedObject.author = a.username || a.name
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
