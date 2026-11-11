#!/usr/bin/env node
/**
 * Count the legacy `users` collection and report what its fate means.
 *
 * Why this exists: the two public routes over `users` were deleted on
 * 2026-08-10 (`GET /users` served every legacy user document *including email*
 * with no authentication), but deleting a route does not delete a collection.
 * Until this number is known nobody can say whether the site was leaking real
 * addresses for months or nothing at all — and, if the collection is NOT empty,
 * those users never made it into `authors`, which is a migration gap rather
 * than a cleanup: they cannot log in, and their poems resolve through the
 * legacy fallback in `poems.js`.
 *
 *   empty  => drop the collection and the `User` model with it
 *   not empty => migration gap; real accounts stranded (see above)
 *
 * READ-ONLY. It counts and samples; it never writes.
 *
 * It deliberately requires NO model — it talks to the native driver
 * collection directly. A model compile is what triggers `autoCreate` (and
 * `autoIndex`), so needing no model is one less way for a "read-only" script
 * to write. Both switches are still set below, before anything connects, as
 * belt and braces: `check-index-drift.js` created an empty `follows`
 * collection in production while calling itself read-only.
 *
 *   node scripts/count-legacy-users.js
 */
require('dotenv').config()
const mongoose = require('mongoose')

mongoose.set('autoIndex', false)
mongoose.set('autoCreate', false)

async function main () {
  const uri = process.env.MONGODB || process.env.MONGODB_PRE
  if (!uri) {
    console.error('No MONGODB (or MONGODB_PRE) set in the environment.')
    process.exit(2)
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  // Native collection: no model compiles, so nothing can be created.
  const users = mongoose.connection.db.collection('users')

  const count = await users.countDocuments()
  console.log(`users count: ${count}`)

  if (count > 0) {
    // Shape only — never print an email address or a password hash. The
    // question this script answers is "were real accounts stranded?", which
    // the field names and a couple of booleans settle without echoing
    // anybody's data into a terminal transcript (see the 2026-07-30 .env
    // exposure: values that reach a transcript stay compromised).
    const sample = await users
      .find({}, { projection: { email: 0, password: 0 } })
      .limit(3)
      .toArray()
    const fields = [...new Set(sample.flatMap((d) => Object.keys(d)))].sort()
    console.log('fields (sample of 3, email/password excluded):', fields.join(', '))
    const migrated = await mongoose.connection.db
      .collection('authors')
      .countDocuments({ email: { $exists: true } })
    console.log(`authors with an email: ${migrated}`)
    console.log('\nNOT EMPTY => migration gap: these users cannot log in.')
  } else {
    console.log('\nEMPTY => safe to drop the collection and delete the User model.')
  }

  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
