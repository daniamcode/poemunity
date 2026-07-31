const request = require('supertest')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')

// ---------------------------------------------------------------------------
// Server-owned poem fields.
//
// `Poem` is `strict: false`, and both write endpoints once took the client's
// word for more than they should have: `POST /poems` spread the request body
// wholesale, and `PATCH /poem/:id` had an allowlist that included `likes`,
// `date`, `origin` and `userId`. Since editing is owner-gated, all of those
// were self-service.
//
// The one that matters most is `likes`. The author ranking is
// `3×poems + 1×likes` (utils/ranking.js), computed server-side and rendered in
// the public sidebar — so a poet who posted a poem carrying a hundred
// fabricated likes went straight to the top of it, in one request, without ever
// touching the like endpoint.
//
// Every test here therefore sends a HOSTILE payload and asserts on what was
// PERSISTED, not on the status code: the endpoints answer 201/200 either way
// (unknown fields are dropped, not rejected, because the profile form posts the
// whole poem object on every save). A test that checked only the status code
// would pass against the vulnerable version — which is precisely how this
// survived a green suite.
// ---------------------------------------------------------------------------

const FORGED_LIKES = ['aaaaaaaaaaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbbbbbbbbbb']
// Comfortably in the future, and far enough from "now" that a server-stamped
// date can never be mistaken for it.
const FORGED_DATE = new Date('2099-12-31T00:00:00.000Z')

const makeToken = (authorId) =>
  jwt.sign({ id: String(authorId), username: 'poet' }, process.env.SECRET, { expiresIn: '1d' })

describe('poem write endpoints ignore server-owned fields', () => {
  let poet, admin, poetToken, adminToken

  beforeEach(async () => {
    poet = await Author.create({
      username: 'poet', name: 'Ordinary Poet', slug: 'ordinary-poet', type: 'user'
    })
    admin = await Author.create({
      username: 'admin', name: 'The Admin', slug: 'the-admin', type: 'user'
    })
    poetToken = makeToken(poet._id)
    adminToken = makeToken(admin._id)
    process.env.REACT_APP_ADMIN = String(admin._id)
  })

  afterEach(() => {
    delete process.env.REACT_APP_ADMIN
  })

  describe('POST /api/v1/poems', () => {
    // The full hostile body: real fields the form sends, plus every field the
    // server is supposed to own, plus one it has never heard of (which
    // `strict: false` would otherwise happily store).
    const hostile = {
      title: 'A Perfectly Ordinary Poem',
      poem: 'Nothing to see here.',
      genre: 'love',
      likes: FORGED_LIKES,
      date: FORGED_DATE,
      origin: 'famous',
      isFeatured: true
    }

    const create = (token) =>
      request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${token}`)
        .send(hostile)

    test('stores no likes, whatever the client sent', async () => {
      const res = await create(poetToken)
      expect(res.status).toBe(201)

      const saved = await Poem.findById(res.body.id)
      expect(saved.likes).toEqual([])
    })

    test('stamps its own date', async () => {
      const before = Date.now()
      const res = await create(poetToken)

      const saved = await Poem.findById(res.body.id)
      expect(saved.date.getTime()).toBeGreaterThanOrEqual(before)
      expect(saved.date.getTime()).toBeLessThanOrEqual(Date.now())
      expect(saved.date.getFullYear()).not.toBe(2099)
    })

    test('derives origin from the author, so a poet cannot publish as famous', async () => {
      const res = await create(poetToken)

      const saved = await Poem.findById(res.body.id)
      expect(saved.origin).toBe('user')
    })

    test('drops a field the schema does not declare', async () => {
      // `strict: false` means an unknown key is persisted verbatim. This is the
      // test that makes the allowlist an allowlist rather than a delete-list:
      // it fails if someone reintroduces the spread AND remembers to null out
      // only the three fields named above.
      const res = await create(poetToken)

      const saved = await Poem.findById(res.body.id)
      expect(saved.toObject().isFeatured).toBeUndefined()
    })

    test('the forged likes do not reach the ranking', async () => {
      // The end the whole exercise is about: two fabricated likes are two
      // ranking points. This asserts on the public aggregate rather than on the
      // stored document, because that is what a reader actually sees.
      await create(poetToken)

      const ranking = await request(app).get('/api/v1/poems/ranking?origin=user')
      const entry = ranking.body.find(a => a.author === 'Ordinary Poet')

      // 3 for the poem, 0 for likes — not 5.
      expect(entry.points).toBe(3)
    })

    test('the admin may still backdate', async () => {
      // The counterpart to "stamps its own date": seeded fake-poet content is
      // spread across a plausible history rather than all landing at once.
      // (poems.create.test.js covers this too, but that file authenticates as
      // the admin throughout — here the contrast with the poet is explicit.)
      const res = await create(adminToken)

      const saved = await Poem.findById(res.body.id)
      expect(saved.date.getFullYear()).toBe(2099)
    })

    test('the admin may still seed likes', async () => {
      // Not an oversight: the admin seeds fake-poet content from this form, and
      // the `userId` override on the same endpoint is already admin-gated.
      const res = await create(adminToken)

      const saved = await Poem.findById(res.body.id)
      expect(saved.likes).toEqual(FORGED_LIKES)
    })

    test('discards non-string likes even for the admin', async () => {
      // `Poem.likes` is `[String]` and every like comparison is strict, so a
      // number here would be a like that no unlike request could ever match.
      const res = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...hostile, likes: ['  padded  ', 42, null, ''] })

      const saved = await Poem.findById(res.body.id)
      expect(saved.likes).toEqual(['padded'])
    })
  })

  describe('PATCH /api/v1/poem/:poemId', () => {
    let poemId

    beforeEach(async () => {
      const poem = await Poem.create({
        title: 'Original',
        poem: 'Original words',
        genre: 'love',
        authorId: poet._id,
        origin: 'user',
        likes: [],
        date: new Date('2026-01-01T00:00:00.000Z')
      })
      poemId = String(poem._id)
    })

    const patch = (token, body) =>
      request(app)
        .patch(`/api/v1/poem/${poemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(body)

    test('an owner may still edit the words, title, genre and status', async () => {
      // The guard rail on the guard rail: an allowlist that is too narrow
      // breaks ordinary editing, which no security test would notice.
      const res = await patch(poetToken, {
        title: 'Revised', poem: 'Revised words', genre: 'hope', status: 'draft'
      })
      expect(res.status).toBe(200)

      const saved = await Poem.findById(poemId)
      expect(saved.title).toBe('Revised')
      expect(saved.poem).toBe('Revised words')
      expect(saved.genre).toBe('hope')
      expect(saved.status).toBe('draft')
    })

    test('an owner cannot award themselves likes by editing', async () => {
      await patch(poetToken, { likes: FORGED_LIKES })

      const saved = await Poem.findById(poemId)
      expect(saved.likes).toEqual([])
    })

    test('an owner cannot repin their poem to the top by editing the date', async () => {
      await patch(poetToken, { date: FORGED_DATE })

      const saved = await Poem.findById(poemId)
      expect(saved.date.getFullYear()).toBe(2026)
    })

    test('an owner cannot promote their poem to famous', async () => {
      await patch(poetToken, { origin: 'famous' })

      const saved = await Poem.findById(poemId)
      expect(saved.origin).toBe('user')
    })

    test('an owner cannot write a stray userId onto the poem', async () => {
      await patch(poetToken, { userId: String(admin._id) })

      const saved = await Poem.findById(poemId)
      expect(String(saved.authorId)).toBe(String(poet._id))
      // The `authorId` assertion above passes even against the old allowlist,
      // because `$set: { userId }` never touched `authorId` — it wrote a stray
      // `userId` key that `strict: false` happily kept. That key is the real
      // difference, and it is not harmless: `serializePoem` derives `userId`
      // from the populated author, so an unpopulated read would hand the client
      // an authorship claim the poem does not actually have.
      expect(saved.toObject().userId).toBeUndefined()
    })

    test('a rejected field does not block the fields alongside it', async () => {
      // The form posts the whole poem object, so dropping-not-rejecting is what
      // keeps an ordinary save working. A 400 here would break editing.
      const res = await patch(poetToken, { title: 'Revised', likes: FORGED_LIKES })
      expect(res.status).toBe(200)

      const saved = await Poem.findById(poemId)
      expect(saved.title).toBe('Revised')
      expect(saved.likes).toEqual([])
    })

    test('the admin keeps the wider set', async () => {
      await patch(adminToken, { likes: FORGED_LIKES, origin: 'famous' })

      const saved = await Poem.findById(poemId)
      expect(saved.likes).toEqual(FORGED_LIKES)
      expect(saved.origin).toBe('famous')
    })
  })
})
