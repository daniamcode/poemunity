require('dotenv/config')
const mongoose = require('mongoose')
const Author = require('../src/models/Author')
const Poem = require('../src/models/Poem')

const MONGODB = process.env.MONGODB_PRE || process.env.MONGODB

async function run() {
  await mongoose.connect(MONGODB)
  console.log('Connected to MongoDB')

  // Use raw collection to bypass Mongoose strictQuery stripping 'origin' from filters
  const col = Author.collection

  // ── Step 1: classify authors ──────────────────────────────────────────────

  // Famous (Poetry Foundation Kaggle dataset)
  const famousPF = await col.updateMany(
    { origin: 'Poetry Foundation' },
    { $set: { type: 'famous', source: 'poetry-foundation' } }
  )
  console.log(`Famous (Poetry Foundation): ${famousPF.modifiedCount} updated`)

  // Famous (manually added, legacy 'famous' origin)
  const famousManual = await col.updateMany(
    { origin: 'famous' },
    { $set: { type: 'famous', source: 'poetry-foundation' } }
  )
  console.log(`Famous (manual/legacy): ${famousManual.modifiedCount} updated`)

  // AI-generated users — identified by @fakemail.com email (seed-fake-users.js)
  const aiUsers = await col.updateMany(
    { origin: 'user', email: /@fakemail\.com$/ },
    { $set: { type: 'ai', fake: false } }
  )
  console.log(`AI users: ${aiUsers.modifiedCount} updated`)

  // Temporary fake human users (fake:true, not @fakemail.com)
  const fakeHumans = await col.updateMany(
    { origin: 'user', fake: true, email: { $not: /@fakemail\.com$/ } },
    { $set: { type: 'user' } }
  )
  console.log(`Fake human users: ${fakeHumans.modifiedCount} updated`)

  // Real registered users
  const realHumans = await col.updateMany(
    { origin: 'user', fake: false, email: { $not: /@fakemail\.com$/ } },
    { $set: { type: 'user' } }
  )
  console.log(`Real human users: ${realHumans.modifiedCount} updated`)

  // Catch-all: any author still missing type
  const untyped = await col.countDocuments({ type: { $exists: false } })
  if (untyped > 0) {
    console.warn(`WARNING: ${untyped} authors still have no type — check manually`)
  }

  // ── Step 2: update poem origins to match author type ─────────────────────
  // 3 bulk queries instead of one-per-author
  const famousIds = (await col.find({ type: 'famous' }, { projection: { _id: 1 } }).toArray()).map(a => a._id)
  const aiIds     = (await col.find({ type: 'ai' },     { projection: { _id: 1 } }).toArray()).map(a => a._id)

  const pFamous = await Poem.collection.updateMany({ authorId: { $in: famousIds } }, { $set: { origin: 'famous' } })
  const pAi     = await Poem.collection.updateMany({ authorId: { $in: aiIds } },     { $set: { origin: 'ai' } })
  const pHuman  = await Poem.collection.updateMany(
    { authorId: { $nin: [...famousIds, ...aiIds] } },
    { $set: { origin: 'user' } }
  )
  console.log(`Poems updated: famous=${pFamous.modifiedCount} ai=${pAi.modifiedCount} human=${pHuman.modifiedCount}`)

  // ── Done ──────────────────────────────────────────────────────────────────
  const summary = await col.aggregate([
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]).toArray()
  console.log('\nAuthor type summary:')
  summary.forEach(({ _id, count }) => console.log(`  ${_id || '(unset)'}: ${count}`))

  await mongoose.disconnect()
  console.log('\nDone.')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
