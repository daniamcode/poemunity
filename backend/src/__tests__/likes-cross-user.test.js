/**
 * Cross-user like interactions using the Author model (current auth path).
 * The legacy poem.test.js covers like/unlike logic but uses the deprecated
 * User model for test users. These tests use Author, matching real production flow.
 */

const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')

const makeToken = (author) =>
  jwt.sign(
    { id: author._id, username: author.username },
    process.env.SECRET,
    { expiresIn: '1d' }
  )

const makeAuthor = (overrides = {}) =>
  Author.create({
    name: 'Test Author',
    username: `user_${Math.random().toString(36).slice(2)}`,
    email: `test_${Math.random().toString(36).slice(2)}@example.com`,
    type: 'user',
    slug: `slug-${Math.random().toString(36).slice(2)}`,
    ...overrides
  })

const makePoem = (authorId, overrides = {}) =>
  Poem.create({
    title: 'Test Poem',
    author: 'Test Author',
    poem: 'A test poem body.',
    genre: 'love',
    likes: [],
    authorId,
    picture: null,
    date: new Date(),
    ...overrides
  })

describe('Like interactions — cross-user', () => {
  let authorA, tokenA, authorB, tokenB

  beforeEach(async () => {
    authorA = await makeAuthor({ name: 'Alice', username: `alice_${Date.now()}` })
    tokenA = makeToken(authorA)
    authorB = await makeAuthor({ name: 'Bob', username: `bob_${Date.now()}` })
    tokenB = makeToken(authorB)
  })

  test('User B can like User A poem', async () => {
    const poem = await makePoem(authorA._id)

    const res = await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)

    expect(res.body.likes).toHaveLength(1)
    expect(res.body.likes[0].toString()).toBe(String(authorB._id))
  })

  test('User A and User B both like the same poem', async () => {
    const poem = await makePoem(authorA._id)

    await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    const res = await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)

    expect(res.body.likes).toHaveLength(2)
    const likeIds = res.body.likes.map(String)
    expect(likeIds).toContain(String(authorA._id))
    expect(likeIds).toContain(String(authorB._id))
  })

  test('User B liking does not affect User A like status', async () => {
    const poem = await makePoem(authorA._id, { likes: [authorA._id] })

    const res = await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)

    // A still liked, B newly liked
    expect(res.body.likes).toHaveLength(2)
  })

  test('User B unliking removes only their own like', async () => {
    const poem = await makePoem(authorA._id, { likes: [authorA._id, authorB._id] })

    const res = await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)

    // B unliked; A still present
    expect(res.body.likes).toHaveLength(1)
    expect(res.body.likes[0].toString()).toBe(String(authorA._id))
  })

  test('likes from multiple users persist to database', async () => {
    const poem = await makePoem(authorA._id)

    await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(200)

    await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(200)

    const saved = await Poem.findById(poem._id)
    expect(saved.likes).toHaveLength(2)
  })

  test('returns 401 when liking without auth token', async () => {
    const poem = await makePoem(authorA._id)

    await request(app)
      .put(`/api/v1/poem/${poem._id}`)
      .expect(401)
  })

  test('User B cannot edit User A poem', async () => {
    const poem = await makePoem(authorA._id)

    const res = await request(app)
      .patch(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hijacked' })
      .expect(403)

    expect(res.body.error).toBe('Forbidden')
    const unchanged = await Poem.findById(poem._id)
    expect(unchanged.title).toBe('Test Poem')
  })

  test('User B cannot delete User A poem', async () => {
    const poem = await makePoem(authorA._id)

    await request(app)
      .delete(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenB}`)
      .expect(403)

    expect(await Poem.findById(poem._id)).not.toBeNull()
  })

  test('User A can delete their own poem', async () => {
    const poem = await makePoem(authorA._id)

    await request(app)
      .delete(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .expect(204)

    expect(await Poem.findById(poem._id)).toBeNull()
  })

  test('User A can edit their own poem', async () => {
    const poem = await makePoem(authorA._id)

    const res = await request(app)
      .patch(`/api/v1/poem/${poem._id}`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'My Updated Title' })
      .expect(200)

    expect(res.body.title).toBe('My Updated Title')
  })
})
