// Mock the email util so no network/real send can ever happen; we assert on how
// sendEmail is invoked instead.
jest.mock('../utils/email', () => ({ sendEmail: jest.fn().mockResolvedValue(undefined) }))

const request = require('supertest')
const crypto = require('crypto')
const { app } = require('../../app')
const Author = require('../models/Author')
const { sendEmail } = require('../utils/email')

const GENERIC = 'If an account exists for that email, a reset link has been sent.'
const USER = { username: 'resetuser', email: 'reset@example.com', password: 'password123' }

function sha256 (token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Register a real user through the API so passwordHash/slug/etc. are set exactly
// as production would create them.
async function createUser (overrides = {}) {
  const body = { ...USER, ...overrides }
  await request(app).post('/api/v1/register').send(body).expect(200)
  // Registration now also sends an email-verification link (PR3). These tests
  // are about the password-reset email, so drop the registration send to isolate
  // the reset flow's sendEmail calls.
  sendEmail.mockClear()
  return Author.findOne({ email: body.email })
}

// Pull the raw reset token out of the emailed link that sendEmail received.
function tokenFromLastEmail () {
  const call = sendEmail.mock.calls[sendEmail.mock.calls.length - 1][0]
  const body = `${call.text} ${call.html}`
  const match = body.match(/\/reset-password\?token=([a-f0-9]+)/)
  return match ? match[1] : null
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/v1/password/forgot', () => {
  test('unknown email → 200 generic message and NO reset token written anywhere', async () => {
    const res = await request(app)
      .post('/api/v1/password/forgot')
      .send({ email: 'nobody@example.com' })
      .expect(200)

    expect(res.body.message).toBe(GENERIC)
    expect(sendEmail).not.toHaveBeenCalled()

    const withToken = await Author.findOne({ resetTokenHash: { $ne: null } })
    expect(withToken).toBeNull()
  })

  test('known user email → 200 generic message, stores a HASH (not the raw token) with a future expiry, and emails a reset link', async () => {
    await createUser()

    const res = await request(app)
      .post('/api/v1/password/forgot')
      .send({ email: USER.email })
      .expect(200)

    expect(res.body.message).toBe(GENERIC)
    expect(sendEmail).toHaveBeenCalledTimes(1)

    const arg = sendEmail.mock.calls[0][0]
    expect(arg.to).toBe(USER.email)
    expect(`${arg.text} ${arg.html}`).toContain('/reset-password?token=')

    const author = await Author.findOne({ email: USER.email })
    expect(author.resetTokenHash).toBeTruthy()
    expect(author.resetTokenExpiry.getTime()).toBeGreaterThan(Date.now())

    // The stored value is the HASH of the emailed token, never the raw token.
    const rawToken = tokenFromLastEmail()
    expect(rawToken).toBeTruthy()
    expect(author.resetTokenHash).not.toBe(rawToken)
    expect(author.resetTokenHash).toBe(sha256(rawToken))
  })

  test('is case-insensitive on email (uppercased input still finds the account)', async () => {
    await createUser()

    const res = await request(app)
      .post('/api/v1/password/forgot')
      .send({ email: USER.email.toUpperCase() })
      .expect(200)

    expect(res.body.message).toBe(GENERIC)
    expect(sendEmail).toHaveBeenCalledTimes(1)

    const author = await Author.findOne({ email: USER.email })
    expect(author.resetTokenHash).toBeTruthy()
  })
})

describe('POST /api/v1/password/reset', () => {
  // Drives the real /forgot flow to obtain a valid token, then returns it.
  async function requestReset (email = USER.email) {
    await request(app).post('/api/v1/password/forgot').send({ email }).expect(200)
    return tokenFromLastEmail()
  }

  test('valid unexpired token → 200; old password then fails login and new password succeeds', async () => {
    await createUser()
    const token = await requestReset()

    const res = await request(app)
      .post('/api/v1/password/reset')
      .send({ token, password: 'newpass456' })
      .expect(200)
    expect(res.body.message).toBeTruthy()

    // Old password no longer works.
    await request(app)
      .post('/api/v1/login')
      .send({ username: USER.username, password: USER.password })
      .expect(401)

    // New password works.
    await request(app)
      .post('/api/v1/login')
      .send({ username: USER.username, password: 'newpass456' })
      .expect(200)
  })

  test('expired token → 400', async () => {
    await createUser()
    const token = await requestReset()

    // Force expiry into the past.
    await Author.updateOne(
      { email: USER.email },
      { $set: { resetTokenExpiry: new Date(Date.now() - 1000) } }
    )

    const res = await request(app)
      .post('/api/v1/password/reset')
      .send({ token, password: 'newpass456' })
      .expect(400)
    expect(res.body.error).toMatch(/invalid or has expired/i)
  })

  test('invalid/garbage token → 400', async () => {
    await createUser()
    await requestReset()

    const res = await request(app)
      .post('/api/v1/password/reset')
      .send({ token: 'not-a-real-token', password: 'newpass456' })
      .expect(400)
    expect(res.body.error).toMatch(/invalid or has expired/i)
  })

  test('already-used token → 400 (single-use)', async () => {
    await createUser()
    const token = await requestReset()

    await request(app)
      .post('/api/v1/password/reset')
      .send({ token, password: 'newpass456' })
      .expect(200)

    // Reusing the same token after a successful reset must fail.
    const res = await request(app)
      .post('/api/v1/password/reset')
      .send({ token, password: 'anotherpass789' })
      .expect(400)
    expect(res.body.error).toMatch(/invalid or has expired/i)
  })

  test('policy-violating (too short) password → 400 and password unchanged', async () => {
    await createUser()
    const token = await requestReset()

    const res = await request(app)
      .post('/api/v1/password/reset')
      .send({ token, password: 'short1' })
      .expect(400)
    expect(res.body.error).toMatch(/at least 8/i)

    // The original password must still work, and the token must still be intact.
    await request(app)
      .post('/api/v1/login')
      .send({ username: USER.username, password: USER.password })
      .expect(200)
  })
})
