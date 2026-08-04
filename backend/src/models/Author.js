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
  // Which notifications this author wants. Every existing author predates the
  // field and so carries NOTHING here, which is why the check is
  // `pref !== false` rather than `pref === true` — absent means ON, the same
  // equivalence that let `Poem.status` ship without backfilling 16k documents.
  // Writing it as a truthiness test would silently switch every existing user's
  // notifications off. Enforced in one place: isNotificationEnabled().
  notificationPrefs: {
    like: { type: Boolean, default: true },
    comment: { type: Boolean, default: true },
    profileComment: { type: Boolean, default: true },
    follow: { type: Boolean, default: true },
    newPoem: { type: Boolean, default: true }
  },
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
  // When the password was last changed (currently: on a successful reset). The
  // auth middleware rejects any JWT whose issued-at (iat) predates this, so a
  // reset revokes every session that existed before it. Unset until the first
  // password change.
  passwordChangedAt: Date,
  // email verification — same rule as password reset: store only the sha256
  // HASH of the token, never the raw token (that lives only in the emailed
  // link). Cleared on successful verification (single-use).
  emailVerified: { type: Boolean, default: false },
  verifyTokenHash: String,
  verifyTokenExpiry: Date,
  // Admin-created disposable test accounts. Defaults to false on real accounts;
  // set true on admin test users so the partial email index below can exclude
  // them from strict email uniqueness — letting many test accounts share one
  // email. (The index filter uses `testAccount: false`, a supported equality:
  // MongoDB partial indexes forbid $ne and $exists:false, so real accounts must
  // carry an explicit `false` rather than merely lacking the field.)
  testAccount: { type: Boolean, default: false },
  poems: [{ type: Schema.Types.ObjectId, ref: 'Poem' }]
})

// Case-insensitive uniqueness. strength: 2 makes the comparison ignore case
// (and other tertiary differences) so usernames/emails are unique regardless of
// casing. Sparse so the many famous/ai authors without auth fields are exempt.
const CI_COLLATION = { locale: 'en', strength: 2 }
authorSchema.index({ username: 1 }, { unique: true, sparse: true, collation: CI_COLLATION })
// Email uniqueness excludes test accounts. partialFilterExpression replaces
// sparse (they cannot be combined): the index only covers docs that HAVE an
// email AND have testAccount === false, so real users keep strict CI-unique
// emails while admin-created test accounts (testAccount: true) can share one.
// NOTE: partial-index filters forbid $ne AND $exists:false (both compile to
// $not), so the filter must use the positive equality `testAccount: false` —
// which is why real accounts carry an explicit default `false` (existing rows
// are backfilled by scripts/verify-existing-users.js). Changing this index also
// requires DROPPING the old email_1 index first (see that script).
authorSchema.index(
  { email: 1 },
  {
    unique: true,
    collation: CI_COLLATION,
    partialFilterExpression: { email: { $exists: true }, testAccount: false }
  }
)

authorSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
    // Never serialize password-reset secrets to any client.
    delete returnedObject.resetTokenHash
    delete returnedObject.resetTokenExpiry
    // Same for email-verification secrets.
    delete returnedObject.verifyTokenHash
    delete returnedObject.verifyTokenExpiry
    // Internal-only flag; never surface it on public author payloads.
    delete returnedObject.testAccount
    // Internal session-revocation timestamp; not for clients.
    delete returnedObject.passwordChangedAt
  }
})

const Author = model('Author', authorSchema)

module.exports = Author
