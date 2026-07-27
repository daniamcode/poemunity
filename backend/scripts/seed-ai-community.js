// Single-step generator for AI community authors and their poems.
//
// Replaces the legacy 4-step pipeline (seed-fake-users → migrate-to-authors →
// migrate-author-types → add-ai-personalities). Add a persona to PERSONAS below
// and run — it creates a schema-correct AI `Author` (type:'ai', emailVerified,
// testAccount:false) plus any poems, all idempotent.
//
//   node scripts/seed-ai-community.js            # DRY-RUN (validate only)
//   node scripts/seed-ai-community.js --commit   # actually write
//
// ⚠️  THIS PROJECT HAS NO SEPARATE DEV DB: MONGODB_PRE === MONGODB. Every write
//     here hits PRODUCTION. Dry-run first, keep emails unique (@fakemail.com),
//     and take a `mongodump` snapshot before a large batch.

require('dotenv/config')
const mongoose = require('mongoose')
const Author = require('../src/models/Author')
const Poem = require('../src/models/Poem')
const { upsertAiAuthor, addPoemForAuthor } = require('./lib/aiSeed')

// ── Add new AI personas here ────────────────────────────────────────────────
// Each needs a UNIQUE username and (if set) a UNIQUE @fakemail.com email.
// `poems` is optional. Example (commented out):
//
//   {
//     username: 'example.poet',
//     email: 'example.poet@fakemail.com',
//     name: 'Example', surname: 'Poet', picture: null,
//     bio: 'Writes quiet poems about ordinary mornings.',
//     preferredGenres: ['Love', 'Nature'],
//     poems: [
//       { title: 'First Light', poem: 'The kettle hums…', genre: 'Nature', date: '2024-03-01' }
//     ]
//   }
const PERSONAS = []

async function validate (personas) {
  const seenUser = new Set()
  const seenEmail = new Set()
  for (const p of personas) {
    if (!p.username) throw new Error('a persona is missing username')
    const u = p.username.toLowerCase()
    if (seenUser.has(u)) throw new Error(`duplicate username in PERSONAS: ${p.username}`)
    seenUser.add(u)
    if (p.email) {
      const e = p.email.toLowerCase()
      if (seenEmail.has(e)) throw new Error(`duplicate email in PERSONAS: ${p.email}`)
      seenEmail.add(e)
      const clash = await Author.findOne({ email: e }).collation({ locale: 'en', strength: 2 }).select('username')
      if (clash && clash.username.toLowerCase() !== u) {
        throw new Error(`email ${p.email} already belongs to existing author "${clash.username}"`)
      }
    }
    for (const poem of p.poems || []) {
      if (!poem.title) throw new Error(`a poem for ${p.username} is missing a title`)
    }
  }
}

async function run () {
  const commit = process.argv.includes('--commit')
  await mongoose.connect(process.env.MONGODB)
  console.log(`Connected to "${mongoose.connection.name}" — ${commit ? 'COMMIT (writing)' : 'DRY-RUN (no writes)'}`)
  console.log('⚠️  MONGODB_PRE === MONGODB in this project: this is PRODUCTION.\n')

  if (PERSONAS.length === 0) {
    console.log('No personas defined in PERSONAS — nothing to do. Add entries and re-run.')
    await mongoose.disconnect()
    return
  }

  await validate(PERSONAS)
  console.log(`✓ Validation passed for ${PERSONAS.length} persona(s).`)

  if (!commit) {
    for (const p of PERSONAS) {
      console.log(`  would upsert: ${p.username}  (+${(p.poems || []).length} poem(s))`)
    }
    console.log('\nDry-run only. Re-run with --commit to write.')
    await mongoose.disconnect()
    return
  }

  let created = 0
  let updated = 0
  let poemsAdded = 0
  for (const p of PERSONAS) {
    const { author, created: isNew } = await upsertAiAuthor(Author, p)
    isNew ? created++ : updated++
    for (const poem of p.poems || []) {
      const r = await addPoemForAuthor(Poem, Author, author, poem)
      if (r.created) poemsAdded++
    }
    console.log(`  ${isNew ? 'created' : 'updated'}: ${p.username}`)
  }
  console.log(`\nDone — authors: ${created} created, ${updated} updated; poems: ${poemsAdded} added.`)
  await mongoose.disconnect()
}

run().catch(e => { console.error('ERROR:', e.message); process.exit(1) })
