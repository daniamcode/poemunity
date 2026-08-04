const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')

// ---------------------------------------------------------------------------
// GET /api/v1/users/stats — the profile stats panel.
//
// Two numbers, and the only thing that can go wrong with them is COUNTING THE
// WRONG POEMS. Both are scoped to published poems by the session's own author,
// which makes three failure modes worth pinning: counting somebody else's
// poems, counting drafts, and failing to count the ~16k legacy poems that carry
// no `status` field at all.
// ---------------------------------------------------------------------------

const makeToken = (id) =>
  jwt.sign({ id: String(id), username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

const stats = (id) =>
  request(app).get('/api/v1/users/stats').set('Authorization', `Bearer ${makeToken(id)}`)

const poem = (authorId, overrides = {}) => Poem.create({
  title: `Poem ${Math.random()}`,
  poem: 'content',
  genre: 'love',
  authorId,
  origin: 'user',
  date: new Date(),
  likes: [],
  ...overrides
})

describe('GET /users/stats', () => {
  let me
  let other

  beforeEach(async () => {
    me = await Author.create({ username: 'me', name: 'Me Poet', slug: 'me-poet', type: 'user' })
    other = await Author.create({ username: 'other', name: 'Other Poet', slug: 'other-poet', type: 'user' })
  })

  test('401 without a session', async () => {
    await request(app).get('/api/v1/users/stats').expect(401)
  })

  test('a poet with nothing published gets zeroes, not an error', async () => {
    // The aggregation returns NO ROWS here, not a row of zeroes — the reason
    // the handler cannot just read stats.poemsPublished.
    const res = await stats(me._id).expect(200)

    expect(res.body).toEqual({ poemsPublished: 0, likesReceived: 0 })
  })

  test('counts published poems and sums their likes', async () => {
    await poem(me._id, { likes: ['a', 'b', 'c'] })
    await poem(me._id, { likes: ['a'] })

    const res = await stats(me._id).expect(200)

    expect(res.body).toEqual({ poemsPublished: 2, likesReceived: 4 })
  })

  test('never counts another poet’s poems', async () => {
    // The distractor: the other poet has MORE of everything, so an unscoped
    // aggregation returns a different, larger answer rather than a coincidence.
    await poem(other._id, { likes: ['x', 'y', 'z', 'w'] })
    await poem(other._id, { likes: ['x', 'y'] })
    await poem(other._id, { likes: ['x'] })
    await poem(me._id, { likes: ['a'] })

    const res = await stats(me._id).expect(200)

    expect(res.body).toEqual({ poemsPublished: 1, likesReceived: 1 })
  })

  test('excludes drafts, including their likes', async () => {
    // A poem CAN carry likes and be a draft: it was liked while public, then
    // withdrawn. Those likes are no longer part of anything a reader can reach,
    // and the ranking does not count them either.
    await poem(me._id, { likes: ['a', 'b'] })
    await poem(me._id, { status: 'draft', likes: ['c', 'd', 'e'] })

    const res = await stats(me._id).expect(200)

    expect(res.body).toEqual({ poemsPublished: 1, likesReceived: 2 })
  })

  test('counts legacy poems stored with no status field', async () => {
    // ~16k poems predate `status`. "Published" means published OR ABSENT — a
    // filter written as { status: 'published' } would report 0 for almost
    // everyone. Inserted through the raw driver so no schema default is applied.
    await Poem.collection.insertOne({
      title: 'Legacy',
      poem: 'content',
      genre: 'love',
      authorId: me._id,
      origin: 'user',
      date: new Date(),
      likes: ['a', 'b']
    })

    const res = await stats(me._id).expect(200)

    expect(res.body).toEqual({ poemsPublished: 1, likesReceived: 2 })
  })

  test('a poem with no likes field at all counts as zero likes, not an error', async () => {
    // $size throws on a missing field rather than treating it as empty, so this
    // is a 500 without the $ifNull.
    await Poem.collection.insertOne({
      title: 'Likeless', poem: 'c', genre: 'love', authorId: me._id, origin: 'user', date: new Date()
    })

    const res = await stats(me._id).expect(200)

    expect(res.body).toEqual({ poemsPublished: 1, likesReceived: 0 })
  })

  test('is scoped by the session, never by a query parameter', async () => {
    // Same rule as the drafts tab and the notification routes: a private number
    // scoped by anything the client can name is not private.
    await poem(other._id, { likes: ['x', 'y'] })

    const res = await stats(me._id).query({ userId: String(other._id) }).expect(200)

    expect(res.body).toEqual({ poemsPublished: 0, likesReceived: 0 })
  })

  test('an author id with no author still answers', async () => {
    const ghost = new mongoose.Types.ObjectId()

    const res = await stats(ghost).expect(200)

    expect(res.body).toEqual({ poemsPublished: 0, likesReceived: 0 })
  })
})
