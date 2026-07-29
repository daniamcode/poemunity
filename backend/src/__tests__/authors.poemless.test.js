const request = require('supertest')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')

// Registering creates an Author immediately, so the public author list filled
// up with accounts that had never published anything — "daniam 0 poems",
// "daniam12 0 poems", "dd 0 poems". An author with nothing to read is not worth
// a row, and the row leaks the existence of every account that ever signed up.
describe('Authors API — authors without poems are hidden', () => {
  let published
  let poemless

  beforeEach(async () => {
    published = await Author.create({ name: 'Dani', slug: 'dani', type: 'user' })
    poemless = await Author.create({ name: 'daniam', slug: 'daniam', type: 'user' })
    await Author.create({ name: 'dd', slug: 'dd', type: 'user' })

    await Poem.create({
      title: 'Only Poem',
      poem: 'content',
      genre: 'love',
      authorId: published._id,
      origin: 'user',
      date: new Date()
    })
  })

  describe('GET /api/v1/authors?letter=', () => {
    test('lists the author who has published', async () => {
      const res = await request(app).get('/api/v1/authors').query({ letter: 'D' }).expect(200)

      expect(res.body.map(a => a.name)).toEqual(['Dani'])
      expect(res.body[0].count).toBe(1)
    })

    test('never returns a zero-count row', async () => {
      const res = await request(app).get('/api/v1/authors').query({ letter: 'D' }).expect(200)

      expect(res.body.every(a => a.count > 0)).toBe(true)
    })

    test('returns an empty list when the letter has only poemless authors', async () => {
      await Author.create({ name: 'Zoe', slug: 'zoe', type: 'user' })

      const res = await request(app).get('/api/v1/authors').query({ letter: 'Z' }).expect(200)

      expect(res.body).toEqual([])
    })

    test('an author reappears once they publish', async () => {
      await Poem.create({
        title: 'First',
        poem: 'content',
        genre: 'love',
        authorId: poemless._id,
        origin: 'user',
        date: new Date()
      })

      const res = await request(app).get('/api/v1/authors').query({ letter: 'D' }).expect(200)

      expect(res.body.map(a => a.name).sort()).toEqual(['Dani', 'daniam'])
    })

    test('an author disappears again when their last poem is deleted', async () => {
      await Poem.deleteMany({ authorId: published._id })

      const res = await request(app).get('/api/v1/authors').query({ letter: 'D' }).expect(200)

      expect(res.body).toEqual([])
    })
  })

  describe('GET /api/v1/authors?limit= (top authors)', () => {
    test('excludes poemless authors from the top list', async () => {
      const res = await request(app).get('/api/v1/authors').query({ limit: 15 }).expect(200)

      expect(res.body.map(a => a.name)).toEqual(['Dani'])
    })

    test('never pads the list out with zero-count authors', async () => {
      const res = await request(app).get('/api/v1/authors').query({ limit: 15 }).expect(200)

      expect(res.body.every(a => a.count > 0)).toBe(true)
    })
  })

  // The letter index and the listing have to agree. Filtering only the listing
  // would leave a letter button enabled that opens onto an empty page — worse
  // than the original bug, because it looks broken rather than merely untidy.
  describe('GET /api/v1/authors/letters', () => {
    test('offers a letter that has a published author', async () => {
      const res = await request(app).get('/api/v1/authors/letters').expect(200)

      expect(res.body).toContain('D')
    })

    test('does not offer a letter whose only authors have no poems', async () => {
      await Author.create({ name: 'Zoe', slug: 'zoe', type: 'user' })

      const res = await request(app).get('/api/v1/authors/letters').expect(200)

      expect(res.body).not.toContain('Z')
    })

    test('every offered letter actually returns authors', async () => {
      await Author.create({ name: 'Zoe', slug: 'zoe', type: 'user' })
      const letters = (await request(app).get('/api/v1/authors/letters').expect(200)).body

      for (const letter of letters) {
        const authors = (await request(app).get('/api/v1/authors').query({ letter }).expect(200)).body
        expect(authors.length).toBeGreaterThan(0)
      }
    })

    test('keeps honouring the type filter alongside the poem check', async () => {
      const famous = await Author.create({ name: 'Byron', slug: 'byron', type: 'famous' })
      await Poem.create({
        title: 'She Walks',
        poem: 'content',
        genre: 'love',
        authorId: famous._id,
        origin: 'famous',
        date: new Date()
      })

      const res = await request(app).get('/api/v1/authors/letters').query({ type: 'famous' }).expect(200)

      expect(res.body).toContain('B')
      expect(res.body).not.toContain('D')
    })
  })
})
