const request = require('supertest')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')

// GET /api/v1/authors/:slug — the public author profile.
//
// This route had no test of its own, and it was the one place an admin-created
// test account still resolved: `buildFilter` keeps `testAccount: true` out of
// every LISTING, so a page that appears nowhere yet answers on its own URL is
// still reachable — by anyone who guesses the slug, and by anything that learns
// the address from a poem page. Hidden has to mean hidden in both places.
//
// The fixture gives BOTH authors a published poem on purpose. A 404 that could
// equally be explained by "this author has nothing to show" would pass for the
// wrong reason, and the control — an ordinary author answering 200 in full — is
// what proves the route is otherwise alive.
describe('GET /api/v1/authors/:slug', () => {
  let visible, hidden

  beforeEach(async () => {
    visible = await Author.create({
      username: 'realpoet',
      name: 'Real Poet',
      slug: 'real-poet',
      type: 'user'
    })
    hidden = await Author.create({
      username: 'fixture',
      name: 'Fixture Account',
      slug: 'fixture-account',
      type: 'user',
      testAccount: true
    })

    const poemFor = (author, title) => Poem.create({
      title,
      poem: 'Some words',
      genre: 'love',
      authorId: author._id,
      origin: 'user',
      likes: [],
      date: new Date(),
      slug: title.toLowerCase().replace(/\s+/g, '-')
    })

    await poemFor(visible, 'Visible Poem')
    await poemFor(hidden, 'Hidden Poem')
  })

  test('resolves an ordinary author, follow fields and all', async () => {
    const res = await request(app).get('/api/v1/authors/real-poet').expect(200)

    expect(res.body.slug).toBe('real-poet')
    expect(res.body.name).toBe('Real Poet')
    // The three follow fields ride on THIS response rather than on an endpoint
    // of their own, so the control asserts they arrive — a route that answered
    // 200 while dropping them would still be broken.
    expect(res.body.isFollowing).toBe(false)
    expect(res.body.followerCount).toBe(0)
    expect(res.body.followingCount).toBe(0)
  })

  test('404s for a test account, poems and all', async () => {
    const res = await request(app).get('/api/v1/authors/fixture-account')

    // The SAME answer as a slug nobody has — a 403 would confirm that the
    // address resolves to somebody.
    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: 'Author not found' })

    // Not dropped from the response by accident of a projection: the author
    // exists, it is simply not published.
    expect(await Author.exists({ slug: 'fixture-account' })).not.toBeNull()
  })

  test('404s for a slug nobody has', async () => {
    await request(app).get('/api/v1/authors/no-such-poet').expect(404)
  })
})
