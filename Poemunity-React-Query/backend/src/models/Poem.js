const { Schema, model } = require('mongoose')

const poemSchema = new Schema({
  poem: String,
  title: String,
  author: String,
  picture: String,
  genre: String,
  likes: [String],
  date: Date,
  userId: String
})

poemSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Poem = model('Poem', poemSchema)

module.exports = Poem