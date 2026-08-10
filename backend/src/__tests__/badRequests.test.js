const request = require('supertest')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const Comment = require('../models/Comment')

/**
 * A MALFORMED QUERY PARAMETER IS A 400, NOT A 500.
 *
 * Three public endpoints passed a query parameter straight to the driver, which
 * threw a CastError into the handler's catch-all — so a typo answered
 * "500 Internal Server Error". Two reasons that matters beyond tidiness:
 *
 *   It is a lie about whose fault it is. Nothing internal went wrong, and a
 *   client cannot tell "I sent nonsense" from "the site is down".
 *
 *   It buries real failures. 500s are what uptime monitoring and log alerts key
 *   on, and an endpoint that 500s on any stray character trains everyone to
 *   ignore them.
 *
 * The distractor these tests are built around: a VALID id that matches nothing
 * must still answer 200 with an empty list. A "fix" that rejected anything not
 * found would pass a status-code check while breaking every legitimate empty
 * result on the site.
 */
describe('malformed query parameters', () => {
  const VALID_UNUSED_ID = '6a79d1461e5faea3888e9f2c'

  describe('GET /poems?userId=', () => {
    test('junk is a 400', async () => {
      const res = await request(app).get('/api/v1/poems?userId=junk').expect(400)

      expect(res.body.error).toMatch(/userId/i)
    })

    test('a valid id that matches nobody is an empty 200, not a 400', async () => {
      const res = await request(app).get(`/api/v1/poems?userId=${VALID_UNUSED_ID}`).expect(200)

      expect(res.body).toEqual([])
    })

    test('the check does not fire on the drafts route, which ignores userId', async () => {
      // `?status=draft` scopes by the SESSION and deliberately ignores userId —
      // so a junk one there must not become a 400 that implies it was read.
      await request(app).get('/api/v1/poems?status=draft&userId=junk').expect(401)
    })
  })

  describe('GET /comments', () => {
    test('a junk targetId is a 400', async () => {
      const res = await request(app)
        .get('/api/v1/comments?targetType=poem&targetId=junk')
        .expect(400)

      expect(res.body.error).toMatch(/targetId/i)
    })

    test('an unparseable since date is a 400', async () => {
      // `new Date('junk')` is an Invalid Date, which does not throw here — it
      // throws later, inside the query, which is why this needed its own check.
      const res = await request(app).get('/api/v1/comments?since=junk').expect(400)

      expect(res.body.error).toMatch(/since/i)
    })

    test('a real target and a real date still work', async () => {
      const author = await Author.create({ name: 'Ada Brine', slug: 'ada-brine', type: 'user' })
      const poem = await Poem.create({
        title: 'Aubade', slug: 'aubade-x', poem: 'c', genre: 'love', authorId: author._id, origin: 'user', date: new Date()
      })
      await Comment.create({
        targetType: 'poem', targetId: poem._id, authorId: author._id, body: 'a comment'
      })

      const byTarget = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poem._id}`)
        .expect(200)
      const bySince = await request(app)
        .get('/api/v1/comments?since=1970-01-01')
        .expect(200)

      expect(byTarget.body).toHaveLength(1)
      expect(bySince.body).toHaveLength(1)
    })

    test('a valid targetId with no comments is an empty 200', async () => {
      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${VALID_UNUSED_ID}`)
        .expect(200)

      expect(res.body).toEqual([])
    })
  })
})
