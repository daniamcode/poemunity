const request = require('supertest')
const bcrypt = require('bcrypt')
const { app } = require('../../app')
const User = require('../models/User')
const Poem = require('../models/Poem')

describe('Users API', () => {
  describe('GET /api/users', () => {
    test('should return all users successfully', async () => {
      // Create test users
      const passwordHash = await bcrypt.hash('password123', 10)
      await User.create([
        {
          username: 'user1',
          name: 'User One',
          email: 'user1@example.com',
          passwordHash,
          picture: 'pic1.jpg'
        },
        {
          username: 'user2',
          name: 'User Two',
          email: 'user2@example.com',
          passwordHash,
          picture: 'pic2.jpg'
        }
      ])

      const response = await request(app)
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toHaveLength(2)
      const usernames = response.body.map(u => u.username).sort()
      expect(usernames).toEqual(['user1', 'user2'])
    })

    test('should return empty array when no users exist', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body).toEqual([])
      expect(Array.isArray(response.body)).toBe(true)
    })

    test('should populate poems with content and date', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash,
        picture: 'pic.jpg'
      })

      // Create a poem for this user
      const poem = await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'This is poem content',
        genre: 'love',
        likes: [],
        userId: user._id,
        picture: 'pic.jpg',
        date: new Date('2024-01-01')
      })

      // Add poem to user
      user.poems = [poem._id]
      await user.save()

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].poems).toBeDefined()
      expect(Array.isArray(response.body[0].poems)).toBe(true)
      expect(response.body[0].poems).toHaveLength(1)
      // Should only populate content and date
      expect(response.body[0].poems[0]).toHaveProperty('date')
    })

    test('should include user properties in response', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash,
        picture: 'https://example.com/pic.jpg'
      })

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body[0]).toHaveProperty('username')
      expect(response.body[0]).toHaveProperty('email')
      expect(response.body[0]).toHaveProperty('picture')
      expect(response.body[0]).toHaveProperty('id')
    })

    test('should not expose password hash in response', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash,
        picture: 'pic.jpg'
      })

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body[0].password).toBeUndefined()
      expect(response.body[0]).not.toHaveProperty('password')
    })

    test('should return users with empty poems array if no poems', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      await User.create({
        username: 'testuser',
        name: 'Test User',
        email: 'test@example.com',
        passwordHash,
        picture: 'pic.jpg'
      })

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body[0].poems).toBeDefined()
      expect(Array.isArray(response.body[0].poems)).toBe(true)
      expect(response.body[0].poems).toHaveLength(0)
    })

    test('should handle multiple users with different poem counts', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      const user1 = await User.create({
        username: 'user1',
        name: 'User One',
        email: 'user1@example.com',
        passwordHash,
        picture: 'pic1.jpg'
      })

      const user2 = await User.create({
        username: 'user2',
        name: 'User Two',
        email: 'user2@example.com',
        passwordHash,
        picture: 'pic2.jpg'
      })

      // Create poems for user1 only
      const poem1 = await Poem.create({
        title: 'Poem 1',
        author: 'user1',
        poem: 'Content 1',
        genre: 'love',
        likes: [],
        userId: user1._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      const poem2 = await Poem.create({
        title: 'Poem 2',
        author: 'user1',
        poem: 'Content 2',
        genre: 'sad',
        likes: [],
        userId: user1._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      user1.poems = [poem1._id, poem2._id]
      await user1.save()

      const response = await request(app)
        .get('/api/users')
        .expect(200)

      expect(response.body).toHaveLength(2)
      const user1Response = response.body.find(u => u.username === 'user1')
      const user2Response = response.body.find(u => u.username === 'user2')

      expect(user1Response.poems).toHaveLength(2)
      expect(user2Response.poems).toHaveLength(0)
    })
  })

  describe('POST /api/users', () => {
    test('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'newuser',
          name: 'New User',
          password: 'password123'
        })
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(response.body.username).toBe('newuser')
      expect(response.body.name).toBe('New User')
      expect(response.body.picture).toBe('https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg')
      expect(response.body).toHaveProperty('id')
      expect(response.body).not.toHaveProperty('passwordHash')
    })

    test('should hash the password', async () => {
      await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          name: 'Test User',
          password: 'password123'
        })
        .expect(201)

      const user = await User.findOne({ username: 'testuser' })
      expect(user.passwordHash).toBeDefined()
      expect(user.passwordHash).not.toBe('password123')

      // Verify the hash is valid
      const isValid = await bcrypt.compare('password123', user.passwordHash)
      expect(isValid).toBe(true)
    })

    test('should assign default profile picture', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          name: 'Test User',
          password: 'password123'
        })
        .expect(201)

      expect(response.body.picture).toBe('https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg')
    })

    test('should create user in database', async () => {
      await request(app)
        .post('/api/users')
        .send({
          username: 'dbuser',
          name: 'DB User',
          password: 'password123'
        })
        .expect(201)

      const user = await User.findOne({ username: 'dbuser' })
      expect(user).toBeDefined()
      expect(user.username).toBe('dbuser')
      expect(user.name).toBe('DB User')
    })

    test('should not expose password in response', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'secureuser',
          name: 'Secure User',
          password: 'secretpassword'
        })
        .expect(201)

      expect(response.body.password).toBeUndefined()
      expect(response.body).not.toHaveProperty('password')
    })

    test('should handle special characters in username', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'user_123-test',
          name: 'Special User',
          password: 'password123'
        })
        .expect(201)

      expect(response.body.username).toBe('user_123-test')
    })

    test('should handle special characters in name', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'testuser',
          name: 'John O\'Brien-Smith',
          password: 'password123'
        })
        .expect(201)

      expect(response.body.name).toBe('John O\'Brien-Smith')
    })

    test('should create multiple different users', async () => {
      // First user
      await request(app)
        .post('/api/users')
        .send({
          username: 'user1',
          name: 'User One',
          password: 'pass1'
        })
        .expect(201)

      // Second user
      await request(app)
        .post('/api/users')
        .send({
          username: 'user2',
          name: 'User Two',
          password: 'pass2'
        })
        .expect(201)

      // Both should exist in database
      const count = await User.countDocuments()
      expect(count).toBe(2)
    })

    test('should use bcrypt with salt rounds of 10', async () => {
      await request(app)
        .post('/api/users')
        .send({
          username: 'bcryptuser',
          name: 'Bcrypt User',
          password: 'testpassword'
        })
        .expect(201)

      const user = await User.findOne({ username: 'bcryptuser' })

      // Bcrypt hashes start with $2b$ (or $2a$) followed by cost factor
      expect(user.passwordHash).toMatch(/^\$2[ab]\$10\$/)
    })

    test('should initialize user with empty poems array', async () => {
      await request(app)
        .post('/api/users')
        .send({
          username: 'newuser',
          name: 'New User',
          password: 'password123'
        })
        .expect(201)

      const user = await User.findOne({ username: 'newuser' })
      expect(user.poems).toBeDefined()
      expect(Array.isArray(user.poems)).toBe(true)
      expect(user.poems).toHaveLength(0)
    })

    test('should allow users with same name but different usernames', async () => {
      // First user
      await request(app)
        .post('/api/users')
        .send({
          username: 'user1',
          name: 'John Smith',
          password: 'pass1'
        })
        .expect(201)

      // Second user with same name but different username
      await request(app)
        .post('/api/users')
        .send({
          username: 'user2',
          name: 'John Smith',
          password: 'pass2'
        })
        .expect(201)

      const count = await User.countDocuments({ name: 'John Smith' })
      expect(count).toBe(2)
    })

    test('should handle user creation with minimal required fields', async () => {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: 'minimaluser',
          name: 'Minimal',
          password: 'pass'
        })
        .expect(201)

      expect(response.body.username).toBe('minimaluser')
      expect(response.body.name).toBe('Minimal')
      expect(response.body.picture).toBe('https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg')
    })
  })
})
