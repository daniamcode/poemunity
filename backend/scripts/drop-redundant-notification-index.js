#!/usr/bin/env node
/**
 * Drop the redundant `recipient_1` index on the `notifications` collection.
 *
 * WHY IT EXISTS AT ALL: the schema originally declared `recipient` with
 * `index: true` alongside the two compound indexes. `{ recipient: 1 }` is a
 * strict PREFIX of both of them, and MongoDB can use a compound index from any
 * prefix of its keys — so it answered no query the compound indexes could not,
 * while costing an extra index write on every notification insert and every
 * collapse.
 *
 * WHY A SCRIPT: `autoIndex` is ON in production and is ASYMMETRIC — it only
 * ever CREATES. Deleting `index: true` from the schema stops the index being
 * recreated, but does nothing about the one already built in Atlas, which will
 * otherwise keep charging for writes forever. Dropping it is a production write
 * and stays a deliberate, human decision, which is why check-index-drift.js
 * reports and this script is separate and opt-in.
 *
 *   node scripts/drop-redundant-notification-index.js          # dry run (default)
 *   node scripts/drop-redundant-notification-index.js --apply  # actually drop
 *
 * ⚠️  MONGODB_PRE POINTS AT THE SAME CLUSTER AND DATABASE AS MONGODB. There is
 * no staging copy — running this with --apply writes to PRODUCTION regardless
 * of NODE_ENV. Take a `mongodump` snapshot first (docs/DATABASE_BACKUP_RESTORE.md).
 *
 * Dropping an index is among the more recoverable production writes: no
 * document is touched, and the index can be rebuilt from the schema. It is
 * still gated behind --apply.
 */
require('dotenv').config()
const mongoose = require('mongoose')

// This script deliberately compiles NO model — it talks to the collection
// through the driver. Both switches are set anyway, belt and braces, because
// `autoCreate` is a separate switch from `autoIndex`, defaults to true, and
// creating a collection is exactly the kind of write a maintenance script is
// not supposed to be capable of. (check-index-drift.js created an empty
// `follows` collection in production by missing this.)
mongoose.set('autoIndex', false)
mongoose.set('autoCreate', false)

const COLLECTION = 'notifications'
const INDEX_NAME = 'recipient_1'

async function main () {
  const apply = process.argv.includes('--apply')
  const uri = process.env.MONGODB || process.env.MONGODB_PRE

  if (!uri) {
    console.error('No MONGODB / MONGODB_PRE in the environment.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  const db = mongoose.connection.db

  const collections = await db.listCollections({ name: COLLECTION }).toArray()
  if (collections.length === 0) {
    console.log(`Collection "${COLLECTION}" does not exist yet — nothing to drop.`)
    return
  }

  const indexes = await db.collection(COLLECTION).indexes()
  console.log(`\nIndexes currently on "${COLLECTION}":`)
  for (const index of indexes) {
    console.log(`  ${index.name}  ${JSON.stringify(index.key)}`)
  }

  const target = indexes.find(index => index.name === INDEX_NAME)
  if (!target) {
    console.log(`\n✓ "${INDEX_NAME}" is not present. Nothing to do.`)
    return
  }

  // Refuse to drop unless the indexes that make it redundant are actually
  // there. Dropping the only index that can serve the badge query would turn
  // every unread count into a collection scan — the exact opposite of the point.
  const covering = indexes.filter(index => {
    const keys = Object.keys(index.key)
    return keys.length > 1 && keys[0] === 'recipient'
  })

  if (covering.length === 0) {
    console.error(
      '\n✗ REFUSING TO DROP: no compound index starting with "recipient" exists,\n' +
      `  so "${INDEX_NAME}" is currently NOT redundant. Let the schema's indexes\n` +
      '  build first (they build on deploy), then re-run this.'
    )
    process.exitCode = 1
    return
  }

  console.log(`\n"${INDEX_NAME}" is made redundant by:`)
  for (const index of covering) {
    console.log(`  ${index.name}  ${JSON.stringify(index.key)}`)
  }

  if (!apply) {
    console.log(`\nDRY RUN — would drop "${INDEX_NAME}". Re-run with --apply to do it.`)
    return
  }

  await db.collection(COLLECTION).dropIndex(INDEX_NAME)
  console.log(`\n✓ Dropped "${INDEX_NAME}".`)
  console.log('  Confirm with: node scripts/check-index-drift.js')
}

main()
  .catch(error => {
    console.error('Failed:', error.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.connection.close())
