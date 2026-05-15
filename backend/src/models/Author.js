const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const authorSchema = new Schema({
  name: String,
  slug: { type: String, unique: true, index: true },
  picture: String,
  origin: String,
  fake: { type: Boolean, default: false },
  // auth fields — only populated for registered users, null for famous authors
  username: { type: String, unique: true, sparse: true },
  email: { type: String, sparse: true },
  passwordHash: String,
  poems: [{ type: Schema.Types.ObjectId, ref: 'Poem' }]
})

authorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

authorSchema.plugin(uniqueValidator)

const Author = model('Author', authorSchema)

module.exports = Author
