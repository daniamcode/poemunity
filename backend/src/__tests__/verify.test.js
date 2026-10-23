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
const Follow = require('../models/Follow')
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

  test('flag OFF (default): an unverified user can still comment', async () => {
    const author = await registerUser()
    const targetId = new (require('mongoose').Types.ObjectId)()
    await request(app)
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .send({ targetType: 'profile', targetId, body: 'Hello' })
      .expect(201)
  })

  test('flag ON: an unverified user is blocked from commenting with 403 EMAIL_UNVERIFIED', async () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
    const author = await registerUser()
    const targetId = new (require('mongoose').Types.ObjectId)()
    const res = await request(app)
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .send({ targetType: 'profile', targetId, body: 'Hello' })
      .expect(403)
    expect(res.body.code).toBe('EMAIL_UNVERIFIED')
    expect(res.body.error).toBe('Please verify your email address before commenting.')
  })

  test('flag ON: a verified user can comment', async () => {
    process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
    const author = await registerUser()
    await Author.updateOne({ _id: author._id }, { $set: { emailVerified: true } })
    const targetId = new (require('mongoose').Types.ObjectId)()
    await request(app)
      .post('/api/v1/comments')
      .set('Authorization', `Bearer ${tokenFor(author)}`)
      .send({ targetType: 'profile', targetId, body: 'Hello' })
      .expect(201)
  })
})

describe('requireVerified gate on likes, follows and publish-via-PATCH (flag-controlled)', () => {
  async function createPoemFor (author, overrides = {}) {
    return Poem.create({
      title: 'Gate Poem',
      poem: 'Some words about a gate',
      genre: 'love',
      authorId: author._id,
      origin: 'user',
      likes: [],
      date: new Date(),
      slug: 'gate-poem',
      ...overrides
    })
  }

  async function createTarget () {
    return Author.create({
      username: 'followtarget',
      name: 'Follow Target',
      slug: 'follow-target',
      type: 'user'
    })
  }

  // A second registered user: `registerUser` posts the same email otherwise,
  // and the uniqueness index answers the second attempt with the neutral
  // conflict, which would leave `Author.findOne` handing back the FIRST user.
  async function registerSecondUser () {
    return registerUser({ username: 'seconduser', email: 'second@example.com' })
  }

  describe('liking', () => {
    test('flag ON: an unverified user is blocked, and the poem is untouched', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const poet = await registerUser()
      const liker = await registerSecondUser()
      const poem = await createPoemFor(poet)

      const res = await request(app)
        .put(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(liker)}`)
        .expect(403)
      expect(res.body.code).toBe('EMAIL_UNVERIFIED')
      expect(res.body.error).toBe('Please verify your email address before liking.')

      // The like route TOGGLES and saves, so a broken gate would leave a like
      // behind even while answering 403 — hence the database, not the status.
      const inDb = await Poem.findById(poem._id)
      expect(inDb.likes).toEqual([])
    })

    test('flag ON: a verified user can like', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const poet = await registerUser()
      const liker = await registerSecondUser()
      await Author.updateOne({ _id: liker._id }, { $set: { emailVerified: true } })
      const poem = await createPoemFor(poet)

      await request(app)
        .put(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(liker)}`)
        .expect(200)

      const inDb = await Poem.findById(poem._id)
      expect(inDb.likes.map(String)).toContain(String(liker._id))
    })

    test('flag OFF (default): an unverified user can still like', async () => {
      const poet = await registerUser()
      const liker = await registerSecondUser()
      const poem = await createPoemFor(poet)

      await request(app)
        .put(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(liker)}`)
        .expect(200)
    })
  })

  describe('following', () => {
    test('flag ON: an unverified user is blocked from following AND unfollowing', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const follower = await registerUser()
      const target = await createTarget()

      const follow = await request(app)
        .post(`/api/v1/authors/${target._id}/follow`)
        .set('Authorization', `Bearer ${tokenFor(follower)}`)
        .expect(403)
      expect(follow.body.code).toBe('EMAIL_UNVERIFIED')
      expect(follow.body.error).toBe('Please verify your email address before following.')
      expect(await Follow.countDocuments({ follower: follower._id })).toBe(0)

      // Unfollow goes through the same gate: the edge never existed, and a
      // 200 here would report success for work nobody did.
      const unfollow = await request(app)
        .delete(`/api/v1/authors/${target._id}/follow`)
        .set('Authorization', `Bearer ${tokenFor(follower)}`)
        .expect(403)
      expect(unfollow.body.code).toBe('EMAIL_UNVERIFIED')
    })

    test('flag ON: a verified user can follow', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const follower = await registerUser()
      await Author.updateOne({ _id: follower._id }, { $set: { emailVerified: true } })
      const target = await createTarget()

      const res = await request(app)
        .post(`/api/v1/authors/${target._id}/follow`)
        .set('Authorization', `Bearer ${tokenFor(follower)}`)
        .expect(200)
      expect(res.body.following).toBe(true)

      expect(await Follow.countDocuments({
        follower: follower._id,
        following: target._id
      })).toBe(1)
    })

    test('flag OFF (default): an unverified user can still follow', async () => {
      const follower = await registerUser()
      const target = await createTarget()

      await request(app)
        .post(`/api/v1/authors/${target._id}/follow`)
        .set('Authorization', `Bearer ${tokenFor(follower)}`)
        .expect(200)
    })
  })

  describe('publish-via-PATCH', () => {
    test('flag ON: an unverified author can still EDIT and WITHDRAW', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const author = await registerUser()
      const poem = await createPoemFor(author) // published by default

      // The distractor for a blanket PATCH gate: requiring verification to take
      // something down or fix its text would make the gate a trap rather than a
      // standard, so both must pass for an unverified owner.
      await request(app)
        .patch(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(author)}`)
        .send({ poem: 'Edited words, still unverified' })
        .expect(200)

      await request(app)
        .patch(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(author)}`)
        .send({ status: 'draft' })
        .expect(200)

      const inDb = await Poem.findById(poem._id)
      expect(inDb.poem).toBe('Edited words, still unverified')
      expect(inDb.status).toBe('draft')
    })

    test('flag ON: an unverified author cannot publish a draft this way', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const author = await registerUser()
      const poem = await createPoemFor(author, { status: 'draft' })

      const res = await request(app)
        .patch(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(author)}`)
        .send({ status: 'published' })
        .expect(403)
      expect(res.body.error).toBe('Please verify your email address before publishing.')

      const inDb = await Poem.findById(poem._id)
      expect(inDb.status).toBe('draft')
    })

    test('flag ON: a capitalised "Published" is still a publish, and still gated', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const author = await registerUser()
      const poem = await createPoemFor(author, { status: 'draft' })

      // The gate decides through `normalizeStatus`, the same reading the
      // handler does — raw string equality would let this one through and
      // publish the poem.
      await request(app)
        .patch(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(author)}`)
        .send({ status: 'Published' })
        .expect(403)

      const inDb = await Poem.findById(poem._id)
      expect(inDb.status).toBe('draft')
    })

    test('flag ON: a verified author can publish a draft this way', async () => {
      process.env.REQUIRE_EMAIL_VERIFICATION = 'true'
      const author = await registerUser()
      await Author.updateOne({ _id: author._id }, { $set: { emailVerified: true } })
      const poem = await createPoemFor(author, { status: 'draft' })

      await request(app)
        .patch(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(author)}`)
        .send({ status: 'published' })
        .expect(200)

      const inDb = await Poem.findById(poem._id)
      expect(inDb.status).toBe('published')
    })

    test('flag OFF (default): an unverified author can still publish', async () => {
      const author = await registerUser()
      const poem = await createPoemFor(author, { status: 'draft' })

      await request(app)
        .patch(`/api/v1/poem/${poem._id}`)
        .set('Authorization', `Bearer ${tokenFor(author)}`)
        .send({ status: 'published' })
        .expect(200)
    })
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
