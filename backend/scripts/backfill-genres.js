/**
 * Backfill genres for Poetry Foundation poems by cross-referencing
 * the old dataset (which had tags) with the current DB entries.
 *
 * Usage:
 *   NODE_ENV=development node scripts/backfill-genres.js <old-csv-path>
 *
 * Safe to re-run: only updates poems currently set to 'Other'.
 */

require('dotenv/config')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const mongoose = require('mongoose')
const connectMongo = require('../mongo')
const Poem = require('../src/models/Poem')

const OLD_CSV = process.argv[2]
if (!OLD_CSV) {
  console.error('Usage: NODE_ENV=development node scripts/backfill-genres.js <old-csv-path>')
  process.exit(1)
}

const TOP_GENRES = new Set([
  'Activities', 'Arts & Sciences', 'Death', 'Family & Ancestors',
  'History & Politics', 'Living', 'Love', 'Nature', 'Philosophy',
  'Relationships', 'Religion', 'Social Commentaries', 'Sorrow & Grieving',
  'War & Conflict'
])

function mapGenre(tags) {
  if (!tags) return null
  const parts = tags.split(',').map(t => t.trim()).filter(Boolean)
  // Prefer a top-level genre if one matches
  for (const part of parts) {
    if (TOP_GENRES.has(part)) return part
  }
  // Fall back to the first tag
  return parts[0] || null
}

const normalize = s => s.replace(/\r/g, '').replace(/\n/g, '').trim().toLowerCase()

async function run() {
  await connectMongo()

  const csv = fs.readFileSync(path.resolve(OLD_CSV), 'utf8')
  const rows = parse(csv, { columns: true, skip_empty_lines: true, relax_column_count: true })

  const tagMap = new Map()
  for (const row of rows) {
    if (!row.Tags) continue
    const key = normalize(row.Title) + '|' + normalize(row.Poet)
    tagMap.set(key, row.Tags)
  }
  console.log(`Loaded ${tagMap.size} tag entries from old CSV`)

  const poems = await Poem.find({ origin: 'Poetry Foundation' }).select('_id title author genre')
  console.log(`Found ${poems.length} Poetry Foundation poems in DB`)

  let updated = 0, skipped = 0
  const batchSize = 500
  const bulkOps = []

  for (const poem of poems) {
    const key = normalize(poem.title) + '|' + normalize(poem.author)
    const tags = tagMap.get(key)
    const genre = mapGenre(tags)
    if (!genre) { skipped++; continue }
    bulkOps.push({ updateOne: { filter: { _id: poem._id }, update: { $set: { genre } } } })
    updated++
  }

  for (let i = 0; i < bulkOps.length; i += batchSize) {
    await Poem.bulkWrite(bulkOps.slice(i, i + batchSize))
    process.stdout.write(`\r  ${Math.min(i + batchSize, bulkOps.length)}/${bulkOps.length}...`)
  }

  console.log(`\nDone. Updated: ${updated}, No match: ${skipped}`)
  await mongoose.disconnect()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
