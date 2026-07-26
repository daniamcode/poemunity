const request = require('supertest')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')

// Ranking is computed server-side by aggregation:
//   points(author) = poemsCount * poemPoints + totalLikes * likePoints
// Default weights are 3 (poem) and 1 (like), overridable via query params.
describe('Poems API - Ranking (GET /api/v1/poems/ranking)', () => {
  async function seed () {
    const ada = await Author.create({ username: 'ada', name: 'Ada', slug: 'ada', picture: 'ada.jpg', type: 'user' })
    const grace = await Author.create({ username: 'grace', name: 'Grace', slug: 'grace', picture: 'g.jpg', type: 'user' })

    // Ada: 2 poems, 3 likes total -> default points = 2*3 + 3*1 = 9
    await Poem.insertMany([
      { title: 'a1', poem: 'x', author: 'Ada', genre: 'g', date: new Date(), authorId: ada._id, origin: 'user', likes: ['u1', 'u2'] },
      { title: 'a2', poem: 'x', author: 'Ada', genre: 'g', date: new Date(), authorId: ada._id, origin: 'user', likes: ['u3'] }
    ])
    // Grace: 1 poem, 5 likes -> default points = 1*3 + 5*1 = 8
    await Poem.insertMany([
      { title: 'g1', poem: 'x', author: 'Grace', genre: 'g', date: new Date(), authorId: grace._id, origin: 'user', likes: ['u1', 'u2', 'u3', 'u4', 'u5'] }
    ])

    return { ada, grace }
  }

  test('ranks authors by points, descending, with resolved author fields', async () => {
    const { ada, grace } = await seed()

    const res = await request(app)
      .get('/api/v1/poems/ranking')
      .query({ origin: 'user', poemPoints: 3, likePoints: 1 })
      .expect(200)

    expect(res.body).toHaveLength(2)
    expect(res.body[0]).toMatchObject({
      author: 'Ada',
      points: 9,
      userId: String(ada._id),
      authorSlug: 'ada',
      picture: 'ada.jpg'
    })
    expect(res.body[1]).toMatchObject({ author: 'Grace', points: 8, userId: String(grace._id) })
  })

  test('honours custom weights (a like-heavy weighting flips the order)', async () => {
    await seed()

    // likePoints=10 -> Ada = 2*3 + 3*10 = 36; Grace = 1*3 + 5*10 = 53
    const res = await request(app)
      .get('/api/v1/poems/ranking')
      .query({ poemPoints: 3, likePoints: 10 })
      .expect(200)

    expect(res.body[0]).toMatchObject({ author: 'Grace', points: 53 })
    expect(res.body[1]).toMatchObject({ author: 'Ada', points: 36 })
  })

  test('limits the number of returned authors', async () => {
    await seed()

    const res = await request(app)
      .get('/api/v1/poems/ranking')
      .query({ limit: 1 })
      .expect(200)

    expect(res.body).toHaveLength(1)
    expect(res.body[0].author).toBe('Ada')
  })

  test('filters by origin so other categories are excluded', async () => {
    const shakespeare = await Author.create({ username: 'wsx', name: 'Shakespeare', slug: 'shakespeare', type: 'famous' })
    await Poem.create({ title: 'sonnet', poem: 'x', author: 'Shakespeare', genre: 'g', date: new Date(), authorId: shakespeare._id, origin: 'famous', likes: ['a', 'b', 'c'] })
    await seed()

    const res = await request(app)
      .get('/api/v1/poems/ranking')
      .query({ origin: 'user' })
      .expect(200)

    expect(res.body.map(r => r.author)).not.toContain('Shakespeare')
  })

  test('rejects invalid parameters with 400', async () => {
    await request(app).get('/api/v1/poems/ranking').query({ limit: 0 }).expect(400)
    await request(app).get('/api/v1/poems/ranking').query({ poemPoints: 'abc' }).expect(400)
  })

  test('returns an empty array when there are no poems', async () => {
    const res = await request(app).get('/api/v1/poems/ranking').expect(200)
    expect(res.body).toEqual([])
  })
})
