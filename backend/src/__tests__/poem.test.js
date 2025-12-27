const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const User = require('../models/User')
const Poem = require('../models/Poem')

describe('Poem API', () => {
  let testUser
  let authToken

  beforeEach(async () => {
    // Create a test user and generate auth token
    const passwordHash = await bcrypt.hash('password123', 10)
    testUser = await User.create({
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      picture: 'https://example.com/pic.jpg'
    })

    const userForToken = {
      id: testUser._id,
      username: testUser.username,
      picture: testUser.picture
    }

    authToken = jwt.sign(
      userForToken,
      process.env.SECRET,
      {
        expiresIn: 60 * 60 * 24 * 7
      }
    )
  })

  describe('GET /api/poem/:poemId', () => {
    test('should fetch poem successfully', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'This is poem content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date('2024-01-01')
      })

      const response = await request(app)
        .get(`/api/poem/${poem._id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.title).toBe('Test Poem')
      expect(response.body.author).toBe('testuser')
      expect(response.body.poem).toBe('This is poem content')
      expect(response.body.genre).toBe('love')
    })

    test('should return 404 for non-existent poem', async () => {
      // Use a valid ObjectId format but non-existent
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .get(`/api/poem/${fakeId}`)
        .expect(404)

      expect(response.body.error).toBe('poem not found')
    })

    test('should return 404 for invalid poem ID format', async () => {
      const response = await request(app)
        .get('/api/poem/invalid-id')
        .expect(404)

      expect(response.body.error).toBe('poem not found')
    })

    test('should include all poem fields in response', async () => {
      const poem = await Poem.create({
        title: 'Complete Poem',
        author: 'testuser',
        poem: 'Full content',
        genre: 'sad',
        likes: [testUser._id],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date('2024-01-01')
      })

      const response = await request(app)
        .get(`/api/poem/${poem._id}`)
        .expect(200)

      expect(response.body).toHaveProperty('id')
      expect(response.body).toHaveProperty('title')
      expect(response.body).toHaveProperty('author')
      expect(response.body).toHaveProperty('poem')
      expect(response.body).toHaveProperty('genre')
      expect(response.body).toHaveProperty('likes')
      expect(response.body).toHaveProperty('userId')
      expect(response.body).toHaveProperty('picture')
      expect(response.body).toHaveProperty('date')
    })

    test('should return poem with likes array', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: await bcrypt.hash('pass', 10),
        picture: 'pic.jpg'
      })

      const poem = await Poem.create({
        title: 'Liked Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [testUser._id, otherUser._id],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .get(`/api/poem/${poem._id}`)
        .expect(200)

      expect(Array.isArray(response.body.likes)).toBe(true)
      expect(response.body.likes).toHaveLength(2)
    })
  })

  describe('PUT /api/poem/:poemId (like/unlike)', () => {
    test('should like a poem when user has not liked it', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.likes).toContain(testUser._id.toString())
      expect(response.body.likes).toHaveLength(1)
    })

    test('should unlike a poem when user has already liked it', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [testUser._id],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.likes).not.toContain(testUser._id.toString())
      expect(response.body.likes).toHaveLength(0)
    })

    test('should toggle like multiple times', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      // Like the poem
      let response = await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.likes).toHaveLength(1)

      // Unlike the poem
      response = await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.likes).toHaveLength(0)

      // Like again
      response = await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.likes).toHaveLength(1)
    })

    test('should return 401 without authentication token', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .put(`/api/poem/${poem._id}`)
        .expect(401)

      expect(response.body.error).toBe('token missing or invalid')
    })

    test('should return 401 with invalid token', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })

    test('should return 404 for non-existent poem', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .put(`/api/poem/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('poem not found')
    })

    test('should persist like in database', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      const updatedPoem = await Poem.findById(poem._id)
      expect(updatedPoem.likes).toHaveLength(1)
      expect(updatedPoem.likes[0].toString()).toBe(testUser._id.toString())
    })

    test('should handle multiple users liking the same poem', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        passwordHash: await bcrypt.hash('pass', 10),
        picture: 'pic.jpg'
      })

      const otherToken = jwt.sign(
        { id: otherUser._id, username: otherUser.username, picture: otherUser.picture },
        process.env.SECRET,
        { expiresIn: 60 * 60 * 24 * 7 }
      )

      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      // First user likes
      await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Second user likes
      const response = await request(app)
        .put(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200)

      expect(response.body.likes).toHaveLength(2)
    })
  })

  describe('PATCH /api/poem/:poemId (update)', () => {
    test('should update poem title', async () => {
      const poem = await Poem.create({
        title: 'Original Title',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .patch(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(200)

      expect(response.body.title).toBe('Updated Title')
    })

    test('should update poem content', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Original content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .patch(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ poem: 'Updated content' })
        .expect(200)

      expect(response.body.poem).toBe('Updated content')
    })

    test('should update multiple fields at once', async () => {
      const poem = await Poem.create({
        title: 'Original Title',
        author: 'testuser',
        poem: 'Original content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .patch(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'New Title',
          poem: 'New content',
          genre: 'sad'
        })
        .expect(200)

      expect(response.body.title).toBe('New Title')
      expect(response.body.poem).toBe('New content')
      expect(response.body.genre).toBe('sad')
    })

    test('should update genre', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .patch(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ genre: 'happy' })
        .expect(200)

      expect(response.body.genre).toBe('happy')
    })

    test('should return 401 without authentication token', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .patch(`/api/poem/${poem._id}`)
        .send({ title: 'New Title' })
        .expect(401)

      expect(response.body.error).toBe('token missing or invalid')
    })

    test('should return 404 for non-existent poem', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .patch(`/api/poem/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'New Title' })
        .expect(404)

      expect(response.body.error).toBe('poem not found')
    })

    test('should persist changes in database', async () => {
      const poem = await Poem.create({
        title: 'Original Title',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      await request(app)
        .patch(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' })
        .expect(200)

      const updatedPoem = await Poem.findById(poem._id)
      expect(updatedPoem.title).toBe('Updated Title')
    })

    test('should update picture URL', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'old-pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .patch(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ picture: 'new-pic.jpg' })
        .expect(200)

      expect(response.body.picture).toBe('new-pic.jpg')
    })
  })

  describe('DELETE /api/poem/:poemId', () => {
    test('should delete poem successfully', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      await request(app)
        .delete(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)
    })

    test('should not find poem after deletion', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      await request(app)
        .delete(`/api/poem/${poem._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      const deletedPoem = await Poem.findById(poem._id)
      expect(deletedPoem).toBeNull()
    })

    test('should return 404 for non-existent poem', async () => {
      const fakeId = '507f1f77bcf86cd799439011'

      const response = await request(app)
        .delete(`/api/poem/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('poem not found or not deleted')
    })

    test('should return 401 without authentication token', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const response = await request(app)
        .delete(`/api/poem/${poem._id}`)
        .expect(401)

      expect(response.body.error).toBe('token missing or invalid')
    })

    test('should return 404 for invalid poem ID format', async () => {
      const response = await request(app)
        .delete('/api/poem/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)

      expect(response.body.error).toBe('poem not found or not deleted')
    })

    test('should only delete specified poem', async () => {
      const poem1 = await Poem.create({
        title: 'Poem 1',
        author: 'testuser',
        poem: 'Content 1',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const poem2 = await Poem.create({
        title: 'Poem 2',
        author: 'testuser',
        poem: 'Content 2',
        genre: 'sad',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      await request(app)
        .delete(`/api/poem/${poem1._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      const remainingPoem = await Poem.findById(poem2._id)
      expect(remainingPoem).toBeDefined()
      expect(remainingPoem.title).toBe('Poem 2')
    })

    test('should remove poem from database completely', async () => {
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const poemId = poem._id

      await request(app)
        .delete(`/api/poem/${poemId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204)

      const poemCount = await Poem.countDocuments({ _id: poemId })
      expect(poemCount).toBe(0)
    })
  })
})
