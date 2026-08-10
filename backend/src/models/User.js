// DEPRECATED — superseded by Author.js which consolidates both registered users and
// famous/AI authors into one collection. This model still exists because:
//   1. poems.js falls back to it when a poem's authorId resolves to the old 'users'
//      collection (pre-migration data).
// That fallback is now the ONLY reference. The legacy public GET/POST /users
// routes were deleted on 2026-08-10 (see the note in controllers/users.js);
// users.test.js pins their absence.
// Do not create new references to this model. Safe to remove only after a DB migration
// moves all remaining 'users' documents into the 'authors' collection — count that
// collection before assuming it is empty.
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
