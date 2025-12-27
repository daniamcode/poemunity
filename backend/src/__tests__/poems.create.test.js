const request = require('supertest')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const User = require('../models/User')
const Poem = require('../models/Poem')

describe('Poems API - Create and Update', () => {
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

  describe('POST /api/poems', () => {
    test('should create a new poem successfully', async () => {
      const newPoem = {
        title: 'New Poem',
        poem: 'This is a beautiful poem about nature',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(response.body.title).toBe('New Poem')
      expect(response.body.poem).toBe('This is a beautiful poem about nature')
      expect(response.body.genre).toBe('love')
      expect(response.body.author).toBe('testuser')
      expect(response.body.userId).toBe(testUser._id.toString())
      expect(response.body.picture).toBe('https://example.com/pic.jpg')
    })

    test('should add poem to user poems array', async () => {
      const newPoem = {
        title: 'Test Poem',
        poem: 'Content',
        genre: 'sad',
        date: new Date()
      }

      await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      const updatedUser = await User.findById(testUser._id)
      expect(updatedUser.poems).toHaveLength(1)
    })

    test('should create poem in database', async () => {
      const newPoem = {
        title: 'Database Poem',
        poem: 'This poem should be saved',
        genre: 'happy',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      const poemInDb = await Poem.findById(response.body.id)
      expect(poemInDb).toBeDefined()
      expect(poemInDb.title).toBe('Database Poem')
    })

    test('should set author as username of authenticated user', async () => {
      const newPoem = {
        title: 'Author Test',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.author).toBe(testUser.username)
    })

    test('should set picture from authenticated user', async () => {
      const newPoem = {
        title: 'Picture Test',
        poem: 'Content',
        genre: 'sad',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.picture).toBe(testUser.picture)
    })

    test('should initialize poem with empty likes array', async () => {
      const newPoem = {
        title: 'Likes Test',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.likes).toBeDefined()
      expect(Array.isArray(response.body.likes)).toBe(true)
      expect(response.body.likes).toHaveLength(0)
    })

    test('should return 401 without authentication token', async () => {
      const newPoem = {
        title: 'Unauthorized Poem',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .send(newPoem)
        .expect(401)

      expect(response.body.error).toBe('token missing or invalid')
    })

    test('should return 401 with invalid token', async () => {
      const newPoem = {
        title: 'Invalid Token Poem',
        poem: 'Content',
        genre: 'sad',
        date: new Date()
      }

      await request(app)
        .post('/api/poems')
        .set('Authorization', 'Bearer invalid-token')
        .send(newPoem)
        .expect(401)
    })

    test('should create multiple poems for same user', async () => {
      const poem1 = {
        title: 'First Poem',
        poem: 'Content 1',
        genre: 'love',
        date: new Date()
      }

      const poem2 = {
        title: 'Second Poem',
        poem: 'Content 2',
        genre: 'sad',
        date: new Date()
      }

      await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(poem1)
        .expect(201)

      await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(poem2)
        .expect(201)

      const updatedUser = await User.findById(testUser._id)
      expect(updatedUser.poems).toHaveLength(2)
    })

    test('should handle poems with different genres', async () => {
      const genres = ['love', 'sad', 'happy', 'angry', 'nature']

      for (const genre of genres) {
        const response = await request(app)
          .post('/api/poems')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `${genre} poem`,
            poem: `Content about ${genre}`,
            genre,
            date: new Date()
          })
          .expect(201)

        expect(response.body.genre).toBe(genre)
      }
    })

    test('should handle long poem content', async () => {
      const longContent = 'This is a very long poem. '.repeat(100)
      const newPoem = {
        title: 'Long Poem',
        poem: longContent,
        genre: 'nature',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.poem).toBe(longContent)
    })

    test('should handle special characters in poem content', async () => {
      const specialContent = 'Roses are red 🌹\nViolets are blue 💙\nPoetry is art\nAnd so are you! 😊'
      const newPoem = {
        title: 'Special Characters',
        poem: specialContent,
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.poem).toBe(specialContent)
    })

    test('should preserve date when creating poem', async () => {
      const testDate = new Date('2024-01-15T10:30:00.000Z')
      const newPoem = {
        title: 'Date Test',
        poem: 'Content',
        genre: 'love',
        date: testDate
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(new Date(response.body.date).toISOString()).toBe(testDate.toISOString())
    })

    test('should handle poems created by different users', async () => {
      // Create second user
      const passwordHash = await bcrypt.hash('password456', 10)
      const user2 = await User.create({
        username: 'user2',
        name: 'User Two',
        email: 'user2@example.com',
        passwordHash,
        picture: 'https://example.com/pic2.jpg'
      })

      const token2 = jwt.sign(
        { id: user2._id, username: user2.username, picture: user2.picture },
        process.env.SECRET,
        { expiresIn: 60 * 60 * 24 * 7 }
      )

      // Create poem with first user
      const response1 = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'User 1 Poem',
          poem: 'Content 1',
          genre: 'love',
          date: new Date()
        })
        .expect(201)

      // Create poem with second user
      const response2 = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          title: 'User 2 Poem',
          poem: 'Content 2',
          genre: 'sad',
          date: new Date()
        })
        .expect(201)

      expect(response1.body.author).toBe('testuser')
      expect(response2.body.author).toBe('user2')
      expect(response1.body.userId).not.toBe(response2.body.userId)
    })

    test('should include _id in response', async () => {
      const newPoem = {
        title: 'ID Test',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.id).toBeDefined()
      expect(typeof response.body.id).toBe('string')
    })
  })

  describe('PATCH /api/poems (bulk update)', () => {
    test('should add new property to all poems', async () => {
      // Create test poems
      await Poem.create([
        {
          title: 'Poem 1',
          author: 'testuser',
          poem: 'Content 1',
          genre: 'love',
          likes: [],
          userId: testUser._id,
          picture: 'pic1.jpg',
          date: new Date()
        },
        {
          title: 'Poem 2',
          author: 'testuser',
          poem: 'Content 2',
          genre: 'sad',
          likes: [],
          userId: testUser._id,
          picture: 'pic2.jpg',
          date: new Date()
        }
      ])

      await request(app)
        .patch('/api/poems')
        .send({ newField: 'newValue' })
        .expect(204)

      const poems = await Poem.find({})
      expect(poems).toHaveLength(2)
      expect(poems[0].newField).toBe('newValue')
      expect(poems[1].newField).toBe('newValue')
    })

    test('should update existing property on all poems', async () => {
      // Create test poems with initial property
      await Poem.create([
        {
          title: 'Poem 1',
          author: 'testuser',
          poem: 'Content 1',
          genre: 'love',
          likes: [],
          userId: testUser._id,
          picture: 'pic1.jpg',
          date: new Date(),
          status: 'draft'
        },
        {
          title: 'Poem 2',
          author: 'testuser',
          poem: 'Content 2',
          genre: 'sad',
          likes: [],
          userId: testUser._id,
          picture: 'pic2.jpg',
          date: new Date(),
          status: 'draft'
        }
      ])

      await request(app)
        .patch('/api/poems')
        .send({ status: 'published' })
        .expect(204)

      const poems = await Poem.find({})
      expect(poems[0].status).toBe('published')
      expect(poems[1].status).toBe('published')
    })

    test('should handle empty database', async () => {
      await request(app)
        .patch('/api/poems')
        .send({ newField: 'value' })
        .expect(204)

      const poems = await Poem.find({})
      expect(poems).toHaveLength(0)
    })

    test('should update all poems regardless of author', async () => {
      // Create second user
      const user2 = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        passwordHash: await bcrypt.hash('pass', 10),
        picture: 'pic.jpg'
      })

      // Create poems from different users
      await Poem.create([
        {
          title: 'User 1 Poem',
          author: 'testuser',
          poem: 'Content',
          genre: 'love',
          likes: [],
          userId: testUser._id,
          picture: 'pic1.jpg',
          date: new Date()
        },
        {
          title: 'User 2 Poem',
          author: 'user2',
          poem: 'Content',
          genre: 'sad',
          likes: [],
          userId: user2._id,
          picture: 'pic2.jpg',
          date: new Date()
        }
      ])

      await request(app)
        .patch('/api/poems')
        .send({ verified: true })
        .expect(204)

      const poems = await Poem.find({})
      expect(poems).toHaveLength(2)
      expect(poems[0].verified).toBe(true)
      expect(poems[1].verified).toBe(true)
    })

    test('should update multiple properties at once', async () => {
      await Poem.create({
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
        .patch('/api/poems')
        .send({
          featured: true,
          verified: true,
          status: 'published'
        })
        .expect(204)

      const poem = await Poem.findOne({})
      expect(poem.featured).toBe(true)
      expect(poem.verified).toBe(true)
      expect(poem.status).toBe('published')
    })

    test('should handle numeric values', async () => {
      await Poem.create({
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
        .patch('/api/poems')
        .send({ viewCount: 0 })
        .expect(204)

      const poem = await Poem.findOne({})
      expect(poem.viewCount).toBe(0)
    })

    test('should handle boolean values', async () => {
      await Poem.create({
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
        .patch('/api/poems')
        .send({ isPinned: false })
        .expect(204)

      const poem = await Poem.findOne({})
      expect(poem.isPinned).toBe(false)
    })

    test('should handle array values', async () => {
      await Poem.create({
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
        .patch('/api/poems')
        .send({ tags: ['poetry', 'modern', 'featured'] })
        .expect(204)

      const poem = await Poem.findOne({})
      expect(Array.isArray(poem.tags)).toBe(true)
      expect(poem.tags).toHaveLength(3)
      expect(poem.tags).toContain('poetry')
    })

    test('should not require authentication', async () => {
      await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      // No Authorization header
      await request(app)
        .patch('/api/poems')
        .send({ newField: 'value' })
        .expect(204)
    })

    test('should update poems with large batch', async () => {
      // Create 50 poems
      const poems = Array.from({ length: 50 }, (_, i) => ({
        title: `Poem ${i}`,
        author: 'testuser',
        poem: `Content ${i}`,
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      }))
      await Poem.insertMany(poems)

      await request(app)
        .patch('/api/poems')
        .send({ bulkUpdate: true })
        .expect(204)

      const updatedPoems = await Poem.find({ bulkUpdate: true })
      expect(updatedPoems).toHaveLength(50)
    })
  })
})
