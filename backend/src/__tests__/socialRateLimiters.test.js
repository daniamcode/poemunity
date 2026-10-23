/**
 * The three social-write rate limiters, on the REAL app — same rules as
 * commentLimiter.test.js, and for the same reason:
 *
 * 1. Each test drives the limiter INSTANCE that app.js mounts, not a copy of
 *    its options re-declared here. A re-declared limiter passes happily while
 *    app.js is edited (max raised, limiter unmounted), which is the hollow-test
 *    shape AGENTS.md warns about.
 * 2. Every limiter skips itself when NODE_ENV === 'test' — otherwise the whole
 *    suite would trip them — so each test lifts that flag and restores it.
 *    The limiters are module-level singletons, so their windows are cleared
 *    between tests via resetKey.
 * 3. Requests here are unauthenticated, so they answer 401 from userExtractor
 *    once they get PAST the limiter. That 401 is the proof they were counted;
 *    a 429 is the proof they were blocked. No session needed either way.
 */
const request = require('supertest')
const {
  app,
  commentLimiter,
  likeLimiter,
  followLimiter,
  createPoemLimiter
} = require('../../app')

const TEST_ENV = process.env.NODE_ENV
// The key the limiters count under, for a supertest client on loopback. All
// plausible spellings are reset so a change of address family cannot make the
// tests depend on each other's leftovers.
const LOOPBACK_KEYS = ['127.0.0.1', '::ffff:127.0.0.1', '::1']

async function resetKeys (limiter) {
  for (const key of LOOPBACK_KEYS) await limiter.resetKey(key)
}

// A valid ObjectId shape: these requests are rejected by userExtractor before
// anything parses the id, but an implausible one could 400 first elsewhere.
const POEM_ID = 'aaaaaaaaaaaaaaaaaaaaaaaa'

describe('Like rate limiter (real app wiring)', () => {
  beforeEach(async () => {
    await resetKeys(likeLimiter)
    await resetKeys(commentLimiter)
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = TEST_ENV
    delete process.env.SIMULATION_INTERNAL_SECRET
  })

  test('allows 30 like PUTs per minute and blocks the 31st with 429', async () => {
    for (let i = 0; i < 30; i++) {
      const res = await request(app)
        .put(`/api/v1/poem/${POEM_ID}`)
        .expect(401)
      expect(res.headers['ratelimit-limit']).toBe('30')
    }

    const blocked = await request(app)
      .put(`/api/v1/poem/${POEM_ID}`)
      .expect(429)
    expect(blocked.body.error).toBe('Too many likes, please try again later')
  })

  test('GETs on the same router do not count', async () => {
    // 404 = the poem route answering "no such poem", i.e. the request reached
    // the router rather than being counted against the like quota.
    for (let i = 0; i < 40; i++) {
      await request(app).get(`/api/v1/poem/${POEM_ID}`).expect(404)
    }

    // The quota is untouched: the 30th PUT still passes.
    for (let i = 0; i < 30; i++) {
      await request(app).put(`/api/v1/poem/${POEM_ID}`).expect(401)
    }
  })

  test('a request carrying the simulation secret bypasses the limit', async () => {
    process.env.SIMULATION_INTERNAL_SECRET = 'secret123'

    for (let i = 0; i < 30; i++) {
      await request(app).put(`/api/v1/poem/${POEM_ID}`).expect(401)
    }

    // Same blocked IP, but the seed scripts' credential exempts it — this is
    // the --use-api-likes mode, which PUTs likes in bulk.
    const bypassed = await request(app)
      .put(`/api/v1/poem/${POEM_ID}`)
      .set('x-simulation-secret', 'secret123')
      .expect(401)
    expect(bypassed.body.error).toBe('token missing or invalid')
  })

  test('skips entirely while NODE_ENV=test (the rest of the suite depends on it)', async () => {
    process.env.NODE_ENV = TEST_ENV

    for (let i = 0; i < 40; i++) {
      await request(app).put(`/api/v1/poem/${POEM_ID}`).expect(401)
    }
  })
})

describe('Follow rate limiter (real app wiring)', () => {
  beforeEach(async () => {
    await resetKeys(followLimiter)
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = TEST_ENV
    delete process.env.SIMULATION_INTERNAL_SECRET
  })

  test('allows 10 follow requests per minute and blocks the 11th with 429', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/v1/authors/some-poet/follow')
        .expect(401)
      expect(res.headers['ratelimit-limit']).toBe('10')
    }

    const blocked = await request(app)
      .post('/api/v1/authors/some-poet/follow')
      .expect(429)
    expect(blocked.body.error).toBe('Too many follow requests, please slow down')
  })

  test('follow and unfollow share one quota — it is "how fast can this IP work the graph"', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/v1/authors/some-poet/follow').expect(401)
    }

    // The other method is blocked by the SAME exhausted window.
    await request(app)
      .delete('/api/v1/authors/some-poet/follow')
      .expect(429)
  })

  test('the public author reads under the same mount never count', async () => {
    // 200 = the authors list answering normally, past the limiter.
    for (let i = 0; i < 20; i++) {
      await request(app).get('/api/v1/authors').expect(200)
    }

    // The quota is untouched.
    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/v1/authors/some-poet/follow').expect(401)
    }
  })

  test('a request carrying the simulation secret bypasses the limit', async () => {
    process.env.SIMULATION_INTERNAL_SECRET = 'secret123'

    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/v1/authors/some-poet/follow').expect(401)
    }

    const bypassed = await request(app)
      .post('/api/v1/authors/some-poet/follow')
      .set('x-simulation-secret', 'secret123')
      .expect(401)
    expect(bypassed.body.error).toBe('token missing or invalid')
  })

  test('skips entirely while NODE_ENV=test (the rest of the suite depends on it)', async () => {
    process.env.NODE_ENV = TEST_ENV

    for (let i = 0; i < 20; i++) {
      await request(app).post('/api/v1/authors/some-poet/follow').expect(401)
    }
  })
})

describe('Poem-creation rate limiter (real app wiring)', () => {
  beforeEach(async () => {
    await resetKeys(createPoemLimiter)
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = TEST_ENV
    delete process.env.SIMULATION_INTERNAL_SECRET
  })

  test('allows 10 poem POSTs per minute and blocks the 11th with 429', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/v1/poems')
        .expect(401)
      expect(res.headers['ratelimit-limit']).toBe('10')
    }

    const blocked = await request(app)
      .post('/api/v1/poems')
      .expect(429)
    expect(blocked.body.error).toBe('Too many poems, please slow down')
  })

  test('the public poem reads never count', async () => {
    for (let i = 0; i < 20; i++) {
      await request(app).get('/api/v1/poems').expect(200)
    }

    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/v1/poems').expect(401)
    }
  })

  test('a request carrying the simulation secret bypasses the limit', async () => {
    process.env.SIMULATION_INTERNAL_SECRET = 'secret123'

    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/v1/poems').expect(401)
    }

    const bypassed = await request(app)
      .post('/api/v1/poems')
      .set('x-simulation-secret', 'secret123')
      .expect(401)
    expect(bypassed.body.error).toBe('token missing or invalid')
  })

  test('skips entirely while NODE_ENV=test (the rest of the suite depends on it)', async () => {
    process.env.NODE_ENV = TEST_ENV

    for (let i = 0; i < 20; i++) {
      await request(app).post('/api/v1/poems').expect(401)
    }
  })
})
