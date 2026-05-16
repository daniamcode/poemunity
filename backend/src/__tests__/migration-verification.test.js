const request = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')

function makeToken (author) {
  return jwt.sign(
    { id: author._id, username: author.username, picture: author.picture },
    process.env.SECRET,
    { expiresIn: '7d' }
  )
}

describe('Migration verification', () => {
  let author
  let token

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('password123', 10)
    author = await Author.create({
      name: 'Jane Doe',
      slug: 'jane-doe',
      username: 'janedoe',
      email: 'jane@example.com',
      passwordHash,
      picture: 'https://example.com/jane.jpg',
      type: 'user',
      fake: false
    })
    token = makeToken(author)
  })

  describe('POST /api/poems — new poems store authorId, not author string', () => {
    test('saved poem has authorId referencing the Author doc', async () => {
      const res = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Poem', poem: 'some verse', genre: 'love', date: new Date() })
        .expect(201)

      const inDb = await Poem.findById(res.body.id)
      expect(inDb.authorId).toBeDefined()
      expect(String(inDb.authorId)).toBe(String(author._id))
    })

    test('response already has author name and authorSlug flattened from Author doc', async () => {
      const res = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Poem', poem: 'some verse', genre: 'love', date: new Date() })
        .expect(201)

      expect(res.body.author).toBe('janedoe')
      expect(res.body.authorName).toBe('Jane Doe')
      expect(res.body.authorSlug).toBe('jane-doe')
      expect(res.body.picture).toBe('https://example.com/jane.jpg')
      expect(res.body.userId).toBe(String(author._id))
    })

    test('response does not expose a raw authorId object', async () => {
      const res = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'My Poem', poem: 'some verse', genre: 'love', date: new Date() })
        .expect(201)

      expect(res.body.authorId).toBeUndefined()
    })

    test('returns 401 without a token', async () => {
      await request(app)
        .post('/api/poems')
        .send({ title: 'My Poem', poem: 'some verse', genre: 'love', date: new Date() })
        .expect(401)
    })
  })

  describe('POST /api/register — new Author gets a slug', () => {
    test('registered user has a slug derived from username', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'newuser', email: 'new@example.com', password: 'pass123' })
        .expect(200)

      const saved = await Author.findOne({ username: 'newuser' })
      expect(saved.slug).toBe('newuser')
      expect(res.body).not.toHaveProperty('passwordHash')
    })

    test('slug is unique when two usernames produce the same base', async () => {
      await request(app)
        .post('/api/register')
        .send({ username: 'john doe', email: 'john1@example.com', password: 'pass' })
        .expect(200)

      await request(app)
        .post('/api/register')
        .send({ username: 'john.doe', email: 'john2@example.com', password: 'pass' })
        .expect(200)

      const authors = await Author.find({ slug: /^john-doe/ })
      const slugs = authors.map(a => a.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    test('returns 401 when username is already taken', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'janedoe', email: 'other@example.com', password: 'pass' })
        .expect(401)

      expect(res.body.code).toBe('1')
    })

    test('returns 401 when email is already taken', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({ username: 'someoneelse', email: 'jane@example.com', password: 'pass' })
        .expect(401)

      expect(res.body.code).toBe('2')
    })
  })

  describe('POST /api/login — authenticates against Author collection', () => {
    test('returns a JWT token on valid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'janedoe', password: 'password123' })
        .expect(200)

      const parts = res.text.split('.')
      expect(parts).toHaveLength(3)
    })

    test('JWT payload carries the Author _id', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'janedoe', password: 'password123' })
        .expect(200)

      const decoded = jwt.verify(res.text, process.env.SECRET)
      expect(decoded.id).toBe(String(author._id))
      expect(decoded.username).toBe('janedoe')
    })

    test('returns 401 with wrong password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'janedoe', password: 'wrong' })
        .expect(401)

      expect(res.body.error).toBe('invalid user or password')
    })

    test('returns 401 for unknown username', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({ username: 'nobody', password: 'pass' })
        .expect(401)

      expect(res.body.error).toBe('invalid user or password')
    })
  })

  describe('PATCH /api/users/picture — updates Author, no poem sync required', () => {
    test('updates picture on the Author document', async () => {
      const newPic = 'data:image/jpeg;base64,/9j/fakepicture'
      await request(app)
        .patch('/api/users/picture')
        .set('Authorization', `Bearer ${token}`)
        .send({ picture: newPic })
        .expect(200)

      const updated = await Author.findById(author._id)
      expect(updated.picture).toBe(newPic)
    })

    test('returns a new JWT token with updated picture', async () => {
      const newPic = 'data:image/jpeg;base64,/9j/fakepicture'
      const res = await request(app)
        .patch('/api/users/picture')
        .set('Authorization', `Bearer ${token}`)
        .send({ picture: newPic })
        .expect(200)

      expect(res.body.token).toBeDefined()
      expect(res.body.picture).toBe(newPic)

      const decoded = jwt.verify(res.body.token, process.env.SECRET)
      expect(decoded.picture).toBe(newPic)
    })

    test('poems automatically reflect the new picture via populate — no separate sync', async () => {
      const poem = await Poem.create({
        title: 'Test',
        poem: 'verse',
        genre: 'love',
        authorId: author._id,
        origin: 'human',
        date: new Date()
      })

      const newPic = 'data:image/jpeg;base64,/9j/newpic'
      await request(app)
        .patch('/api/users/picture')
        .set('Authorization', `Bearer ${token}`)
        .send({ picture: newPic })
        .expect(200)

      const fetched = await Poem.findById(poem._id).populate('authorId', 'name slug picture')
      expect(fetched.toJSON().picture).toBe(newPic)
    })

    test('rejects invalid picture data', async () => {
      await request(app)
        .patch('/api/users/picture')
        .set('Authorization', `Bearer ${token}`)
        .send({ picture: 'https://not-a-base64-image.com/pic.jpg' })
        .expect(400)
    })

    test('returns 401 without a token', async () => {
      await request(app)
        .patch('/api/users/picture')
        .send({ picture: 'data:image/jpeg;base64,abc' })
        .expect(401)
    })
  })

  describe('GET /api/poems?userId=<id> — filters by authorId (post-migration)', () => {
    let otherAuthor

    beforeEach(async () => {
      otherAuthor = await Author.create({
        name: 'Other Person',
        slug: 'other-person',
        username: 'other',
        email: 'other@example.com',
        type: 'user'
      })

      await Poem.insertMany([
        { title: 'Jane 1', poem: 'v', genre: 'love', authorId: author._id, origin: 'human', date: new Date() },
        { title: 'Jane 2', poem: 'v', genre: 'sad', authorId: author._id, origin: 'human', date: new Date() },
        { title: 'Other 1', poem: 'v', genre: 'love', authorId: otherAuthor._id, origin: 'human', date: new Date() }
      ])
    })

    test('returns only poems belonging to the requested author', async () => {
      const res = await request(app)
        .get('/api/poems')
        .query({ userId: String(author._id), page: 1, limit: 10 })
        .expect(200)

      expect(res.body.total).toBe(2)
      expect(res.body.poems.every(p => p.userId === String(author._id))).toBe(true)
    })

    test('returns 0 poems for an author with no poems', async () => {
      const empty = await Author.create({
        name: 'No Poems',
        slug: 'no-poems',
        username: 'nopoems',
        email: 'nopoems@example.com',
        type: 'user'
      })

      const res = await request(app)
        .get('/api/poems')
        .query({ userId: String(empty._id), page: 1, limit: 10 })
        .expect(200)

      expect(res.body.total).toBe(0)
    })

    test('userId from JWT matches poem.userId in response (ownership check)', async () => {
      await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Mine', poem: 'verse', genre: 'love', date: new Date() })
        .expect(201)

      const res = await request(app)
        .get('/api/poems')
        .query({ userId: String(author._id), page: 1, limit: 10 })
        .expect(200)

      const mine = res.body.poems.find(p => p.title === 'Mine')
      expect(mine.userId).toBe(String(author._id))
    })
  })
})
