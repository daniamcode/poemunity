const request = require('supertest')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')

describe('Author → Poem integration', () => {
  let famousAuthor
  let userAuthor
  let famousPoem
  let userPoem

  beforeEach(async () => {
    famousAuthor = await Author.create({
      name: 'A. F. Moritz',
      slug: 'a-f-moritz',
      picture: 'https://example.com/moritz.jpg',
      type: 'famous'
    })

    userAuthor = await Author.create({
      name: 'Emily Hart',
      slug: 'emily-hart',
      picture: 'https://example.com/emily.jpg',
      type: 'user',
      fake: true
    })

    famousPoem = await Poem.create({
      title: 'The Sad Child',
      poem: 'You always were the sad child',
      genre: 'sad',
      authorId: famousAuthor._id,
      origin: 'famous',
      date: new Date('2020-01-01')
    })

    userPoem = await Poem.create({
      title: 'My Heart',
      poem: 'My heart beats loud',
      genre: 'love',
      authorId: userAuthor._id,
      origin: 'user',
      date: new Date('2021-06-15')
    })
  })

  describe('GET /api/poem/:poemId — author fields are populated and flattened', () => {
    test('returns author name from Author doc, not a raw string', async () => {
      const res = await request(app).get(`/api/poem/${famousPoem._id}`).expect(200)

      expect(res.body.author).toBe('A. F. Moritz')
      expect(res.body.authorSlug).toBe('a-f-moritz')
      expect(res.body.picture).toBe('https://example.com/moritz.jpg')
      expect(res.body.userId).toBe(String(famousAuthor._id))
    })

    test('returns authorSlug for user poems', async () => {
      const res = await request(app).get(`/api/poem/${userPoem._id}`).expect(200)

      expect(res.body.author).toBe('Emily Hart')
      expect(res.body.authorSlug).toBe('emily-hart')
      expect(res.body.userId).toBe(String(userAuthor._id))
    })

    test('does not expose authorId as a raw object in the response', async () => {
      const res = await request(app).get(`/api/poem/${famousPoem._id}`).expect(200)

      expect(res.body.authorId).toBeUndefined()
    })
  })

  describe('GET /api/poems?author=<slug> — slug-based author lookup', () => {
    test('returns poems for a famous author by slug', async () => {
      const res = await request(app)
        .get('/api/poems')
        .query({ author: 'a-f-moritz', page: 1, limit: 10 })
        .expect(200)

      expect(res.body.total).toBe(1)
      expect(res.body.poems[0].author).toBe('A. F. Moritz')
      expect(res.body.poems[0].authorSlug).toBe('a-f-moritz')
    })

    test('returns poems for a user author by slug', async () => {
      const res = await request(app)
        .get('/api/poems')
        .query({ author: 'emily-hart', page: 1, limit: 10 })
        .expect(200)

      expect(res.body.total).toBe(1)
      expect(res.body.poems[0].author).toBe('Emily Hart')
    })

    test('returns empty result for unknown slug', async () => {
      const res = await request(app)
        .get('/api/poems')
        .query({ author: 'no-such-author', page: 1, limit: 10 })
        .expect(200)

      expect(res.body.total).toBe(0)
      expect(res.body.poems).toHaveLength(0)
    })

    test('handles authors with dots in name — slug "a-f-moritz" matches "A. F. Moritz"', async () => {
      // This is the root bug this architecture fixes — no regex reconstruction needed
      const res = await request(app)
        .get('/api/poems')
        .query({ author: 'a-f-moritz', page: 1, limit: 10 })
        .expect(200)

      expect(res.body.poems[0].author).toBe('A. F. Moritz')
      expect(res.body.poems[0].authorSlug).toBe('a-f-moritz')
    })
  })

  describe('GET /api/authors/letters — reads from Author collection', () => {
    test('returns letters for authors that exist', async () => {
      const res = await request(app).get('/api/authors/letters').expect(200)

      expect(res.body).toContain('A')
      expect(res.body).toContain('E')
    })

    test('returns only letters that have at least one author', async () => {
      const res = await request(app).get('/api/authors/letters').expect(200)

      expect(Array.isArray(res.body)).toBe(true)
      res.body.forEach(letter => {
        expect(letter).toMatch(/^[A-Z]$/)
      })
    })

    test('filters letters by type=famous', async () => {
      const res = await request(app)
        .get('/api/authors/letters')
        .query({ type: 'famous' })
        .expect(200)

      expect(res.body).toContain('A')
      expect(res.body).not.toContain('E')
    })

    test('filters letters by type=user', async () => {
      const res = await request(app)
        .get('/api/authors/letters')
        .query({ type: 'user' })
        .expect(200)

      expect(res.body).toContain('E')
      expect(res.body).not.toContain('A')
    })
  })

  describe('GET /api/authors?letter=<L> — returns authors with poem counts', () => {
    test('returns authors starting with the given letter with poem count', async () => {
      const res = await request(app)
        .get('/api/authors')
        .query({ letter: 'A' })
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('A. F. Moritz')
      expect(res.body[0].slug).toBe('a-f-moritz')
      expect(res.body[0].count).toBe(1)
    })

    test('poem count reflects actual poems in the collection', async () => {
      await Poem.create({
        title: 'Second Poem',
        poem: 'Another poem',
        genre: 'love',
        authorId: famousAuthor._id,
        origin: 'famous',
        date: new Date()
      })

      const res = await request(app)
        .get('/api/authors')
        .query({ letter: 'A' })
        .expect(200)

      expect(res.body[0].count).toBe(2)
    })

    test('filters by type=user', async () => {
      const res = await request(app)
        .get('/api/authors')
        .query({ letter: 'E', type: 'user' })
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].name).toBe('Emily Hart')
    })
  })
})
