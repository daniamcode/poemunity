require('../bin/dev')
const mongoose = require('mongoose')
const User = require('../src/models/User')
const Author = require('../src/models/Author')
const Poem = require('../src/models/Poem')
const { slugifyAuthor } = require('../src/utils/slugUtils')

function buildSlugsInMemory(names, seedSlugs = new Set()) {
  const usedSlugs = new Set(seedSlugs)
  const result = new Map()
  for (const name of names) {
    const base = slugifyAuthor(name) || 'author'
    let slug = base
    let counter = 2
    while (usedSlugs.has(slug)) {
      slug = `${base}-${counter++}`
    }
    usedSlugs.add(slug)
    result.set(name, slug)
  }
  return result
}

async function main() {
  await mongoose.connect(process.env.MONGODB_PRE)
  console.log('Connected to MongoDB')

  // Step 1: Migrate registered users → Author docs (same _id, bulk)
  const users = await User.find({})
  const existingAuthorIds = new Set(
    (await Author.find({}, '_id')).map(a => String(a._id))
  )

  const userNames = users.map(u =>
    (u.name && u.surname) ? `${u.name} ${u.surname}` : u.username
  )
  const userSlugs = buildSlugsInMemory(userNames)

  const userDocs = users
    .filter(u => !existingAuthorIds.has(String(u._id)))
    .map(u => {
      const displayName = (u.name && u.surname) ? `${u.name} ${u.surname}` : u.username
      return {
        _id: u._id,
        name: displayName,
        slug: userSlugs.get(displayName),
        picture: u.picture || null,
        origin: 'user',
        fake: u.fake || false,
        username: u.username,
        email: u.email,
        passwordHash: u.passwordHash,
        poems: u.poems
      }
    })

  if (userDocs.length > 0) {
    await Author.insertMany(userDocs, { ordered: false })
  }
  console.log(`Created ${userDocs.length} Author docs from registered users`)

  // Step 2: Seed famous authors — bulk insert
  const famousNames = await Poem.distinct('author', {
    origin: { $in: ['famous', 'Poetry Foundation'] },
    author: { $nin: [null, ''] }
  })

  // Get origins in bulk
  const originDocs = await Poem.aggregate([
    { $match: { origin: { $in: ['famous', 'Poetry Foundation'] }, author: { $nin: [null, ''] } } },
    { $group: { _id: '$author', origin: { $first: '$origin' } } }
  ])
  const originMap = new Map(originDocs.map(d => [d._id, d.origin]))

  // Get all existing slugs (from user authors already created) to avoid conflicts
  const existingSlugs = new Set((await Author.find({}, 'slug')).map(a => a.slug))

  // Get already-migrated famous names (idempotency)
  const existingFamousNames = new Set(
    (await Author.find({ origin: { $in: ['famous', 'Poetry Foundation'] } }, 'name')).map(a => a.name)
  )
  const newFamousNames = famousNames.filter(name => !existingFamousNames.has(name))

  // Build slugs for only new famous authors, seeded with existing slugs to avoid conflicts
  const allFamousSlugs = buildSlugsInMemory(newFamousNames, existingSlugs)

  const newFamousDocs = newFamousNames
    .map(name => ({
      name,
      slug: allFamousSlugs.get(name),
      origin: originMap.get(name) || 'famous',
      fake: false
    }))

  if (newFamousDocs.length > 0) {
    await Author.insertMany(newFamousDocs, { ordered: false })
  }
  console.log(`Created ${newFamousDocs.length} Author docs for famous authors`)

  // Step 3: Backfill authorId on user poems
  // Use $convert with onError:null — poems with numeric userId (old fake IDs 1-7) get null and are caught below
  const userResult = await Poem.updateMany(
    { userId: { $exists: true, $ne: null, $ne: '' }, authorId: { $exists: false } },
    [{ $set: { authorId: { $convert: { input: '$userId', to: 'objectId', onError: null } } } }]
  )
  console.log(`Backfilled authorId on ${userResult.modifiedCount} user poems via userId`)

  // Step 3b: Poems with unconvertible userId (numeric) — match by author name
  const userAuthors = await Author.find({ origin: 'user' }, '_id name')
  const userAuthorByName = new Map(userAuthors.map(a => [a.name, a._id]))
  const unlinkedUserPoems = await Poem.find({ authorId: null, author: { $nin: [null, ''] } }, 'author')
  let nameMatchCount = 0
  const nameMatchOps = unlinkedUserPoems
    .filter(p => userAuthorByName.has(p.author))
    .map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { authorId: userAuthorByName.get(p.author) } }
      }
    }))
  if (nameMatchOps.length > 0) {
    const r = await Poem.bulkWrite(nameMatchOps)
    nameMatchCount = r.modifiedCount
  }
  console.log(`Backfilled authorId on ${nameMatchCount} additional user poems via author name`)

  // Step 4: Backfill authorId on famous poems — build name→_id map, bulk update per author
  const famousAuthors = await Author.find({ origin: { $in: ['famous', 'Poetry Foundation'] } }, '_id name')
  let famousPoemCount = 0
  // Batch updates: build bulk ops
  const bulkOps = famousAuthors.map(author => ({
    updateMany: {
      filter: { author: author.name, authorId: { $exists: false } },
      update: { $set: { authorId: author._id } }
    }
  }))
  if (bulkOps.length > 0) {
    const bulkResult = await Poem.bulkWrite(bulkOps)
    famousPoemCount = bulkResult.modifiedCount
  }
  console.log(`Backfilled authorId on ${famousPoemCount} famous poems`)

  // Verify
  const total = await Poem.countDocuments({})
  const withAuthorId = await Poem.countDocuments({ authorId: { $exists: true } })
  const unresolved = total - withAuthorId
  console.log(`Total poems: ${total} | With authorId: ${withAuthorId} | Unresolved: ${unresolved}`)

  if (unresolved > 0) {
    const samples = await Poem.find({ authorId: { $exists: false } }, 'author origin').limit(5)
    console.log('Sample unresolved:', samples.map(p => `${p.author} (${p.origin})`))
  }

  await mongoose.disconnect()
  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
