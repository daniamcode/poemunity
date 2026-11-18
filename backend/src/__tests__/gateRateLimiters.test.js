/**
 * The four gates that have NO session to key on: register, availability,
 * password and verify. The counterpart to perAccountWriteLimiters.test.js —
 * those limiters could key on the caller's account; these cannot, because
 * nothing on the request identifies who is calling.
 *
 * THE BUG THIS PINS. All four keyed on `req.ip` alone, and behind the frontend's
 * /api/backend proxy every request arrives from Vercel's egress address. So each
 * was ONE bucket for the whole site: 3 registrations an HOUR, 30 availability
 * checks a MINUTE, 5 password resets an HOUR and 10 verifications an HOUR —
 * shared by every reader at once. Same failure as login (a422e09) and the write
 * limiters (de771fb), on the remaining four routes. A couple of people on the
 * register page exhaust it for everyone.
 *
 * THE DISCRIMINATING ASSERTION is the last line of each test: once subject A has
 * spent its quota, a DIFFERENT subject must still get through. Under the shared
 * address key it answered 429 — that is the bug, and it is the assertion that
 * fails without the fix.
 *
 * WHY "SUBJECT" RATHER THAN "CLIENT". These are per-actor limits by intent, and
 * the honest reading is that identifier keying trades a whole-SITE cap for a
 * per-subject cap — see the trade-off note on gateLimitKey in app.js. It is the
 * same trade loginLimiter already made: a limit that blocks every legitimate
 * reader is not a limit, it is an outage. Direct hits are still bounded per
 * address, since the address stays in the key.
 *
 * PAST THE GATE each request is answered by the handler itself (400 for a
 * half-filled registration, 200 for the deliberately generic forgot-password
 * response, 404/400 for an unknown token). The assertion is "not 429" rather
 * than a specific status: what is under test is whether the gate let the
 * request through, not what the route did with it.
 *
 * Each test mints its OWN subject, so its bucket is new without reaching into
 * the store — and so a key that fell back to "address only" fails here rather
 * than passing on leftovers.
 */
const request = require('supertest')
const { app, registerLimiter, availabilityLimiter, passwordLimiter, verifyLimiter } = require('../../app')

const TEST_ENV = process.env.NODE_ENV
// The address these limiters fall back to. All plausible spellings are reset so
// a change of address family cannot make the tests depend on each other.
const LOOPBACK_KEYS = ['127.0.0.1', '::ffff:127.0.0.1', '::1']

async function resetKeys (limiter) {
  for (const key of LOOPBACK_KEYS) await limiter.resetKey(key)
}

let seq = 0
const freshSubject = (label) => `${label}${++seq}-${Date.now()}`

/**
 * Spend subject A's whole quota, prove it is exhausted, then prove a DIFFERENT
 * subject is untouched by that. The final assertion is the whole point.
 */
const expectSeparateQuotas = async (max, send) => {
  const a = freshSubject('alpha')
  const b = freshSubject('bravo')

  for (let i = 0; i < max; i++) {
    const res = await send(a)
    expect(res.status).not.toBe(429)
  }

  // Same subject, one past the limit: the gate still applies.
  const blocked = await send(a)
  expect(blocked.status).toBe(429)

  // A DIFFERENT subject. Under the old shared-address key this answered 429,
  // which is the bug: one reader spending their quota stopped everyone else.
  const other = await send(b)
  expect(other.status).not.toBe(429)
}

describe('Gate rate limiters are keyed per subject (real app wiring)', () => {
  beforeEach(async () => {
    await resetKeys(registerLimiter)
    await resetKeys(availabilityLimiter)
    await resetKeys(passwordLimiter)
    await resetKeys(verifyLimiter)
    // Every limiter in app.js skips itself when NODE_ENV === 'test'.
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = TEST_ENV
  })

  test('one email burning the registration quota does not block another', async () => {
    // Username/password deliberately absent: the handler answers 400 before it
    // writes anything, so the test creates no accounts.
    await expectSeparateQuotas(3, email =>
      request(app)
        .post('/api/v1/register')
        .send({ email })
    )
  })

  test('one name burning the availability quota does not block another', async () => {
    await expectSeparateQuotas(30, username =>
      request(app)
        .get('/api/v1/register/availability')
        .query({ username })
    )
  })

  test('one email burning the password-reset quota does not block another', async () => {
    // /forgot answers the same generic 200 whether or not the account exists,
    // and sends nothing for an address that does.
    await expectSeparateQuotas(5, email =>
      request(app)
        .post('/api/v1/password/forgot')
        .send({ email })
    )
  })

  test('one token burning the verification quota does not block another', async () => {
    await expectSeparateQuotas(10, token =>
      request(app)
        .post('/api/v1/verify/confirm')
        .send({ token })
    )
  })

  test('casing does not open a second registration quota', async () => {
    const email = `MixedCase${++seq}@Example.COM`

    for (let i = 0; i < 3; i++) {
      await request(app)
        .post('/api/v1/register')
        .send({ email })
        .expect(400)
    }

    // The register handler lowercases the address itself and matches through
    // CI_COLLATION, so these are ONE account. A key that did not normalise
    // would hand a fresh quota to every spelling — and the four tests above
    // would still pass, which is exactly why this one exists.
    await request(app)
      .post('/api/v1/register')
      .send({ email: email.toLowerCase() })
      .expect(429)
  })

  test('the availability gate still counts the queried name, not the method', async () => {
    const username = freshSubject('charlie')

    for (let i = 0; i < 30; i++) {
      await request(app)
        .get('/api/v1/register/availability')
        .query({ username })
        .expect(200)
    }

    const blocked = await request(app)
      .get('/api/v1/register/availability')
      .query({ username })
    expect(blocked.status).toBe(429)
  })
})
