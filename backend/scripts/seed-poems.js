/**
 * Seed poems from the Poetry Foundation Kaggle dataset.
 *
 * Usage:
 *   NODE_ENV=development node scripts/seed-poems.js <path-to-csv>
 *
 * The CSV must have columns: Title, Poem, Poet, Tags
 * Dataset: https://www.kaggle.com/datasets/tgdivy/poetry-foundation-poems
 *
 * A seed user is created (or reused) to own all imported poems.
 * Tags are comma-separated; the first tag becomes the genre field.
 */

require('dotenv/config')
const fs = require('fs')
const path = require('path')
const { parse } = require('csv-parse/sync')
const mongoose = require('mongoose')
const connectMongo = require('../mongo')
const Poem = require('../src/models/Poem')
const User = require('../src/models/User')
const bcrypt = require('bcrypt')

const CSV_PATH = process.argv[2]

if (!CSV_PATH) {
  console.error('Usage: NODE_ENV=development node scripts/seed-poems.js <path-to-csv>')
  process.exit(1)
}

const SEED_USER = {
  username: 'poetry_foundation',
  name: 'Poetry',
  surname: 'Foundation',
  email: 'seed@poetryfoundation.org',
  picture: '',
}

// Maps Poetry Foundation tags to the genres your app uses.
// Extend this list as needed.
const TAG_MAP = {
  'love': 'Love',
  'nature': 'Nature',
  'death': 'Death',
  'war': 'War',
  'life': 'Life',
  'friendship': 'Friendship',
  'family': 'Family',
  'religion': 'Religion',
  'philosophy': 'Philosophy',
  'humor': 'Humor',
}

function mapGenre(tags) {
  if (!tags) return 'Other'
  const parts = tags.split(',').map(t => t.trim().toLowerCase())
  for (const part of parts) {
    for (const [key, value] of Object.entries(TAG_MAP)) {
      if (part.includes(key)) return value
    }
  }
  // Fall back to the first tag, capitalised
  const first = parts[0]
  return first ? first.charAt(0).toUpperCase() + first.slice(1) : 'Other'
}

async function getOrCreateSeedUser() {
  let user = await User.findOne({ username: SEED_USER.username })
  if (user) return user

  const passwordHash = await bcrypt.hash('seed-password-not-for-login', 10)
  user = new User({ ...SEED_USER, passwordHash })
  await user.save()
  console.log('Created seed user:', SEED_USER.username)
  return user
}

async function main() {
  await connectMongo()

  const csvContent = fs.readFileSync(path.resolve(CSV_PATH), 'utf8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
  })

  console.log(`Parsed ${records.length} rows from CSV`)

  const seedUser = await getOrCreateSeedUser()

  let inserted = 0
  let skipped = 0
  const batchSize = 200
  const docs = []

  for (const row of records) {
    const title = (row['Title'] || row['title'] || '').trim()
    const poem = (row['Poem'] || row['poem'] || row['Content'] || row['content'] || '').trim()
    const author = (row['Poet'] || row['poet'] || row['Author'] || row['author'] || '').trim()
    const tags = row['Tags'] || row['tags'] || ''

    if (!title || !poem) {
      skipped++
      continue
    }

    docs.push({
      title,
      poem,
      author: author || 'Unknown',
      genre: mapGenre(tags),
      likes: [],
      date: new Date(),
      userId: seedUser._id.toString(),
      origin: 'Poetry Foundation',
    })
  }

  // Insert in batches
  for (let i = 0; i < docs.length; i += batchSize) {
    const batch = docs.slice(i, i + batchSize)
    const result = await Poem.insertMany(batch, { ordered: false })
    inserted += result.length

    // Link poems to seed user
    const ids = result.map(p => p._id)
    await User.findByIdAndUpdate(seedUser._id, { $push: { poems: { $each: ids } } })

    process.stdout.write(`\rInserted ${inserted}/${docs.length}...`)
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped (empty): ${skipped}`)
  await mongoose.disconnect()
}

main().catch(err => {
  console.error(err)
  mongoose.disconnect()
  process.exit(1)
})
