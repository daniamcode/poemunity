const request = require('supertest')
const { app } = require('../../app')
const Author = require('../models/Author')

const VALID = { username: 'testuser', email: 'test@example.com', password: 'password123' }

describe('POST /api/v1/register', () => {
  // ─── Happy path ──────────────────────────────────────────────────────────

  test('creates a user and returns the saved author', async () => {
    const res = await request(app).post('/api/v1/register').send(VALID).expect(200)
    expect(res.body.username).toBe('testuser')
    expect(res.body.email).toBe('test@example.com')
    expect(res.body).not.toHaveProperty('passwordHash')
  })

  test('persists the new user in the database', async () => {
    await request(app).post('/api/v1/register').send(VALID).expect(200)
    const author = await Author.findOne({ username: 'testuser' })
    expect(author).not.toBeNull()
    expect(author.email).toBe('test@example.com')
  })

  // ─── Missing fields ───────────────────────────────────────────────────────

  test('rejects when username is missing', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(400)
    expect(res.body.error).toMatch(/required/i)
  })

  test('rejects when email is missing', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({ username: 'testuser', password: 'password123' })
      .expect(400)
    expect(res.body.error).toMatch(/required/i)
  })

  test('rejects when password is missing', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({ username: 'testuser', email: 'test@example.com' })
      .expect(400)
    expect(res.body.error).toMatch(/required/i)
  })

  test('rejects when email is an empty string', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({ username: 'testuser', email: '', password: 'password123' })
      .expect(400)
    expect(res.body.error).toMatch(/required/i)
  })

  // ─── Email format ─────────────────────────────────────────────────────────

  test('rejects an email without @', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({ ...VALID, email: 'notanemail' })
      .expect(400)
    expect(res.body.error).toMatch(/invalid email/i)
  })

  test('rejects an email without domain extension', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({ ...VALID, email: 'user@nodomain' })
      .expect(400)
    expect(res.body.error).toMatch(/invalid email/i)
  })

  test('accepts a valid email with subdomains', async () => {
    const res = await request(app)
      .post('/api/v1/register')
      .send({ ...VALID, email: 'user@mail.example.co.uk' })
      .expect(200)
    expect(res.body.email).toBe('user@mail.example.co.uk')
  })

  // ─── Duplicate detection ──────────────────────────────────────────────────

  test('rejects a duplicate username with code 1', async () => {
    await request(app).post('/api/v1/register').send(VALID).expect(200)
    const res = await request(app)
      .post('/api/v1/register')
      .send({ ...VALID, email: 'other@example.com' })
      .expect(401)
    expect(res.body.code).toBe('1')
    expect(res.body.error).toMatch(/username already exists/i)
  })

  test('rejects a duplicate email with code 2', async () => {
    await request(app).post('/api/v1/register').send(VALID).expect(200)
    const res = await request(app)
      .post('/api/v1/register')
      .send({ ...VALID, username: 'otheruser' })
      .expect(401)
    expect(res.body.code).toBe('2')
    expect(res.body.error).toMatch(/email already exists/i)
  })
})
