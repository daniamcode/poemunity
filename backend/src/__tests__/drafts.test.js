const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')
const Comment = require('../models/Comment')
const User = require('../models/User')

// ---------------------------------------------------------------------------
// Drafts must be invisible on EVERY public read path. One miss publishes
// somebody's private writing, so the central test here is an ENUMERATION: a
// table of the public endpoints, each fetched against a fixture that contains
// drafts, each asserted not to mention them anywhere in its response body. An
// endpoint added later that forgets `publishedOnly()` fails a test instead of
// leaking silently.
//
// The fixture is built as a set of DISTRACTORS — a wrong implementation must
// return a DIFFERENT answer, not the same one by luck:
//
//   * Aaron Ashe sorts FIRST alphabetically and has nothing but a draft, so an
//     unfiltered author listing, letter index or next-poem walk reaches him.
//   * His draft is the ONLY 'famous' poem, so an unfiltered poem-of-the-week
//     has exactly one candidate to pick and must pick it.
//   * Aaron's draft is the NEWEST poem in the collection, so an unfiltered list
//     sorted `date DESC` returns a draft FIRST, not somewhere in the tail.
//   * Zeno's draft sits BETWEEN his two published poems by date, so it is what
//     an unfiltered within-author next-poem walk steps onto. A draft placed at
//     either end would be unreachable by that walk and the row would be dead
//     weight — which is exactly what the red-check caught.
//   * Both drafts carry a like, so `?likedBy=` reaches them.
//   * Zeno's older published poem is inserted with NO `status` field at all
//     (through the driver, bypassing the schema default), which is the shape of
//     all ~16k existing production poems. A filter written as
//     `{ status: 'published' }` would hide it and this suite would go red.
// ---------------------------------------------------------------------------

const LIKER = '6a076c7d0472cf659e70e866'

// Unique, greppable strings — titles, slugs, the drafts-only author, and the
// draft BODIES. Every response body is scanned for all of them; nothing else in
// the fixture contains them as substrings. The bodies are in the list because
// GET /users projects `poem date` and no title, so without them that row could
// never fail (found by red-check).
const SECRETS = [
  'Aarons Secret Draft',
  'aarons-secret-draft',
  'still working on it',
  'Unfinished Aubade',
  'unfinished-aubade',
  'dawn, but not yet',
  'Aaron Ashe',
  'aaron-ashe'
]

const makeToken = (authorId) =>
  jwt.sign({ id: String(authorId), username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

// Dates, newest first: aaronDraft > zenoPublished > zenoDraft > zenoLegacy.
const D = (day) => new Date(`2026-03-${String(day).padStart(2, '0')}T10:00:00.000Z`)

async function seed () {
  const aaron = await Author.create({
    username: 'aaron', name: 'Aaron Ashe', slug: 'aaron-ashe', picture: 'a.jpg', type: 'user'
  })
  const zeno = await Author.create({
    username: 'zeno', name: 'Zeno Zhang', slug: 'zeno-zhang', picture: 'z.jpg', type: 'user'
  })

  const aaronDraft = await Poem.create({
    title: 'Aarons Secret Draft',
    slug: 'aarons-secret-draft',
    poem: 'still working on it',
    genre: 'Love',
    // The only famous poem in the fixture: an unfiltered poem-of-the-week has a
    // single candidate and must return it.
    origin: 'famous',
    date: D(4),
    authorId: aaron._id,
    likes: [LIKER],
    status: 'draft'
  })

  const zenoDraft = await Poem.create({
    title: 'Unfinished Aubade',
    slug: 'unfinished-aubade',
    poem: 'dawn, but not yet',
    genre: 'Love',
    origin: 'user',
    // Between Zeno's two published poems, so the within-author walk steps onto
    // it when the filter is missing.
    date: D(2),
    authorId: zeno._id,
    likes: [LIKER],
    status: 'draft'
  })

  const zenoPublished = await Poem.create({
    title: 'Second Song',
    slug: 'second-song',
    poem: 'sung out loud',
    genre: 'Love',
    origin: 'user',
    date: D(3),
    authorId: zeno._id,
    likes: [LIKER],
    status: 'published'
  })

  // Inserted through the driver so it carries NO `status` key — the shape of
  // every poem that predates this feature.
  const legacyId = new mongoose.Types.ObjectId()
  await Poem.collection.insertOne({
    _id: legacyId,
    title: 'Finished Elegy',
    slug: 'finished-elegy',
    poem: 'long since published',
    genre: 'Love',
    origin: 'user',
    date: D(1),
    authorId: zeno._id,
    likes: []
  })

  // A legacy User document holding poem references. GET /users populates that
  // array, so without one seeded here that endpoint's row could never fail.
  await User.create({
    username: 'legacy-poet',
    name: 'Legacy Poet',
    poems: [aaronDraft._id, zenoDraft._id, zenoPublished._id]
  })

  return { aaron, zeno, aaronDraft, zenoDraft, zenoPublished, legacyId }
}

function expectNoSecrets (body, label) {
  const serialized = JSON.stringify(body)
  SECRETS.forEach((secret) => {
    if (serialized.includes(secret)) {
      throw new Error(`${label} leaked draft content: found "${secret}" in the response`)
    }
  })
}

describe('Drafts — public read paths', () => {
  // Every public endpoint that can reach a poem. Add a row when you add a route.
  //
  // Two rows cannot leak a SECRET by shape alone — GET /poem/:id returns one
  // published poem, and GET /authors?letter=Z returns Zeno's row with no poem
  // fields on it. They stay for enumeration completeness; the leak each one CAN
  // have is pinned by a dedicated test below ('author poem counts exclude
  // drafts', and the 404 tests in the owner-only block).
  test.each([
    ['GET /poems (unpaginated)', () => '/api/v1/poems'],
    ['GET /poems (paginated — what the sitemap crawls)', () => '/api/v1/poems?page=1&limit=100'],
    ['GET /poems?genre=', () => '/api/v1/poems?genre=love'],
    ['GET /poems?origin=user', () => '/api/v1/poems?origin=user'],
    ['GET /poems?origin=famous', () => '/api/v1/poems?origin=famous'],
    ['GET /poems?orderBy=likes', () => '/api/v1/poems?orderBy=likes'],
    ['GET /poems?q= (title match)', () => '/api/v1/poems?q=Unfinished'],
    ['GET /poems?q= (author-name match)', () => '/api/v1/poems?q=Aaron'],
    ['GET /poems?userId= (My poems)', (f) => `/api/v1/poems?userId=${f.zeno._id}`],
    ['GET /poems?author= (author page)', () => '/api/v1/poems?author=aaron-ashe'],
    ['GET /poems?likedBy= (My favourites)', () => `/api/v1/poems?likedBy=${LIKER}`],
    ['GET /poems/ranking', () => '/api/v1/poems/ranking'],
    ['GET /poems/poem-of-the-week', () => '/api/v1/poems/poem-of-the-week'],
    ['GET /poem/:id (published poem)', (f) => `/api/v1/poem/${f.zenoPublished._id}`],
    ['GET /poem/:id/next (walk from a published poem)', (f) => `/api/v1/poem/${f.zenoPublished._id}/next`],
    ['GET /poem/:slug/next (walk from the oldest poem)', () => '/api/v1/poem/finished-elegy/next'],
    ['GET /authors (top authors)', () => '/api/v1/authors'],
    ['GET /authors?letter=A', () => '/api/v1/authors?letter=A'],
    ['GET /authors?letter=Z', () => '/api/v1/authors?letter=Z']
    // GET /users (legacy) was a row here until 2026-08-10, when the route was
    // deleted — it listed every legacy user, email included, with no auth. Its
    // absence is pinned by users.test.js instead.
  ])('%s never mentions a draft', async (label, buildUrl) => {
    const fixture = await seed()
    const res = await request(app).get(buildUrl(fixture)).expect(200)
    expectNoSecrets(res.body, label)
  })

  test('GET /authors/letters omits a letter whose only author has nothing but drafts', async () => {
    await seed()
    const res = await request(app).get('/api/v1/authors/letters').expect(200)
    // Z (Zeno, who has published) stays; A (Aaron, drafts only) must not appear
    // or the letter opens onto an empty page.
    expect(res.body).toContain('Z')
    expect(res.body).not.toContain('A')
  })

  test('author poem counts exclude drafts', async () => {
    await seed()
    const res = await request(app).get('/api/v1/authors?letter=Z').expect(200)
    expect(res.body).toHaveLength(1)
    // Zeno has three poems; two are published (one of them status-less).
    expect(res.body[0].count).toBe(2)
  })

  test('paginated total counts published poems only', async () => {
    await seed()
    const res = await request(app).get('/api/v1/poems?page=1&limit=100').expect(200)
    expect(res.body.total).toBe(2)
    expect(res.body.poems).toHaveLength(2)
  })

  test('a poem with no status field is treated as published', async () => {
    const { legacyId } = await seed()
    const res = await request(app).get(`/api/v1/poem/${legacyId}`).expect(200)
    expect(res.body.title).toBe('Finished Elegy')

    const list = await request(app).get('/api/v1/poems').expect(200)
    expect(list.body.map((p) => p.title)).toContain('Finished Elegy')
  })

  test('poem-of-the-week returns nothing when the only famous poem is a draft', async () => {
    await seed()
    const res = await request(app).get('/api/v1/poems/poem-of-the-week').expect(200)
    expect(res.body.poem).toBeNull()
  })

  test('a draft earns its author no ranking points', async () => {
    const { aaron, zeno } = await seed()
    const res = await request(app).get('/api/v1/poems/ranking').expect(200)

    const authors = res.body.map((row) => row.userId)
    // Aaron's only poem is a draft, so he is not ranked at all.
    expect(authors).not.toContain(String(aaron._id))

    const zenoRow = res.body.find((row) => row.userId === String(zeno._id))
    // 2 published poems * 3 + 1 like on the published one * 1. The draft's like
    // and the draft itself both score zero.
    expect(zenoRow.points).toBe(7)
  })

  test('the next-poem walk never lands on a draft or a drafts-only author', async () => {
    const { zenoPublished, legacyId } = await seed()

    // Only two published poems exist, so the walk is a two-cycle between them.
    // A missing filter would route through Aaron (who sorts first) or through
    // Zeno's newer draft.
    const fromPublished = await request(app).get(`/api/v1/poem/${zenoPublished._id}/next`).expect(200)
    expect(fromPublished.body.poem.title).toBe('Finished Elegy')

    const fromLegacy = await request(app).get(`/api/v1/poem/${legacyId}/next`).expect(200)
    expect(fromLegacy.body.poem.title).toBe('Second Song')
  })
})

describe('Drafts — owner-only access', () => {
  test('a draft is 404 to anonymous readers, by id and by slug', async () => {
    const { zenoDraft } = await seed()
    await request(app).get(`/api/v1/poem/${zenoDraft._id}`).expect(404)
    await request(app).get('/api/v1/poem/unfinished-aubade').expect(404)
  })

  test('a draft is 404 to a logged-in reader who does not own it', async () => {
    const { aaron, zenoDraft } = await seed()
    await request(app)
      .get(`/api/v1/poem/${zenoDraft._id}`)
      .set('Authorization', `Bearer ${makeToken(aaron._id)}`)
      .expect(404)
  })

  test('the owner can read their own draft', async () => {
    const { zeno, zenoDraft } = await seed()
    const res = await request(app)
      .get(`/api/v1/poem/${zenoDraft._id}`)
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .expect(200)
    expect(res.body.title).toBe('Unfinished Aubade')
    expect(res.body.status).toBe('draft')
  })

  test('the admin can read any draft', async () => {
    const { zenoDraft } = await seed()
    const adminId = new mongoose.Types.ObjectId()
    const previous = process.env.REACT_APP_ADMIN
    process.env.REACT_APP_ADMIN = String(adminId)
    try {
      await request(app)
        .get(`/api/v1/poem/${zenoDraft._id}`)
        .set('Authorization', `Bearer ${makeToken(adminId)}`)
        .expect(200)
    } finally {
      process.env.REACT_APP_ADMIN = previous
    }
  })

  test('GET /poems?status=draft requires a session', async () => {
    await seed()
    await request(app).get('/api/v1/poems?status=draft').expect(401)
  })

  test('GET /poems?status=draft returns only the caller\'s own drafts', async () => {
    const { aaron, zeno } = await seed()

    const mine = await request(app)
      .get('/api/v1/poems?status=draft')
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .expect(200)
    expect(mine.body.map((p) => p.title)).toEqual(['Unfinished Aubade'])

    const theirs = await request(app)
      .get('/api/v1/poems?status=draft')
      .set('Authorization', `Bearer ${makeToken(aaron._id)}`)
      .expect(200)
    expect(theirs.body.map((p) => p.title)).toEqual(['Aarons Secret Draft'])
  })

  test('?userId= cannot be used to read somebody else\'s drafts', async () => {
    const { aaron, zeno } = await seed()
    // Aaron asks for Zeno's drafts. The session, not the query param, decides.
    const res = await request(app)
      .get(`/api/v1/poems?status=draft&userId=${zeno._id}`)
      .set('Authorization', `Bearer ${makeToken(aaron._id)}`)
      .expect(200)
    expect(res.body.map((p) => p.title)).toEqual(['Aarons Secret Draft'])
  })

  test('a draft cannot be liked', async () => {
    const { aaron, zenoDraft } = await seed()
    await request(app)
      .put(`/api/v1/poem/${zenoDraft._id}`)
      .set('Authorization', `Bearer ${makeToken(aaron._id)}`)
      .expect(404)
  })

  test('a draft cannot be commented on', async () => {
    const { aaron, zenoDraft } = await seed()
    await request(app)
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${makeToken(aaron._id)}`)
      .send({ targetType: 'poem', targetId: String(zenoDraft._id), body: 'nice' })
      .expect(404)
    expect(await Comment.countDocuments({})).toBe(0)
  })
})

describe('Drafts — creating and publishing', () => {
  test('POST /poems defaults to published', async () => {
    const { zeno } = await seed()
    const res = await request(app)
      .post('/api/v1/poems')
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .send({ title: 'Out Loud', poem: 'x', genre: 'Love', date: new Date().toISOString() })
      .expect(201)

    expect(res.body.status).toBe('published')
    const list = await request(app).get('/api/v1/poems').expect(200)
    expect(list.body.map((p) => p.title)).toContain('Out Loud')
  })

  test('POST /poems with status=draft creates a private poem', async () => {
    const { zeno } = await seed()
    const res = await request(app)
      .post('/api/v1/poems')
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .send({ title: 'Kept Back', poem: 'x', genre: 'Love', date: new Date().toISOString(), status: 'draft' })
      .expect(201)

    expect(res.body.status).toBe('draft')
    const list = await request(app).get('/api/v1/poems').expect(200)
    expect(list.body.map((p) => p.title)).not.toContain('Kept Back')
  })

  test('an unrecognised status falls back to published rather than vanishing', async () => {
    const { zeno } = await seed()
    const res = await request(app)
      .post('/api/v1/poems')
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .send({ title: 'Typo Status', poem: 'x', genre: 'Love', date: new Date().toISOString(), status: 'drafts' })
      .expect(201)
    expect(res.body.status).toBe('published')
  })

  test('PATCH status=published makes a draft public and returns a fresh ranking', async () => {
    const { zeno, zenoDraft } = await seed()

    const res = await request(app)
      .patch(`/api/v1/poem/${zenoDraft._id}`)
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .send({ status: 'published' })
      .expect(200)

    expect(res.body.status).toBe('published')
    // Publishing adds a poem AND its like to the author's points: 7 -> 11.
    expect(res.body.ranking.find((row) => row.userId === String(zeno._id)).points).toBe(11)

    const list = await request(app).get('/api/v1/poems').expect(200)
    expect(list.body.map((p) => p.title)).toContain('Unfinished Aubade')
  })

  test('PATCH status=draft withdraws a published poem', async () => {
    const { zeno, zenoPublished } = await seed()

    await request(app)
      .patch(`/api/v1/poem/${zenoPublished._id}`)
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .send({ status: 'draft' })
      .expect(200)

    const list = await request(app).get('/api/v1/poems').expect(200)
    expect(list.body.map((p) => p.title)).not.toContain('Second Song')
    await request(app).get(`/api/v1/poem/${zenoPublished._id}`).expect(404)
  })

  test('a non-owner cannot publish somebody else\'s draft', async () => {
    const { aaron, zenoDraft } = await seed()
    await request(app)
      .patch(`/api/v1/poem/${zenoDraft._id}`)
      .set('Authorization', `Bearer ${makeToken(aaron._id)}`)
      .send({ status: 'published' })
      .expect(403)

    const still = await Poem.findById(zenoDraft._id)
    expect(still.status).toBe('draft')
  })

  test('an edit that does not change the status carries no ranking', async () => {
    const { zeno, zenoPublished } = await seed()
    const res = await request(app)
      .patch(`/api/v1/poem/${zenoPublished._id}`)
      .set('Authorization', `Bearer ${makeToken(zeno._id)}`)
      .send({ title: 'Second Song, revised' })
      .expect(200)
    expect(res.body.ranking).toBeUndefined()
  })
})
