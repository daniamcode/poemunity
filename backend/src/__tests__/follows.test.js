const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { app } = require('../../app')
const Author = require('../models/Author')
const Follow = require('../models/Follow')

// ---------------------------------------------------------------------------
// The social graph.
//
// The fixture is built so that a WRONG implementation returns a DIFFERENT
// answer, not the same one by luck. Three orderings are deliberately made to
// disagree with each other:
//
//   creation order (_id ASC):  Zora, Ada, Milo
//   alphabetical (name ASC):   Ada, Milo, Zora
//   follow order (createdAt):  Milo, Zora, Ada   → newest-first: Ada, Zora, Milo
//
// So an implementation that sorted by `_id` (either direction), or by name, or
// that returned the natural collection order, produces a list that differs from
// the expected one in the FIRST position. The same three edges are what the
// pagination test slices, so a page-2 that repeats or drops a row is visible.
//
// Milo is an AI persona: following one is allowed, but every follow surface has
// to be able to badge it, so `type: 'ai'` must survive onto the list row. A
// fixture where every author was a human would pass against a serializer that
// dropped `type` entirely.
// ---------------------------------------------------------------------------

const makeToken = (authorId) =>
  jwt.sign({ id: String(authorId), username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

// Timestamps a day apart, set explicitly AFTER creation: Mongoose's
// `timestamps` option owns createdAt on insert, so the only reliable way to
// pin an ordering is to overwrite it through the driver afterwards.
const T = (day) => new Date(`2026-05-${String(day).padStart(2, '0')}T09:00:00.000Z`)

async function setCreatedAt (followId, when) {
  await Follow.collection.updateOne(
    { _id: new mongoose.Types.ObjectId(String(followId)) },
    { $set: { createdAt: when } }
  )
}

async function seed () {
  // Nadia is the author everybody follows and whose page is under test.
  const nadia = await Author.create({
    username: 'nadia', name: 'Nadia Novak', slug: 'nadia-novak', type: 'user'
  })

  // Creation order is deliberately NOT alphabetical order.
  const zora = await Author.create({ username: 'zora', name: 'Zora Quist', slug: 'zora-quist', type: 'user' })
  const ada = await Author.create({ username: 'ada', name: 'Ada Brine', slug: 'ada-brine', type: 'user' })
  const milo = await Author.create({ username: 'milo', name: 'Milo Vex', slug: 'milo-vex', type: 'ai' })

  // Follow order is a third order again.
  const fMilo = await Follow.create({ follower: milo._id, following: nadia._id })
  const fZora = await Follow.create({ follower: zora._id, following: nadia._id })
  const fAda = await Follow.create({ follower: ada._id, following: nadia._id })

  await setCreatedAt(fMilo._id, T(1))
  await setCreatedAt(fZora._id, T(2))
  await setCreatedAt(fAda._id, T(3))

  return { nadia, zora, ada, milo, fMilo, fZora, fAda }
}

const names = (res) => res.body.authors.map(a => a.name)

describe('Follow — writes', () => {
  test('follows an author and reports the fresh counts', async () => {
    const { nadia, ada } = await seed()

    const res = await request(app)
      .post('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${makeToken(ada._id)}`)
      .expect(200)

    expect(res.body.following).toBe(true)
    // Ada already follows Nadia from the fixture, so the count stays 3 — and
    // that is the point of the next test.
    expect(res.body.followerCount).toBe(3)
    expect(await Follow.countDocuments({ follower: ada._id, following: nadia._id })).toBe(1)
  })

  test('is IDEMPOTENT — following twice succeeds and creates one edge', async () => {
    const { nadia, zora } = await seed()
    await Follow.deleteMany({ follower: zora._id })

    const token = makeToken(zora._id)
    const first = await request(app)
      .post('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    const second = await request(app)
      .post('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(first.body.following).toBe(true)
    expect(second.body.following).toBe(true)
    expect(second.body.followerCount).toBe(first.body.followerCount)
    expect(await Follow.countDocuments({ follower: zora._id, following: nadia._id })).toBe(1)
  })

  test('the compound index makes a duplicate edge impossible at the storage layer', async () => {
    const { nadia, ada } = await seed()
    await Follow.init()

    // Not going through the route: this asserts the INDEX is what guarantees
    // uniqueness, so the controller's E11000 branch is guarding something real
    // rather than a check it could have done itself and lost a race on.
    await expect(Follow.create({ follower: ada._id, following: nadia._id }))
      .rejects.toMatchObject({ code: 11000 })
  })

  test('rejects a self-follow with 400 and writes nothing', async () => {
    const { nadia } = await seed()

    const res = await request(app)
      .post('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${makeToken(nadia._id)}`)
      .expect(400)

    expect(res.body.error).toMatch(/yourself/i)
    expect(await Follow.countDocuments({ follower: nadia._id, following: nadia._id })).toBe(0)
  })

  test('the follower comes from the SESSION — a follower in the body is ignored', async () => {
    const { nadia, zora, ada } = await seed()
    await Follow.deleteMany({})

    await request(app)
      .post('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${makeToken(zora._id)}`)
      // Forging a follow on Ada's behalf.
      .send({ follower: String(ada._id), following: String(ada._id) })
      .expect(200)

    const edges = await Follow.find({})
    expect(edges).toHaveLength(1)
    expect(String(edges[0].follower)).toBe(String(zora._id))
    expect(String(edges[0].following)).toBe(String(nadia._id))
  })

  test('404 for an author that does not exist', async () => {
    const { ada } = await seed()

    await request(app)
      .post('/api/v1/authors/no-such-poet/follow')
      .set('Authorization', `Bearer ${makeToken(ada._id)}`)
      .expect(404)
  })

  test('401 without a session', async () => {
    await seed()
    await request(app).post('/api/v1/authors/nadia-novak/follow').expect(401)
    await request(app).delete('/api/v1/authors/nadia-novak/follow').expect(401)
  })

  test('unfollow removes the edge, and unfollowing again still succeeds', async () => {
    const { nadia, ada } = await seed()
    const token = makeToken(ada._id)

    const first = await request(app)
      .delete('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(first.body.following).toBe(false)
    expect(first.body.followerCount).toBe(2)
    expect(await Follow.countDocuments({ follower: ada._id, following: nadia._id })).toBe(0)

    const second = await request(app)
      .delete('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    expect(second.body.following).toBe(false)
    expect(second.body.followerCount).toBe(2)
  })

  test('unfollowing one author leaves other people’s edges alone', async () => {
    const { nadia, ada, zora } = await seed()

    await request(app)
      .delete('/api/v1/authors/nadia-novak/follow')
      .set('Authorization', `Bearer ${makeToken(ada._id)}`)
      .expect(200)

    expect(await Follow.countDocuments({ follower: zora._id, following: nadia._id })).toBe(1)
  })

  test('accepts an author ID as well as a slug (the profile tabs only have an id)', async () => {
    const { nadia, zora } = await seed()
    await Follow.deleteMany({ follower: zora._id })

    const res = await request(app)
      .post(`/api/v1/authors/${nadia._id}/follow`)
      .set('Authorization', `Bearer ${makeToken(zora._id)}`)
      .expect(200)

    expect(res.body.following).toBe(true)
    expect(await Follow.countDocuments({ follower: zora._id, following: nadia._id })).toBe(1)
  })
})

describe('Follow — lists', () => {
  test('followers are newest-follow-first, not alphabetical and not by id', async () => {
    await seed()

    const res = await request(app).get('/api/v1/authors/nadia-novak/followers').expect(200)

    expect(names(res)).toEqual(['Ada Brine', 'Zora Quist', 'Milo Vex'])
    expect(res.body.total).toBe(3)
  })

  test('breaks a createdAt tie by _id, descending', async () => {
    const { fZora, fAda } = await seed()
    // Two edges at the SAME instant — the shape of a batch-seeded graph. Ada's
    // edge was created after Zora's, so _id DESC puts Ada first.
    const tie = T(2)
    await setCreatedAt(fZora._id, tie)
    await setCreatedAt(fAda._id, tie)

    const res = await request(app).get('/api/v1/authors/nadia-novak/followers').expect(200)

    expect(names(res)).toEqual(['Ada Brine', 'Zora Quist', 'Milo Vex'])
  })

  // KNOWN LIMIT of the test above, found by red-check and worth stating rather
  // than leaving for the next person to rediscover: it passes if you delete
  // `_id` from the SORT SPEC alone, because the index's own third key already
  // returns ties in `_id` order. It fails only when both lose `_id`.
  //
  // The sort spec is nonetheless where the guarantee lives — index order for an
  // unspecified tie is an implementation detail MongoDB does not promise — so
  // the index is pinned separately here. It also guards something the ordering
  // test cannot see at all: `autoIndex` is ON in production and only ever
  // CREATES, so an index quietly dropped from this schema lives on in Atlas
  // forever while the code stops relying on it (see AGENTS.md).
  test('the declared indexes are the ones the queries need', () => {
    const declared = Follow.schema.indexes().map(([keys, opts]) => ({ keys, opts }))
    const find = (keys) =>
      declared.find(d => JSON.stringify(d.keys) === JSON.stringify(keys))

    // The uniqueness invariant — an edge exists at most once.
    expect(find({ follower: 1, following: 1 })?.opts).toMatchObject({ unique: true })

    // One per list direction. A compound index is only usable from a prefix, so
    // the unique index above cannot answer "everyone who follows B" at all.
    expect(find({ following: 1, createdAt: -1, _id: -1 })).toBeDefined()
    expect(find({ follower: 1, createdAt: -1, _id: -1 })).toBeDefined()
  })

  test('paginates without repeating or dropping a row', async () => {
    await seed()

    const p1 = await request(app).get('/api/v1/authors/nadia-novak/followers?page=1&limit=2').expect(200)
    const p2 = await request(app).get('/api/v1/authors/nadia-novak/followers?page=2&limit=2').expect(200)

    expect(names(p1)).toEqual(['Ada Brine', 'Zora Quist'])
    expect(names(p2)).toEqual(['Milo Vex'])
    expect(p1.body.total).toBe(3)
    expect(p1.body.totalPages).toBe(2)
    expect(p1.body.hasMore).toBe(true)
    expect(p2.body.hasMore).toBe(false)
    // The union is the whole list exactly once.
    expect([...names(p1), ...names(p2)]).toHaveLength(new Set([...names(p1), ...names(p2)]).size)
  })

  test('caps the page size so a 3,000-follower author cannot be asked for in one request', async () => {
    await seed()

    const res = await request(app).get('/api/v1/authors/nadia-novak/followers?limit=5000').expect(200)

    expect(res.body.limit).toBe(100)
  })

  test('rejects nonsense pagination', async () => {
    await seed()

    await request(app).get('/api/v1/authors/nadia-novak/followers?page=0').expect(400)
    await request(app).get('/api/v1/authors/nadia-novak/followers?limit=0').expect(400)
  })

  test('following is the other direction of the same edge', async () => {
    const { nadia, ada } = await seed()

    const nadiaFollowing = await request(app).get('/api/v1/authors/nadia-novak/following').expect(200)
    expect(nadiaFollowing.body.authors).toEqual([])
    expect(nadiaFollowing.body.total).toBe(0)

    const adaFollowing = await request(app).get('/api/v1/authors/ada-brine/following').expect(200)
    expect(names(adaFollowing)).toEqual(['Nadia Novak'])
    expect(adaFollowing.body.authors[0].slug).toBe('nadia-novak')
    expect(String(adaFollowing.body.authors[0].id)).toBe(String(nadia._id))
    expect(String(ada._id)).not.toBe(String(nadia._id))
  })

  test('carries authorType so every follow surface can badge an AI persona', async () => {
    await seed()

    const res = await request(app).get('/api/v1/authors/nadia-novak/followers').expect(200)

    const milo = res.body.authors.find(a => a.name === 'Milo Vex')
    expect(milo.type).toBe('ai')
    expect(res.body.authors.find(a => a.name === 'Ada Brine').type).toBe('user')
  })

  test('the lists are public — no session required', async () => {
    await seed()
    await request(app).get('/api/v1/authors/nadia-novak/followers').expect(200)
    await request(app).get('/api/v1/authors/nadia-novak/following').expect(200)
  })

  test('404 for an author that does not exist', async () => {
    await seed()
    await request(app).get('/api/v1/authors/no-such-poet/followers').expect(404)
    await request(app).get('/api/v1/authors/no-such-poet/following').expect(404)
  })
})

describe('Follow — counts on the author page', () => {
  test('GET /authors/:slug carries followerCount, followingCount and isFollowing', async () => {
    const { ada } = await seed()

    const res = await request(app)
      .get('/api/v1/authors/nadia-novak')
      .set('Authorization', `Bearer ${makeToken(ada._id)}`)
      .expect(200)

    expect(res.body.followerCount).toBe(3)
    expect(res.body.followingCount).toBe(0)
    expect(res.body.isFollowing).toBe(true)
  })

  test('the two counts are not the same number read twice', async () => {
    const { ada, zora, milo } = await seed()
    // Ada follows Nadia (from the fixture) plus Zora and Milo: 3 out, 0 in.
    await Follow.create({ follower: ada._id, following: zora._id })
    await Follow.create({ follower: ada._id, following: milo._id })

    const res = await request(app).get('/api/v1/authors/ada-brine').expect(200)

    expect(res.body.followingCount).toBe(3)
    expect(res.body.followerCount).toBe(0)
  })

  test('isFollowing is false for a signed-in viewer who does not follow', async () => {
    const { nadia, ada } = await seed()
    await Follow.deleteMany({ follower: ada._id, following: nadia._id })

    const res = await request(app)
      .get('/api/v1/authors/nadia-novak')
      .set('Authorization', `Bearer ${makeToken(ada._id)}`)
      .expect(200)

    expect(res.body.isFollowing).toBe(false)
    expect(res.body.followerCount).toBe(2)
  })

  test('a logged-out visitor gets the counts and an explicit isFollowing: false', async () => {
    await seed()

    const res = await request(app).get('/api/v1/authors/nadia-novak').expect(200)

    expect(res.body.followerCount).toBe(3)
    expect(res.body).toHaveProperty('isFollowing', false)
  })

  test('a garbage session does not 500 the public author page', async () => {
    await seed()

    const res = await request(app)
      .get('/api/v1/authors/nadia-novak')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(200)

    expect(res.body.isFollowing).toBe(false)
    expect(res.body.followerCount).toBe(3)
  })
})
