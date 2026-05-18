const request = require('supertest')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const Author = require('../models/Author')
const Comment = require('../models/Comment')

const makeToken = (authorId) =>
  jwt.sign({ id: authorId, username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

const makeAuthor = (overrides = {}) =>
  Author.create({
    name: 'Test User',
    username: `user_${Math.random().toString(36).slice(2)}`,
    email: `test_${Math.random().toString(36).slice(2)}@example.com`,
    type: 'user',
    slug: `test-slug-${Math.random().toString(36).slice(2)}`,
    picture: 'https://example.com/pic.jpg',
    ...overrides
  })

describe('Comments API', () => {
  let author
  let token
  let poemTargetId

  beforeEach(async () => {
    author = await makeAuthor()
    token = makeToken(author._id)
    poemTargetId = new (require('mongoose').Types.ObjectId)()
  })

  // ─── GET ──────────────────────────────────────────────────────────────

  describe('GET /api/v1/comments', () => {
    test('returns 400 with no params', async () => {
      const res = await request(app).get('/api/v1/comments').expect(400)
      expect(res.body.error).toBeDefined()
    })

    test('returns empty array when no comments exist for target', async () => {
      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemTargetId}`)
        .expect(200)
      expect(res.body).toEqual([])
    })

    test('returns comments for a given poem with populated author fields', async () => {
      await Comment.create({
        targetType: 'poem',
        targetId: poemTargetId,
        authorId: author._id,
        body: 'Beautiful verse'
      })

      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemTargetId}`)
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].body).toBe('Beautiful verse')
      expect(res.body[0].authorId).toBe(String(author._id))
      expect(res.body[0].authorName).toBe('Test User')
      expect(res.body[0].authorSlug).toBe(author.slug)
    })

    test('returns comments sorted oldest-first', async () => {
      const old = new Date('2024-01-01')
      const recent = new Date('2024-06-01')

      await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'First', createdAt: old })
      await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Second', createdAt: recent })

      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemTargetId}`)
        .expect(200)

      expect(res.body[0].body).toBe('First')
      expect(res.body[1].body).toBe('Second')
    })

    test('returns only comments for the requested target', async () => {
      const otherId = new (require('mongoose').Types.ObjectId)()
      await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Mine' })
      await Comment.create({ targetType: 'poem', targetId: otherId, authorId: author._id, body: 'Other' })

      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemTargetId}`)
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].body).toBe('Mine')
    })

    test('supports since param to return only recent comments', async () => {
      const cutoff = new Date('2024-03-01')
      await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Old', createdAt: new Date('2024-01-01') })
      await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'New', createdAt: new Date('2024-06-01') })

      const res = await request(app)
        .get(`/api/v1/comments?since=${cutoff.toISOString()}`)
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].body).toBe('New')
    })

    test('response includes id, targetType, targetId, body, parentId, createdAt', async () => {
      await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Check fields' })

      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemTargetId}`)
        .expect(200)

      const c = res.body[0]
      expect(c).toHaveProperty('id')
      expect(c).toHaveProperty('targetType', 'poem')
      expect(c).toHaveProperty('body', 'Check fields')
      expect(c).toHaveProperty('parentId', null)
      expect(c).toHaveProperty('createdAt')
      expect(c).not.toHaveProperty('_id')
      expect(c).not.toHaveProperty('__v')
    })
  })

  // ─── POST ─────────────────────────────────────────────────────────────

  describe('POST /api/v1/comments', () => {
    test('creates a comment and returns 201', async () => {
      const res = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetType: 'poem', targetId: poemTargetId, body: 'Great poem!' })
        .expect(201)

      expect(res.body.body).toBe('Great poem!')
      expect(res.body.targetType).toBe('poem')
      expect(res.body.authorId).toBe(String(author._id))
      expect(res.body.authorName).toBe('Test User')
    })

    test('creates a reply when parentId is provided', async () => {
      const parent = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Parent'
      })

      const res = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetType: 'poem', targetId: poemTargetId, body: 'Reply', parentId: parent._id })
        .expect(201)

      expect(String(res.body.parentId)).toBe(String(parent._id))
    })

    test('persists the comment to the database', async () => {
      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetType: 'poem', targetId: poemTargetId, body: 'Persisted' })
        .expect(201)

      const count = await Comment.countDocuments({ targetId: poemTargetId })
      expect(count).toBe(1)
    })

    test('trims whitespace from body', async () => {
      const res = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetType: 'poem', targetId: poemTargetId, body: '   trimmed   ' })
        .expect(201)

      expect(res.body.body).toBe('trimmed')
    })

    test('returns 401 without authentication token', async () => {
      const res = await request(app)
        .post('/api/v1/comments')
        .send({ targetType: 'poem', targetId: poemTargetId, body: 'No auth' })
        .expect(401)

      expect(res.body.error).toBe('token missing or invalid')
    })

    test('returns 401 with invalid token', async () => {
      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', 'Bearer bad-token')
        .send({ targetType: 'poem', targetId: poemTargetId, body: 'Bad token' })
        .expect(401)
    })

    test('returns 400 when body is missing', async () => {
      const res = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetType: 'poem', targetId: poemTargetId })
        .expect(400)

      expect(res.body.error).toBeDefined()
    })

    test('returns 400 when body is only whitespace', async () => {
      const res = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetType: 'poem', targetId: poemTargetId, body: '   ' })
        .expect(400)

      expect(res.body.error).toBeDefined()
    })

    test('returns 400 when targetType is missing', async () => {
      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetId: poemTargetId, body: 'No type' })
        .expect(400)
    })

    test('returns 400 when targetId is missing', async () => {
      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${token}`)
        .send({ targetType: 'poem', body: 'No target' })
        .expect(400)
    })
  })

  // ─── PATCH ────────────────────────────────────────────────────────────

  describe('PATCH /api/v1/comments/:commentId', () => {
    test('owner can edit body', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Original'
      })

      const res = await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Edited' })
        .expect(200)

      expect(res.body.body).toBe('Edited')
    })

    test('persists the edit to the database', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Before'
      })

      await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'After' })
        .expect(200)

      const updated = await Comment.findById(comment._id)
      expect(updated.body).toBe('After')
    })

    test('returns 403 when non-owner tries to edit', async () => {
      const otherAuthor = await makeAuthor()
      const otherToken = makeToken(otherAuthor._id)

      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Mine'
      })

      const res = await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ body: 'Hijacked' })
        .expect(403)

      expect(res.body.error).toBe('Forbidden')
      const unchanged = await Comment.findById(comment._id)
      expect(unchanged.body).toBe('Mine')
    })

    test('returns 401 without token', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Test'
      })

      const res = await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .send({ body: 'Updated' })
        .expect(401)

      expect(res.body.error).toBe('token missing or invalid')
    })

    test('returns 400 when body is empty', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Test'
      })

      await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: '' })
        .expect(400)
    })

    test('returns 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const res = await request(app)
        .patch(`/api/v1/comments/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ body: 'Updated' })
        .expect(404)

      expect(res.body.error).toBe('Comment not found')
    })
  })

  // ─── DELETE ───────────────────────────────────────────────────────────

  describe('DELETE /api/v1/comments/:commentId', () => {
    test('owner can delete their comment', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Delete me'
      })

      await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      const deleted = await Comment.findById(comment._id)
      expect(deleted).toBeNull()
    })

    test('admin can delete any comment', async () => {
      const otherAuthor = await makeAuthor()
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: otherAuthor._id, body: 'Not mine'
      })

      const adminAuthor = await makeAuthor()
      const adminEnvKey = process.env.NODE_ENV === 'development' ? 'REACT_APP_ADMIN_PRE' : 'REACT_APP_ADMIN'
      process.env[adminEnvKey] = String(adminAuthor._id)
      const adminToken = makeToken(adminAuthor._id)

      await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204)

      delete process.env[adminEnvKey]
      expect(await Comment.findById(comment._id)).toBeNull()
    })

    test('returns 403 when non-owner tries to delete', async () => {
      const otherAuthor = await makeAuthor()
      const otherToken = makeToken(otherAuthor._id)

      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Protected'
      })

      const res = await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403)

      expect(res.body.error).toBe('Forbidden')
      expect(await Comment.findById(comment._id)).not.toBeNull()
    })

    test('returns 401 without token', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Test'
      })

      await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .expect(401)
    })

    test('returns 404 for non-existent comment', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const res = await request(app)
        .delete(`/api/v1/comments/${fakeId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)

      expect(res.body.error).toBe('Comment not found')
    })

    test('only deletes the targeted comment', async () => {
      const c1 = await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Keep me' })
      const c2 = await Comment.create({ targetType: 'poem', targetId: poemTargetId, authorId: author._id, body: 'Delete me' })

      await request(app)
        .delete(`/api/v1/comments/${c2._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)

      expect(await Comment.findById(c1._id)).not.toBeNull()
      expect(await Comment.findById(c2._id)).toBeNull()
    })
  })

  // ─── CROSS-USER INTERACTIONS ─────────────────────────────────────────

  describe('Cross-user interactions', () => {
    let authorA, tokenA, authorB, tokenB, poemId

    beforeEach(async () => {
      authorA = await makeAuthor({ name: 'Alice' })
      tokenA = makeToken(authorA._id)
      authorB = await makeAuthor({ name: 'Bob' })
      tokenB = makeToken(authorB._id)
      poemId = new (require('mongoose').Types.ObjectId)()
    })

    test('User B can read User A comment on a poem', async () => {
      await Comment.create({ targetType: 'poem', targetId: poemId, authorId: authorA._id, body: 'Alice was here' })

      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemId}`)
        .expect(200)

      expect(res.body).toHaveLength(1)
      expect(res.body[0].body).toBe('Alice was here')
      expect(res.body[0].authorName).toBe('Alice')
    })

    test('multiple users commenting on the same poem all appear', async () => {
      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ targetType: 'poem', targetId: poemId, body: 'From Alice' })
        .expect(201)

      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ targetType: 'poem', targetId: poemId, body: 'From Bob' })
        .expect(201)

      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemId}`)
        .expect(200)

      expect(res.body).toHaveLength(2)
      const bodies = res.body.map(c => c.body)
      expect(bodies).toContain('From Alice')
      expect(bodies).toContain('From Bob')
    })

    test('User B cannot delete User A comment', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemId, authorId: authorA._id, body: 'Protected'
      })

      const res = await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403)

      expect(res.body.error).toBe('Forbidden')
      expect(await Comment.findById(comment._id)).not.toBeNull()
    })

    test('User B cannot edit User A comment', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemId, authorId: authorA._id, body: 'Original'
      })

      await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ body: 'Hijacked' })
        .expect(403)

      const unchanged = await Comment.findById(comment._id)
      expect(unchanged.body).toBe('Original')
    })

    test('User A can reply to User B comment and both appear with correct parentId', async () => {
      const parentRes = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ targetType: 'poem', targetId: poemId, body: 'Top-level by Bob' })
        .expect(201)

      const parentId = parentRes.body.id

      const replyRes = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ targetType: 'poem', targetId: poemId, body: 'Alice replies', parentId })
        .expect(201)

      expect(replyRes.body.parentId).toBe(parentId)
      expect(replyRes.body.authorName).toBe('Alice')

      const allRes = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemId}`)
        .expect(200)

      expect(allRes.body).toHaveLength(2)
      const reply = allRes.body.find(c => c.parentId === parentId)
      expect(reply).toBeDefined()
      expect(reply.body).toBe('Alice replies')
    })

    test('User A can delete their own comment on User B poem', async () => {
      const comment = await Comment.create({
        targetType: 'poem', targetId: poemId, authorId: authorA._id, body: 'My comment on your poem'
      })

      await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(204)

      expect(await Comment.findById(comment._id)).toBeNull()
    })

    test('comments on profile target are isolated from poem target', async () => {
      const profileId = new (require('mongoose').Types.ObjectId)()

      await Comment.create({ targetType: 'poem', targetId: poemId, authorId: authorA._id, body: 'On poem' })
      await Comment.create({ targetType: 'profile', targetId: profileId, authorId: authorB._id, body: 'On profile' })

      const poemRes = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemId}`)
        .expect(200)
      expect(poemRes.body).toHaveLength(1)
      expect(poemRes.body[0].body).toBe('On poem')

      const profileRes = await request(app)
        .get(`/api/v1/comments?targetType=profile&targetId=${profileId}`)
        .expect(200)
      expect(profileRes.body).toHaveLength(1)
      expect(profileRes.body[0].body).toBe('On profile')
    })

    test('body exceeding 1000 characters is rejected with 400', async () => {
      const longBody = 'x'.repeat(1001)

      const res = await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ targetType: 'poem', targetId: poemId, body: longBody })
        .expect(400)

      expect(res.body.error).toBeDefined()
    })

    test('author fields are correct for each commenter', async () => {
      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ targetType: 'poem', targetId: poemId, body: 'From Alice' })
        .expect(201)

      await request(app)
        .post('/api/v1/comments')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ targetType: 'poem', targetId: poemId, body: 'From Bob' })
        .expect(201)

      const res = await request(app)
        .get(`/api/v1/comments?targetType=poem&targetId=${poemId}`)
        .expect(200)

      const alice = res.body.find(c => c.body === 'From Alice')
      const bob = res.body.find(c => c.body === 'From Bob')

      expect(alice.authorName).toBe('Alice')
      expect(alice.authorId).toBe(String(authorA._id))
      expect(bob.authorName).toBe('Bob')
      expect(bob.authorId).toBe(String(authorB._id))
    })
  })
})
