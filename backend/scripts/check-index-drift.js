#!/usr/bin/env node
/**
 * Compare the indexes DECLARED on the Mongoose schemas against the ones that
 * actually exist in the database.
 *
 * Why this exists: `autoIndex` is left ON (see mongo.js), so a new schema index
 * builds itself on deploy — but autoIndex only ever CREATES. Remove an index
 * from a schema and the database keeps it forever, silently paying write
 * overhead and storage for a query that no longer exists. That is not
 * hypothetical: simplifying the next-poem walk to a single author rule left
 * `genre_1_date_-1__id_-1` and `date_-1__id_-1` orphaned in production, and they
 * were only found by chance while checking something else.
 *
 * READ-ONLY. It reports; it never creates or drops. Dropping an index is a
 * production write and stays a deliberate, human decision — `syncIndexes()`
 * would do it automatically, which is exactly why it is not used here.
 *
 *   node scripts/check-index-drift.js
 *
 * Exits 1 when anything is missing or orphaned, so it can gate a check later.
 */
require('dotenv').config()
const mongoose = require('mongoose')

// MUST come before any model is compiled. Mongoose builds a model's declared
// indexes as soon as it has a live connection, so with the app's normal
// autoIndex setting this "read-only" script would CREATE every index it was
// supposed to report as missing — writing to production and hiding the very
// drift it exists to find.
mongoose.set('autoIndex', false)

const MODELS = [
  { name: 'Poem', path: '../src/models/Poem' },
  { name: 'Author', path: '../src/models/Author' },
  { name: 'Comment', path: '../src/models/Comment' }
]

// Mongo names an index by joining each key and direction with underscores.
// Matching on the generated name rather than the key object avoids having to
// compare key ORDER by hand — and key order is what makes a compound index
// usable, so it must not be lost in the comparison.
function indexName (key, options = {}) {
  if (options.name) return options.name
  return Object.entries(key).map(([field, dir]) => `${field}_${dir}`).join('_')
}

function declaredIndexes (schema) {
  const names = schema.indexes().map(([key, options]) => indexName(key, options))

  // Field-level `index: true` / `unique: true` never reach schema.indexes(),
  // so collect them separately or every one of them looks orphaned.
  schema.eachPath((path, type) => {
    const opts = type.options || {}
    if (opts.index || opts.unique) names.push(`${path}_1`)
  })

  return [...new Set(names)]
}

async function main () {
  const uri = process.env.MONGODB
  if (!uri) {
    console.error('MONGODB is not set — nothing to check.')
    process.exit(1)
  }

  await mongoose.connect(uri)
  console.log(`database: ${mongoose.connection.name}\n`)

  let drifted = false

  for (const { name, path } of MODELS) {
    const model = require(path)
    const collection = model.collection.name
    const declared = declaredIndexes(model.schema)

    const live = (await mongoose.connection.db.collection(collection).indexes())
      .map(i => i.name)
      .filter(i => i !== '_id_') // always present, never declared

    const missing = declared.filter(i => !live.includes(i))
    const orphaned = live.filter(i => !declared.includes(i))

    const status = missing.length === 0 && orphaned.length === 0 ? 'OK' : 'DRIFT'
    console.log(`${collection} [${status}] — ${live.length} live, ${declared.length} declared`)

    // Missing is usually benign: autoIndex builds on the next deploy. Orphaned
    // is the one that never resolves on its own.
    missing.forEach(i => console.log(`  MISSING  ${i}  (declared in ${name}, absent in the database)`))
    orphaned.forEach(i => console.log(`  ORPHAN   ${i}  (in the database, no longer declared — costs writes)`))

    if (missing.length || orphaned.length) drifted = true
  }

  console.log(drifted
    ? '\nDrift found. Orphans need an explicit dropIndex — take a mongodump first.'
    : '\nNo drift.')

  await mongoose.disconnect()
  process.exit(drifted ? 1 : 0)
}

main().catch(error => {
  console.error('ERROR:', error.message)
  process.exit(1)
})
