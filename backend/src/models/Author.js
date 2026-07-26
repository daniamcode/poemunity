const { Schema, model } = require('mongoose')

const authorSchema = new Schema({
  name: String,
  slug: { type: String, unique: true, index: true },
  picture: String,
  // public category: 'famous' | 'user' | 'ai'
  type: { type: String, enum: ['famous', 'user', 'ai'], index: true },
  // internal: where famous poems were sourced from (e.g. 'poetry-foundation')
  source: String,
  fake: { type: Boolean, default: false },
  bio: String,
  preferredGenres: [String],
  // personal info fields
  surname: String,
  city: String,
  country: String,
  birthYear: Number,
  gender: String,
  website: String,
  // fields the user has chosen to hide from their public profile page
  privateFields: [String],
  // auth fields — only populated for registered users, null for famous authors.
  // Uniqueness is enforced by the case-insensitive collation indexes declared
  // below (NOT inline `unique: true`), so 'Dani' and 'dani' collide and a race
  // surfaces as a Mongo E11000 the controller can map to a friendly 409.
  // Note: sparse/uniqueness live only on the explicit indexes below — declaring
  // `sparse`/`unique` here too would auto-create a second, colliding index.
  username: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  passwordHash: String,
  // password reset — store only the sha256 HASH of the token, never the raw
  // token itself (the raw token lives only in the emailed link). A DB leak must
  // not hand out working reset links. Cleared on successful reset (single-use).
  resetTokenHash: String,
  resetTokenExpiry: Date,
  poems: [{ type: Schema.Types.ObjectId, ref: 'Poem' }]
})

// Case-insensitive uniqueness. strength: 2 makes the comparison ignore case
// (and other tertiary differences) so usernames/emails are unique regardless of
// casing. Sparse so the many famous/ai authors without auth fields are exempt.
const CI_COLLATION = { locale: 'en', strength: 2 }
authorSchema.index({ username: 1 }, { unique: true, sparse: true, collation: CI_COLLATION })
authorSchema.index({ email: 1 }, { unique: true, sparse: true, collation: CI_COLLATION })

authorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
    // Never serialize password-reset secrets to any client.
    delete returnedObject.resetTokenHash
    delete returnedObject.resetTokenExpiry
  }
})

const Author = model('Author', authorSchema)

module.exports = Author
