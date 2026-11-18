/**
 * The four authenticated-write limiters, keyed PER ACCOUNT — the counterpart to
 * socialRateLimiters.test.js, which drives the same limiters WITHOUT a session.
 *
 * THE BUG THIS PINS. commentLimiter, likeLimiter, followLimiter and
 * createPoemLimiter all keyed on `req.ip` alone, and behind the frontend's
 * /api/backend proxy every request arrives from Vercel's egress IP. Each was
 * therefore ONE bucket for the whole site: 10 comments a minute, 30 likes, 10
 * follows and 10 poems — shared by every reader at once. A handful of comments
 * anywhere stopped everybody commenting. It is the same failure that broke
 * login, on four more routes.
 *
 * THE DISCRIMINATING ASSERTION is the last line of each test: after account A
 * has spent its entire quota, account B must still get through. Under the old
 * shared-IP key B answered 429 — that is the bug, and it is the assertion that
 * fails without the fix.
 *
 * WHY A SESSION IS NEEDED HERE. `userExtractor` runs INSIDE the routers, which
 * the limiters are mounted ahead of, so `req.userId` is unset when the key is
 * built — the key peeks at the token instead (userExtractor.peekUserId). That
 * means these requests need a real signed token for the limiter to see an
 * account at all. The no-session path, which falls back to the client address,
 * is covered by socialRateLimiters.test.js and must stay unchanged.
 *
 * Each test uses its OWN freshly minted account id, so its bucket is new
 * without reaching into the store — and so a key that fell back to "address
 * only" fails here rather than passing on leftovers.
 *
 * PAST THE GATE each request is answered by the handler itself (400 for a
 * comment or poem with no body, 404 for a target that does not exist). The
 * assertion is deliberately "not 429" rather than a specific status: what is
 * under test is whether the gate let the request through, not what the route
 * did with it.
 */
const request = require('supertest')
const jwt = require('jsonwebtoken')
const {
  app,
  commentLimiter,
  likeLimiter,
  followLimiter,
  createPoemLimiter
} = require('../../app')

const TEST_ENV = process.env.NODE_ENV
// The address the limiters fall back to for an unauthenticated request. All
// plausible spellings are reset, as in socialRateLimiters.test.js.
const LOOPBACK_KEYS = ['127.0.0.1', '::ffff:127.0.0.1', '::1']

// A valid ObjectId shape, freshly minted per test: the key IS the account, so a
// unique id is what gives each test its own bucket.
const freshAccountId = () => {
  const hex = '0123456789abcdef'
  let id = ''
  for (let i = 0; i < 24; i++) id += hex[Math.floor(Math.random() * 16)]
  return id
}

const tokenFor = id =>
  jwt.sign({ id, username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

// A valid ObjectId so the poem route answers 404 rather than 400 on the id.
const POEM_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa'

/**
 * Spend account A's whole quota, prove it is exhausted, then prove account B is
 * untouched by that. The final assertion is the whole point of the file.
 */
const expectSeparateQuotas = async (max, send) => {
  const a = tokenFor(freshAccountId())
  const b = tokenFor(freshAccountId())

  for (let i = 0; i < max; i++) {
    const res = await send(a)
    expect(res.status).not.toBe(429)
  }

  // Same account, one past the limit: the gate still applies.
  const blocked = await send(a)
  expect(blocked.status).toBe(429)

  // A DIFFERENT account. Under the old shared bucket this answered 429, which
  // is exactly the bug: one reader spending their quota stopped everyone else.
  const other = await send(b)
  expect(other.status).not.toBe(429)
}

describe('Write limiters are keyed per account (real app wiring)', () => {
  beforeEach(async () => {
    for (const key of LOOPBACK_KEYS) {
      await commentLimiter.resetKey(key)
      await likeLimiter.resetKey(key)
      await followLimiter.resetKey(key)
      await createPoemLimiter.resetKey(key)
    }
    // Every limiter in app.js skips itself when NODE_ENV === 'test'.
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = TEST_ENV
  })

  test('one account spending its comment quota does not block another', async () => {
    await expectSeparateQuotas(10, token =>
      request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
    )
  })

  test('one account spending its like quota does not block another', async () => {
    await expectSeparateQuotas(30, token =>
      request(app)
        .put(`/api/v1/poem/${POEM_ID}`)
        .set('Authorization', `Bearer ${token}`)
    )
  })

  test('one account spending its follow quota does not block another', async () => {
    await expectSeparateQuotas(10, token =>
      request(app)
        .post('/api/v1/authors/some-poet/follow')
        .set('Authorization', `Bearer ${token}`)
    )
  })

  test('one account spending its poem-creation quota does not block another', async () => {
    await expectSeparateQuotas(10, token =>
      request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${token}`)
    )
  })

  test('follow and unfollow still share one quota per account', async () => {
    const a = tokenFor(freshAccountId())

    for (let i = 0; i < 10; i++) {
      await request(app)
        .post('/api/v1/authors/some-poet/follow')
        .set('Authorization', `Bearer ${a}`)
        .expect(404)
    }

    // The other method is blocked by the SAME exhausted account window.
    const blocked = await request(app)
      .delete('/api/v1/authors/some-poet/follow')
      .set('Authorization', `Bearer ${a}`)
    expect(blocked.status).toBe(429)
  })
})
