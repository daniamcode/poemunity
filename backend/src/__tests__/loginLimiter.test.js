/**
 * Login gate: 5 attempts per 15 minutes — PER ACCOUNT, not per site.
 *
 * THE BUG THIS EXISTS TO CATCH. Every limiter in app.js keyed on `req.ip`
 * alone. Two things made that one shared bucket for the whole site:
 *
 *   1. Express defaults to `trust proxy: false`, so `req.ip` is the SOCKET
 *      address, not the client — the X-Forwarded-For header is ignored.
 *   2. The frontend's `pages/api/backend/[...path].ts` proxy is a server-side
 *      `fetch`. It forwards Content-Type and Authorization and nothing else,
 *      so every real reader reaches the backend from Vercel's egress IP.
 *
 * Net effect: five login attempts ANYWHERE exhausted the quota for EVERYONE,
 * for fifteen minutes. That is the "login is broken in production" report —
 * verified live before the fix, where the second proxied attempt answered 429
 * while a direct one answered 401.
 *
 * The fix keys the gate on the identifier being attempted (username or email,
 * lowercased to match the route's case-insensitive collation) ALONGSIDE the IP.
 *
 * THREE THINGS EACH TEST IS FOR:
 *
 *   - The "different account" test is the discriminator. A shared-bucket
 *     implementation answers 429 to it, because `mine` already filled the
 *     bucket. That is the bug, and it is the assertion that fails without the
 *     fix.
 *   - The casing test exists because a NAIVE fix (username in the key, no
 *     normalisation) passes every other test and still loses: login matches
 *     case-insensitively, so `MINE` and `mine` are one account and the gate
 *     must see one bucket. Five uppercase attempts would otherwise hand a
 *     sixth on a lowercase retry.
 *   - Each test uses its OWN identifier so the composite (ip|identifier)
 *     buckets are fresh without reaching into the store's internals — and so a
 *     re-declared key that fell back to "IP only" still fails loudly here
 *     rather than passing on leftovers.
 */
const request = require('supertest')
const { app, loginLimiter } = require('../../app')

const TEST_ENV = process.env.NODE_ENV

// All plausible spellings of the loopback address are reset, as in
// commentLimiter.test.js, so a change of address family cannot make the tests
// depend on each other's leftovers.
const LOOPBACK_KEYS = ['127.0.0.1', '::ffff:127.0.0.1', '::1']

let seq = 0
const freshIdentifier = () => `gatetest${++seq}`

const attempt = (username, password = 'not-the-password-1') =>
  request(app).post('/api/v1/login').send({ username, password })

describe('Login rate limiter (real app wiring)', () => {
  beforeEach(async () => {
    for (const key of LOOPBACK_KEYS) await loginLimiter.resetKey(key)
    // Every limiter in app.js skips itself when NODE_ENV === 'test', otherwise
    // the whole suite would trip them. Any other value turns enforcement on.
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = TEST_ENV
  })

  test('allows five attempts for one account and blocks the sixth', async () => {
    const id = freshIdentifier()

    for (let i = 0; i < 5; i++) {
      const res = await attempt(id).expect(401)
      expect(res.headers['ratelimit-limit']).toBe('5')
    }

    const blocked = await attempt(id).expect(429)
    expect(blocked.body.error).toBe('Too many login attempts, please try again later')
  })

  test('one account exhausting its quota does not block a different account', async () => {
    const mine = freshIdentifier()

    for (let i = 0; i < 5; i++) {
      await attempt(mine).expect(401)
    }
    // `mine` is now exhausted — this is the same account, so 429 is correct.
    await attempt(mine).expect(429)

    // THE REGRESSION. With the key being the IP alone, every login on the site
    // shared this bucket, so a handful of attempts anywhere answered 429 to a
    // reader who had never tried. The 401 below is the controller actually
    // running — proof a fresh reader still gets their five attempts.
    const other = await attempt(freshIdentifier()).expect(401)
    expect(other.body.error).toBe('invalid user or password')
  })

  test('casing does not open a second bucket', async () => {
    // Login matches username/email case-insensitively (CI_COLLATION in the
    // controller), so the gate must normalise the same way or an attacker gets
    // five fresh attempts per spelling of one account.
    const id = freshIdentifier().toUpperCase()

    for (let i = 0; i < 5; i++) {
      await attempt(id).expect(401)
    }

    await attempt(id.toLowerCase()).expect(429)
  })

  test('a request carrying the simulation secret still bypasses the gate', async () => {
    process.env.SIMULATION_INTERNAL_SECRET = 'secret123'
    const id = freshIdentifier()

    for (let i = 0; i < 6; i++) {
      await request(app)
        .post('/api/v1/login')
        .set('x-simulation-secret', 'secret123')
        .send({ username: id, password: 'not-the-password-1' })
        .expect(401)
    }
  })
})
