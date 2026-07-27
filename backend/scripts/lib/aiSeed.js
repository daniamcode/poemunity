// Reusable, schema-correct creation of AI community authors and their poems.
//
// Why this exists: AI users used to be made through a fragile 4-step legacy
// pipeline (seed-fake-users.js → migrate-to-authors → migrate-author-types →
// add-ai-personalities), and none of those steps set emailVerified/testAccount.
// These helpers create AI `Author` docs DIRECTLY with every flag correct, and
// create their poems via direct DB writes (which bypass the publish gate by
// design). Both operations are idempotent so re-running is safe — important
// because this project has NO separate dev DB (MONGODB_PRE === MONGODB).

const bcrypt = require('bcryptjs')
const { slugifyAuthor, generatePoemSlug } = require('../../src/utils/slugUtils')

// Same case-insensitive collation as the Author unique indexes.
const CI = { locale: 'en', strength: 2 }

// The invariant flags every AI author must carry:
//  - type:'ai'          → classified as AI community content
//  - fake:false         → the AI personas are not the legacy `fake:true` humans
//  - emailVerified:true → never caught by the publish gate (even in API mode)
//  - testAccount:false  → visible in public rankings/listings
const AI_DEFAULTS = { type: 'ai', fake: false, emailVerified: true, testAccount: false }

async function buildUniqueAuthorSlug (Author, name, excludeId) {
  const base = slugifyAuthor(name) || 'author'
  let slug = base
  let n = 2
  while (await Author.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${n++}`
  }
  return slug
}

async function buildUniquePoemSlug (Poem, title, authorName) {
  const base = generatePoemSlug(title, authorName) || 'poem'
  let slug = base
  let n = 2
  while (await Poem.exists({ slug })) {
    slug = `${base}-${n++}`
  }
  return slug
}

// Create or update one AI author. Idempotent by username (case-insensitive).
// Throws a clear error if a DIFFERENT author already owns the email — the
// partial-unique email index would reject it anyway, so fail early and readable.
async function upsertAiAuthor (Author, persona) {
  if (!persona || !persona.username) throw new Error('persona.username is required')
  const username = persona.username.trim()
  const email = persona.email ? persona.email.trim().toLowerCase() : undefined

  if (email) {
    const clash = await Author.findOne({ email }).collation(CI).select('username')
    if (clash && clash.username && clash.username.toLowerCase() !== username.toLowerCase()) {
      throw new Error(`email "${email}" already belongs to "${clash.username}"`)
    }
  }

  const fields = {
    ...AI_DEFAULTS,
    name: persona.name,
    surname: persona.surname,
    picture: persona.picture ?? null,
    bio: persona.bio,
    preferredGenres: persona.preferredGenres || [],
    ...(email ? { email } : {})
  }

  let author = await Author.findOne({ username }).collation(CI)
  if (author) {
    Object.assign(author, fields)
    await author.save()
    return { author, created: false }
  }

  const slug = await buildUniqueAuthorSlug(Author, persona.name || username)
  // AI authors don't log in; use a provided hash, or a random one so the field
  // is never a guessable/blank credential.
  const passwordHash = persona.passwordHash ||
    await bcrypt.hash(persona.password || ('ai-' + require('crypto').randomBytes(9).toString('hex') + '1'), 10)
  author = new Author({ username, slug, passwordHash, poems: [], ...fields })
  await author.save()
  return { author, created: true }
}

// Create one poem for an AI author via direct DB write. Idempotent by
// (title, authorId). Sets authorId + origin:'ai' so it matches the modern
// schema (toJSON flattens the populated author), and links it into author.poems.
async function addPoemForAuthor (Poem, Author, author, p) {
  if (!p || !p.title) throw new Error('poem.title is required')
  const existing = await Poem.findOne({ title: p.title, authorId: author._id })
  if (existing) return { poem: existing, created: false }

  const slug = await buildUniquePoemSlug(Poem, p.title, author.name || author.username)
  const poem = new Poem({
    poem: p.poem,
    title: p.title,
    genre: p.genre,
    likes: [],
    date: p.date ? new Date(p.date) : new Date(),
    origin: 'ai',
    authorId: author._id,
    slug
  })
  await poem.save()

  if (!Array.isArray(author.poems)) author.poems = []
  author.poems.push(poem._id)
  await author.save()
  return { poem, created: true }
}

module.exports = { upsertAiAuthor, addPoemForAuthor, buildUniqueAuthorSlug, buildUniquePoemSlug, AI_DEFAULTS }
