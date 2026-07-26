const request = require('supertest')
const { app } = require('../../app')
const Author = require('../models/Author')

const VALID = { username: 'testuser', email: 'test@example.com', password: 'password123' }

// Ensure the collation unique indexes are built before any test relies on the
// DB rejecting duplicates (item 1 & 2). afterEach only clears documents, so the
// indexes persist for the whole suite once created here.
beforeAll(async () => {
  await Author.init()
})

describe('Registration/login integrity', () => {
  // ── 1. Case-insensitive username uniqueness ──────────────────────────────
  describe('case-insensitive username uniqueness', () => {
    test('rejects a username that differs only in case', async () => {
      await request(app).post('/api/v1/register').send({ ...VALID, username: 'Test1a' }).expect(200)
      const res = await request(app)
        .post('/api/v1/register')
        .send({ username: 'test1a', email: 'other@example.com', password: 'password123' })
        .expect(409)
      expect(res.body.code).toBe('1')
      expect(res.body.error).toMatch(/username already exists/i)
    })

    test('the DB unique index rejects a case-variant username at the model layer', async () => {
      await Author.create({ username: 'CaseKing', email: 'ck@example.com', passwordHash: 'x', slug: 'caseking-1', type: 'user' })
      await expect(
        Author.create({ username: 'caseking', email: 'ck2@example.com', passwordHash: 'x', slug: 'caseking-2', type: 'user' })
      ).rejects.toThrow()
    })
  })

  // ── 2. Email uniqueness + race + E11000 ──────────────────────────────────
  describe('email uniqueness and E11000 handling', () => {
    test('rejects a case-variant duplicate email at the DB layer', async () => {
      await Author.create({ username: 'ea', email: 'dup@example.com', passwordHash: 'x', slug: 'ea', type: 'user' })
      await expect(
        Author.create({ username: 'eb', email: 'DUP@example.com', passwordHash: 'x', slug: 'eb', type: 'user' })
      ).rejects.toThrow()
    })

    test('maps a race E11000 on email to a 409 (never a generic 500)', async () => {
      await request(app).post('/api/v1/register').send(VALID).expect(200)

      // Simulate the read-then-write race: force the pre-check to see nothing so
      // the save collides with the unique index and throws E11000.
      // Only neuter the controller's `$or` pre-check so the save collides with
      // the index; let every other findOne (e.g. validators) work normally.
      const original = Author.findOne.bind(Author)
      const spy = jest.spyOn(Author, 'findOne').mockImplementation((filter, ...rest) => {
        if (filter && filter.$or) return { collation: () => Promise.resolve(null) }
        return original(filter, ...rest)
      })
      try {
        const res = await request(app)
          .post('/api/v1/register')
          .send({ username: 'raceuser', email: VALID.email, password: 'password123' })
        expect(res.status).toBe(409)
        expect(res.status).not.toBe(500)
        expect(res.body.code).toBe('2')
      } finally {
        spy.mockRestore()
      }
    })

    test('maps a race E11000 on username to a 409 with code 1', async () => {
      await request(app).post('/api/v1/register').send(VALID).expect(200)
      // Only neuter the controller's `$or` pre-check so the save collides with
      // the index; let every other findOne (e.g. validators) work normally.
      const original = Author.findOne.bind(Author)
      const spy = jest.spyOn(Author, 'findOne').mockImplementation((filter, ...rest) => {
        if (filter && filter.$or) return { collation: () => Promise.resolve(null) }
        return original(filter, ...rest)
      })
      try {
        const res = await request(app)
          .post('/api/v1/register')
          .send({ username: VALID.username, email: 'brandnew@example.com', password: 'password123' })
        expect(res.status).toBe(409)
        expect(res.body.code).toBe('1')
      } finally {
        spy.mockRestore()
      }
    })
  })

  // ── 3. Trim/lowercase + availability + login by email-or-username ─────────
  describe('input normalization', () => {
    test('trims username/name and trims+lowercases email before saving', async () => {
      await request(app)
        .post('/api/v1/register')
        .send({ username: '  Spacey  ', name: '  Spacey Name  ', email: '  MiXeD@Example.COM  ', password: 'password123' })
        .expect(200)
      const author = await Author.findOne({ username: 'Spacey' })
      expect(author).not.toBeNull()
      expect(author.username).toBe('Spacey')
      expect(author.name).toBe('Spacey Name')
      expect(author.email).toBe('mixed@example.com')
    })
  })

  describe('availability endpoint', () => {
    test('reports a free username/email as available (truthy)', async () => {
      const res = await request(app)
        .get('/api/v1/register/availability')
        .query({ username: 'nobody', email: 'nobody@example.com' })
        .expect(200)
      expect(res.body.usernameAvailable).toBe(true)
      expect(res.body.emailAvailable).toBe(true)
    })

    test('reports a taken username/email as unavailable (falsy), case-insensitively', async () => {
      await request(app).post('/api/v1/register').send(VALID).expect(200)
      const res = await request(app)
        .get('/api/v1/register/availability')
        .query({ username: 'TESTUSER', email: 'TEST@EXAMPLE.COM' })
        .expect(200)
      expect(res.body.usernameAvailable).toBe(false)
      expect(res.body.emailAvailable).toBe(false)
    })
  })

  describe('login by username or email', () => {
    beforeEach(async () => {
      await request(app).post('/api/v1/register').send(VALID).expect(200)
    })

    test('logs in by username (any case)', async () => {
      const res = await request(app)
        .post('/api/v1/login')
        .send({ username: 'TestUser', password: VALID.password })
        .expect(200)
      expect(typeof res.text).toBe('string')
      expect(res.text.length).toBeGreaterThan(0)
    })

    test('logs in by email (any case)', async () => {
      const res = await request(app)
        .post('/api/v1/login')
        .send({ username: 'TEST@example.com', password: VALID.password })
        .expect(200)
      expect(res.text.length).toBeGreaterThan(0)
    })
  })

  // ── 4. Non-enumerating login + password policy ───────────────────────────
  describe('non-enumerating login', () => {
    test('returns the identical generic error for unknown user and wrong password', async () => {
      await request(app).post('/api/v1/register').send(VALID).expect(200)

      const unknown = await request(app)
        .post('/api/v1/login')
        .send({ username: 'ghost', password: 'whatever123' })
      const wrongPassword = await request(app)
        .post('/api/v1/login')
        .send({ username: VALID.username, password: 'wrongpassword1' })

      expect(unknown.status).toBe(401)
      expect(wrongPassword.status).toBe(401)
      expect(unknown.status).toBe(wrongPassword.status)
      expect(unknown.body).toEqual(wrongPassword.body)
    })
  })

  describe('password policy', () => {
    const cases = [
      ['too short', 'pass1'],
      ['no number', 'passwordonly'],
      ['no letter', '12345678'],
      ['all whitespace', '            '],
      ['too long', 'a1' + 'x'.repeat(200)]
    ]
    test.each(cases)('rejects a password that is %s', async (_label, password) => {
      const res = await request(app)
        .post('/api/v1/register')
        .send({ username: 'pwuser', email: 'pw@example.com', password })
        .expect(400)
      expect(res.body.code).toBe('0')
    })

    test('accepts a compliant password', async () => {
      await request(app)
        .post('/api/v1/register')
        .send({ username: 'goodpw', email: 'goodpw@example.com', password: 'abcd1234' })
        .expect(200)
    })
  })
})
