// DEPRECATED — superseded by Author.js which consolidates both registered users and
// famous/AI authors into one collection. This model still exists because:
//   1. poems.js falls back to it when a poem's authorId resolves to the old 'users'
//      collection (pre-migration data).
//   2. users.js legacy GET/POST routes still reference it.
// Do not create new references to this model. Safe to remove only after a DB migration
// moves all remaining 'users' documents into the 'authors' collection.
const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  email: String,
  name: String,
  surname: String,
  picture: String,
  passwordHash: String,
  poems: [{
    type: Schema.Types.ObjectId,
    ref: 'Poem'
  }],
  fake: { type: Boolean, default: false }
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v

    delete returnedObject.passwordHash
  }
})

userSchema.plugin(uniqueValidator)

const User = model('User', userSchema)

module.exports = User
