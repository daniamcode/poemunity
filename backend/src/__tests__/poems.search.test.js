const request = require('supertest')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')

// Server-backed search on GET /api/v1/poems?q=. Before this existed, the
// frontend filtered only the poems already on screen and only by author name,
// so anything past the first page was unreachable. These tests pin the two
// properties that made it worth moving to the server: matches are found across
// the WHOLE collection (not just the first page), and search composes with the
// existing filters instead of replacing them.

const makePoem = (overrides) => ({
  poem: 'content',
  title: 'Untitled',
  genre: 'Test',
  date: new Date(),
  origin: 'test',
  ...overrides
})

describe('Poems API - search (?q=)', () => {
  let shelley
  let byron

  beforeEach(async () => {
    shelley = await Author.create({ name: 'Percy Shelley', slug: 'percy-shelley', type: 'famous' })
    byron = await Author.create({ name: 'Lord Byron', slug: 'lord-byron', type: 'famous' })

    await Poem.insertMany([
      makePoem({ title: 'Ozymandias', authorId: shelley._id }),
      makePoem({ title: 'A Song of Love', authorId: shelley._id }),
      makePoem({ title: 'She Walks in Beauty', authorId: byron._id, genre: 'Beauty' })
    ])
  })

  test('matches poem titles case-insensitively', async () => {
    const response = await request(app)
      .get('/api/v1/poems')
      .query({ q: 'ozymandias' })
      .expect(200)

    expect(response.body.map((p) => p.title)).toEqual(['Ozymandias'])
  })

  // The old client-side filter anchored nothing but only looked at author
  // names; a substring in the MIDDLE of a title was unreachable. This is the
  // reason the backend query is an unanchored regex rather than an indexable
  // ^prefix one.
  test('matches a substring in the middle of a title, not just a prefix', async () => {
    const response = await request(app)
      .get('/api/v1/poems')
      .query({ q: 'Love' })
      .expect(200)

    expect(response.body.map((p) => p.title)).toEqual(['A Song of Love'])
  })

  test('matches author names as well as titles', async () => {
    const response = await request(app)
      .get('/api/v1/poems')
      .query({ q: 'byron' })
      .expect(200)

    expect(response.body.map((p) => p.title)).toEqual(['She Walks in Beauty'])
  })

  test('returns titles and author matches together for one query', async () => {
    // 'She Walks in Beauty' matches on title; Shelley's two poems match on
    // author name. Both halves of the $or must contribute.
    const response = await request(app)
      .get('/api/v1/poems')
      .query({ q: 'she' })
      .expect(200)

    expect(response.body.map((p) => p.title).sort()).toEqual([
      'A Song of Love',
      'Ozymandias',
      'She Walks in Beauty'
    ])
  })

  test('returns an empty list when nothing matches', async () => {
    const response = await request(app)
      .get('/api/v1/poems')
      .query({ q: 'keats' })
      .expect(200)

    expect(response.body).toEqual([])
  })

  test('ignores a blank or whitespace-only q', async () => {
    const response = await request(app)
      .get('/api/v1/poems')
      .query({ q: '   ' })
      .expect(200)

    expect(response.body).toHaveLength(3)
  })

  // User input is interpolated into a regex. Unescaped, '(' is an invalid
  // pattern (500) and '.*' is a user-supplied match-everything.
  describe('treats the query as literal text, not a pattern', () => {
    test('does not 500 on an unbalanced regex metacharacter', async () => {
      const response = await request(app)
        .get('/api/v1/poems')
        .query({ q: 'a(' })
        .expect(200)

      expect(response.body).toEqual([])
    })

    test('does not let .* match everything', async () => {
      const response = await request(app)
        .get('/api/v1/poems')
        .query({ q: '.*' })
        .expect(200)

      expect(response.body).toEqual([])
    })
  })

  describe('composition with existing filters', () => {
    test('search narrows a genre filter instead of replacing it', async () => {
      const response = await request(app)
        .get('/api/v1/poems')
        .query({ genre: 'Beauty', q: 'she' })
        .expect(200)

      // 'she' alone matches all three poems; the genre filter must still apply.
      expect(response.body.map((p) => p.title)).toEqual(['She Walks in Beauty'])
    })

    // The userId filter owns the top-level $or, which is why search is added
    // under $and. If they collided, one of the two would be silently dropped.
    test('search composes with the userId filter without clobbering it', async () => {
      const response = await request(app)
        .get('/api/v1/poems')
        .query({ userId: String(shelley._id), q: 'she' })
        .expect(200)

      expect(response.body.map((p) => p.title).sort()).toEqual(['A Song of Love', 'Ozymandias'])
    })

    test('search applies before pagination, so totals reflect the query', async () => {
      const response = await request(app)
        .get('/api/v1/poems')
        .query({ q: 'shelley', page: 1, limit: 1 })
        .expect(200)

      expect(response.body.total).toBe(2)
      expect(response.body.totalPages).toBe(2)
      expect(response.body.hasMore).toBe(true)
      expect(response.body.poems).toHaveLength(1)
    })
  })

  // The whole point of moving search to the server: a match that lives beyond
  // the first page of results is now reachable.
  test('finds a match that is not on the first page of unfiltered results', async () => {
    const filler = Array.from({ length: 30 }, (_, i) =>
      makePoem({ title: `Filler ${i}`, authorId: byron._id, date: new Date(Date.now() + i * 1000) })
    )
    await Poem.insertMany(filler)

    const unfiltered = await request(app)
      .get('/api/v1/poems')
      .query({ page: 1, limit: 10 })
      .expect(200)
    expect(unfiltered.body.poems.map((p) => p.title)).not.toContain('Ozymandias')

    const searched = await request(app)
      .get('/api/v1/poems')
      .query({ q: 'ozymandias', page: 1, limit: 10 })
      .expect(200)
    expect(searched.body.poems.map((p) => p.title)).toEqual(['Ozymandias'])
  })
})
