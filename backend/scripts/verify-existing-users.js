/**
 * One-time migration for the email-verification feature (PR3).
 *
 * Usage:
 *   NODE_ENV=development node scripts/verify-existing-users.js   # against MONGODB_PRE
 *   NODE_ENV=production  node scripts/verify-existing-users.js   # against MONGODB
 *
 * It does two things, both idempotent (safe to re-run):
 *
 *  1. Marks every existing real user (type:'user') that has no `emailVerified`
 *     field as verified, so accounts created before this feature are NOT
 *     retroactively treated as unverified.
 *
 *  2. Backfills `testAccount:false` on every existing author that lacks the
 *     field. The new partial email index filters on `testAccount: false` (an
 *     equality — partial indexes forbid $ne / $exists:false), so real accounts
 *     MUST carry an explicit `false` to be covered by the unique index.
 *
 *  3. Rebuilds the `email` unique index. PR3 changed it from a plain sparse
 *     unique index to a PARTIAL unique index that excludes test accounts
 *     (partialFilterExpression: { email: {$exists:true}, testAccount: false }).
 *     Mongoose will NOT alter an existing index in place — it logs a conflict and
 *     keeps the old one — so we drop `email_1` explicitly and let syncIndexes()
 *     recreate it from the current schema definition. Run the testAccount
 *     backfill (step 2) BEFORE this so the new index covers every real account.
 */

require('dotenv/config')
const mongoose = require('mongoose')
const connectMongo = require('../mongo')
const Author = require('../src/models/Author')

async function markExistingVerified () {
  const result = await Author.updateMany(
    { type: 'user', emailVerified: { $exists: false } },
    { $set: { emailVerified: true } }
  )
  const matched = result.matchedCount ?? result.n ?? 0
  const modified = result.modifiedCount ?? result.nModified ?? 0
  console.log(`emailVerified backfill: matched ${matched}, modified ${modified}`)
}

async function backfillTestAccountFlag () {
  // Every author that predates this field must get an explicit `false` so the
  // partial email index (which filters on `testAccount: false`) covers them.
  const result = await Author.updateMany(
    { testAccount: { $exists: false } },
    { $set: { testAccount: false } }
  )
  const modified = result.modifiedCount ?? result.nModified ?? 0
  console.log(`testAccount backfill: set false on ${modified} authors`)
}

async function rebuildEmailIndex () {
  const indexes = await Author.collection.indexes()
  const existing = indexes.find(i => i.name === 'email_1')
  const isPartial = existing && !!existing.partialFilterExpression

  if (existing && !isPartial) {
    console.log('Dropping legacy email_1 index (sparse → partial)…')
    await Author.collection.dropIndex('email_1')
  } else if (existing) {
    console.log('email_1 is already the partial index — leaving it in place.')
  } else {
    console.log('No email_1 index present yet — syncIndexes will create it.')
  }

  // Recreate any missing indexes from the schema definition (including the new
  // partial email index). Does nothing for indexes that already match.
  await Author.syncIndexes()
  console.log('Indexes synced.')
}

async function run () {
  await connectMongo()
  try {
    await markExistingVerified()
    await backfillTestAccountFlag()
    await rebuildEmailIndex()
    console.log('Migration complete.')
  } finally {
    await mongoose.disconnect()
  }
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
