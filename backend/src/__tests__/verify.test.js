// Mock the email util so no network/real send can ever happen; we assert on how
// sendEmail is invoked (and pull the raw token out of the emailed link) instead.
jest.mock('../utils/email', () => ({ sendEmail: jest.fn().mockResolvedValue(undefined) }))

const request = require('supertest')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const { sendEmail } = require('../utils/email')

const USER = { username: 'verifyuser', email: 'verify@example.com', password: 'password123' }

function sha256 (token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function tokenFor (author) {
  return jwt.sign(
    { id: author._id, username: author.username, picture: author.picture },
    process.env.SECRET,
    { expiresIn: '7d' }
  )
}

// Register a real user through the API, exactly as production would.
async function registerUser (overrides = {}) {
  const body = { ...USER, ...overrides }
  await request(app).post('/api/v1/register').send(body).expect(200)
  return Author.findOne({ email: body.email })
}

// Pull the raw verify token out of the last emailed link sendEmail received.
function tokenFromLastEmail () {
  const call = sendEmail.mock.calls[sendEmail.mock.calls.length - 1][0]
  const body = `${call.text} ${call.html}`
  const match = body.match(/\/verify-email\?token=([a-f0-9]+)/)
  return match ? match[1] : null
}

beforeEach(() => {
  jest.clearAllMocks()
  delete process.env.REQUIRE_EMAIL_VERIFICATION
})

describe('registration issues an email-verification token', () => {
  test('new account is unverified, stores a HASH (not the raw token) with a future expiry, and emails a verify link', async () => {
    const author = await registerUser()

    expect(author.emailVerified).toBe(false)
    expect(author.verifyTokenHash).toBeTruthy()
    expect(author.verifyTokenExpiry.getTime()).toBeGreaterThan(Date.now())

    expect(sendEmail).toHaveBeenCalledTimes(1)
    const arg = sendEmail.mock.calls[0][0]
    expect(arg.to).toBe(USER.email)
    expect(`${arg.text} ${arg.html}`).toContain('/verify-email?token=')

    // The stored value is the sha256 HASH of the emailed token, never the raw one.
    const rawToken = tokenFromLastEmail()
    expect(rawToken).toBeTruthy()
    expect(author.verifyTokenHash).not.toBe(rawToken)
    expect(author.verifyTokenHash).toBe(sha256(rawToken))
  })

  test('registration still succeeds and the profile exposes emailVerified:false', async () => {
    const author = await registerUser()
    const res = await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .expect(200)
    expect(res.body.emailVerified).toBe(false)
  })
})

describe('POST /api/v1/verify/confirm', () => {
  test('valid token → 200, account becomes verified and the token is cleared', async () => {
    await registerUser()
    const token = tokenFromLastEmail()

    const res = await request(app)
      .post('/api/v1/verify/confirm')
      .send({ token })
      .expect(200)
    expect(res.body.message).toBeTruthy()

    const author = await Author.findOne({ email: USER.email })
    expect(author.emailVerified).toBe(true)
    expect(author.verifyTokenHash).toBeFalsy()
    expect(author.verifyTokenExpiry).toBeFalsy()
  })

  test('already-used token → 400 (single-use)', async () => {
    await registerUser()
    const token = tokenFromLastEmail()

    await request(app).post('/api/v1/verify/confirm').send({ token }).expect(200)

    const res = await request(app)
      .post('/api/v1/verify/confirm')
      .send({ token })
      .expect(400)
    expect(res.body.error).toMatch(/invalid or has expired/i)
  })

  test('expired token → 400 and the account stays unverified', async () => {
    await registerUser()
    const token = tokenFromLastEmail()

    await Author.updateOne(
      { email: USER.email },
      { $set: { verifyTokenExpiry: new Date(Date.now() - 1000) } }
    )

    const res = await request(app)
      .post('/api/v1/verify/confirm')
      .send({ token })
      .expect(400)
    expect(res.body.error).toMatch(/invalid or has expired/i)

    const author = await Author.findOne({ email: USER.email })
    expect(author.emailVerified).toBe(false)
  })

  test('garbage / missing token → 400', async () => {
    await registerUser()
    await request(app).post('/api/v1/verify/confirm').send({ token: 'not-a-real-token' }).expect(400)
    await request(app).post('/api/v1/verify/confirm').send({}).expect(400)
  })
})

describe('POST /api/v1/verify/resend', () => {
  test('requires authentication', async () => {
    await request(app).post('/api/v1/verify/resend').expect(401)
  })

  test('unverified authenticated user → 200 and a fresh link is emailed', async () => {
    const author = await registerUser()
    jest.clearAllMocks() // ignore the registration email

    const res = await request(app)
      .post('/api/v1/verify/resend')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .expect(200)
    expect(res.body.message).toBeTruthy()
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(`${sendEmail.mock.calls[0][0].text}`).toContain('/verify-email?token=')
  })

  test('already-verified user → 200 but NO email is sent', async () => {
    const author = await registerUser()
    await Author.updateOne({ _id: author._id }, { $set: { emailVerified: true } })
    jest.clearAllMocks()

    await request(app)
      .post('/api/v1/verify/resend')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .expect(200)
    expect(sendEmail).not.toHaveBeenCalled()
  })
})

describe('requireVerified gate on publishing (flag-controlled)', () => {
  const NEW_POEM = { title: 'Gate Test', poem: 'A poem about gates', genre: 'love' }

  test('flag OFF (default): an unverified user can still publish', async () => {
    const author = await registerUser()
    await request(app)
      .post('/api/v1/poems')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .send(NEW_POEM)
      .expect(201)
  })

  test('flag ON: an unverified user is blocked with 403 EMAIL_UNVERIFIED', async () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
    const author = await registerUser()
    const res = await request(app)
      .post('/api/v1/poems')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .send(NEW_POEM)
      .expect(403)
    expect(res.body.code).toBe('EMAIL_UNVERIFIED')
  })

  test('flag ON: a verified user can publish', async () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
    const author = await registerUser()
    await Author.updateOne({ _id: author._id }, { $set: { emailVerified: true } })
    await request(app)
      .post('/api/v1/poems')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .send(NEW_POEM)
      .expect(201)
  })

  test('flag ON: the admin can publish even while their own account is unverified', async () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
    const admin = await registerUser() // registers unverified by default
    expect(admin.emailVerified).toBe(false)
    process.env.REACT_APP_ADMIN = admin._id.toString()
    try {
      await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${tokenFor(admin)}`)
        .send(NEW_POEM)
        .expect(201)
    } finally {
      delete process.env.REACT_APP_ADMIN
    }
  })
})

describe('POST /api/v1/admin/test-users (admin test-account exemption)', () => {
  // Creates an admin author and points REACT_APP_ADMIN at it (getAdminId reads
  // REACT_APP_ADMIN when NODE_ENV !== 'development', which holds in tests).
  async function createAdmin () {
    const passwordHash = await bcrypt.hash('password123', 10)
    const admin = await Author.create({
      name: 'Admin', slug: 'admin-user', username: 'adminuser', email: 'admin@example.com', passwordHash, type: 'user'
    })
    process.env.REACT_APP_ADMIN = admin._id.toString()
    return admin
  }

  afterEach(() => {
    delete process.env.REACT_APP_ADMIN
  })

  test('non-admin is rejected with 403', async () => {
    const author = await registerUser()
    process.env.REACT_APP_ADMIN = 'some-other-id'
    await request(app)
      .post('/api/v1/admin/test-users')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .send({ username: 'tuser', password: 'password123' })
      .expect(403)
  })

  test('admin creates a pre-verified test account flagged testAccount:true', async () => {
    const admin = await createAdmin()
    const res = await request(app)
      .post('/api/v1/admin/test-users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'tuser1', email: 'shared@example.com', password: 'password123' })
      .expect(201)
    expect(res.body.emailVerified).toBe(true)
    expect(res.body).not.toHaveProperty('passwordHash')
    // testAccount is internal-only and stripped from the JSON payload — assert
    // it on the stored document instead.
    expect(res.body).not.toHaveProperty('testAccount')
    const stored = await Author.findById(res.body.id)
    expect(stored.testAccount).toBe(true)
  })

  test('many test accounts can share ONE email (unique-email index is exempt for test accounts)', async () => {
    const admin = await createAdmin()
    const shared = 'oneinbox@example.com'
    await request(app)
      .post('/api/v1/admin/test-users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'shareA', email: shared, password: 'password123' })
      .expect(201)
    await request(app)
      .post('/api/v1/admin/test-users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'shareB', email: shared, password: 'password123' })
      .expect(201)

    const count = await Author.countDocuments({ email: shared })
    expect(count).toBe(2)
  })

  test('a REAL registration still cannot reuse an email a real account already has', async () => {
    const admin = await createAdmin()
    await registerUser() // real account on USER.email
    // Second real registration on the same email is rejected (index still applies
    // to non-test accounts).
    await request(app)
      .post('/api/v1/register')
      .send({ username: 'someoneelse', email: USER.email, password: 'password123' })
      .expect(409)

    // ...but an admin test account CAN take that same email.
    await request(app)
      .post('/api/v1/admin/test-users')
      .set('Authorization', `Bearer ${tokenFor(admin)}`)
      .send({ username: 'testtwin', email: USER.email, password: 'password123' })
      .expect(201)
  })
})

describe('test accounts are hidden from public views', () => {
  test('excluded from the author listing', async () => {
    const real = await Author.create({ name: 'Real Author', slug: 'real-author', username: 'realone', type: 'user' })
    const test = await Author.create({ name: 'Test Author', slug: 'test-author', username: 'testone', type: 'user', testAccount: true })
    // Both need a poem: the listing now hides authors who have published
    // nothing, so without these the test account would be excluded for the
    // wrong reason and prove nothing. With them, it is hidden despite having
    // published — which is what this test is actually about.
    await Poem.create({ title: 'r1', poem: 'x', genre: 'love', origin: 'user', authorId: real._id, likes: [] })
    await Poem.create({ title: 't1', poem: 'y', genre: 'love', origin: 'user', authorId: test._id, likes: [] })

    const res = await request(app).get('/api/v1/authors').expect(200)
    const names = res.body.map(a => a.name)
    expect(names).toContain('Real Author')
    expect(names).not.toContain('Test Author')
  })

  test('excluded from the ranking', async () => {
    const real = await Author.create({ name: 'Real Ranker', slug: 'real-ranker', username: 'realranker', type: 'user' })
    const test = await Author.create({ name: 'Test Ranker', slug: 'test-ranker', username: 'testranker', type: 'user', testAccount: true })
    await Poem.create({ title: 'r1', poem: 'x', genre: 'love', origin: 'user', authorId: real._id, likes: [] })
    await Poem.create({ title: 't1', poem: 'y', genre: 'love', origin: 'user', authorId: test._id, likes: [] })

    const res = await request(app).get('/api/v1/poems/ranking?origin=user').expect(200)
    const authors = res.body.map(r => r.author)
    expect(authors).toContain('Real Ranker')
    expect(authors).not.toContain('Test Ranker')
  })
})
