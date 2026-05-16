/**
 * One-time migration: capitalize the first letter of ~85% of fake-user poems.
 * Uses a deterministic hash of the poem's _id so the result is stable on re-runs.
 *
 * Usage:
 *   NODE_ENV=development node scripts/fix-poem-capitalization.js
 */

require('dotenv/config')
const connectMongo = require('../mongo')
const User = require('../src/models/User')
const Poem = require('../src/models/Poem')

function shouldCapitalize (id) {
  let hash = 0
  const str = id.toString()
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  }
  return (hash % 100) < 85
}

function capitalize (text) {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

async function run () {
  await connectMongo()

  const fakeUsers = await User.find({ fake: true }).select('_id')
  const fakeUserIds = fakeUsers.map(u => u._id.toString())

  const poems = await Poem.find({ userId: { $in: fakeUserIds } }).select('_id poem')
  console.log(`Found ${poems.length} fake-user poems`)

  let capitalized = 0
  let skipped = 0

  for (const poem of poems) {
    if (!poem.poem || poem.poem.charAt(0) === poem.poem.charAt(0).toUpperCase()) {
      skipped++
      continue
    }
    if (!shouldCapitalize(poem._id)) {
      skipped++
      continue
    }
    await Poem.updateOne({ _id: poem._id }, { $set: { poem: capitalize(poem.poem) } })
    capitalized++
  }

  const total = capitalized + skipped
  console.log(`Capitalized: ${capitalized}/${total} (${Math.round(capitalized / total * 100)}%)`)
  console.log(`Left lowercase: ${skipped}`)
  process.exit(0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
