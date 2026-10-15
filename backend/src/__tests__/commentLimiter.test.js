/**
 * Comment spam gate: 10 POSTs per minute per IP, on the real app.
 *
 * Two things make this test what it is:
 *
 * 1. It uses the `commentLimiter` exported by app.js, mounted on the REAL app —
 *    not a copy of the options re-declared in the test. A re-declared limiter
 *    passes happily while app.js is edited (max raised, limiter unmounted from
 *    /api/v1/comments), which is the hollow-test shape AGENTS.md warns about.
 * 2. Every limiter in app.js skips itself when NODE_ENV === 'test' — otherwise
 *    the whole suite would trip them — so this file lifts that flag for the
 *    duration of each test and restores it in afterEach. The limiter is a
 *    module-level singleton, so its window also has to be cleared between tests
 *    via resetKey.
 */
const request = require('supertest')
const { app, commentLimiter } = require('../../app')

const TEST_ENV = process.env.NODE_ENV
// The key the limiter counts under, for a supertest client on loopback. All
// plausible spellings are reset so a change of address family cannot make the
// tests depend on each other's leftovers.
const LOOPBACK_KEYS = ['127.0.0.1', '::ffff:127.0.0.1', '::1']

describe('Comment rate limiter (real app wiring)', () => {
  beforeEach(async () => {
    for (const key of LOOPBACK_KEYS) await commentLimiter.resetKey(key)
    // Any value other than 'test' turns enforcement on.
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = TEST_ENV
    delete process.env.SIMULATION_INTERNAL_SECRET
  })

  test('allows 10 comment POSTs per minute and blocks the 11th with 429', async () => {
    // Unauthenticated: the limiter runs before the router, so these answer 401
    // from userExtractor — which is exactly what proves they got PAST the gate.
    for (let i = 0; i < 10; i++) {
      const res = await request(app).post('/api/v1/comments').expect(401)
      expect(res.headers['ratelimit-limit']).toBe('10')
    }

    const blocked = await request(app).post('/api/v1/comments').expect(429)
    expect(blocked.body.error).toBe('Too many comments, please try again later')
  })

  test('does not count or block GET requests', async () => {
    for (let i = 0; i < 15; i++) {
      // 400 = the comments route answering "give me targetType+targetId", i.e.
      // it reached the router rather than being rate-limited.
      await request(app).get('/api/v1/comments').expect(400)
    }
  })

  test('a request carrying the simulation secret bypasses the limit', async () => {
    process.env.SIMULATION_INTERNAL_SECRET = 'secret123'

    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/v1/comments').expect(401)
    }
    await request(app).post('/api/v1/comments').expect(429)

    // Same blocked IP, but the seed scripts' credential exempts it.
    const bypassed = await request(app)
      .post('/api/v1/comments')
      .set('x-simulation-secret', 'secret123')
      .expect(401)
    expect(bypassed.body.error).toBe('token missing or invalid')
  })

  test('skips entirely while NODE_ENV=test (the rest of the suite depends on it)', async () => {
    process.env.NODE_ENV = TEST_ENV

    for (let i = 0; i < 20; i++) {
      await request(app).post('/api/v1/comments').expect(401)
    }
  })
})
