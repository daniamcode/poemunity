const request = require('supertest')
const bcrypt = require('bcrypt')
const { app } = require('../../app')
const User = require('../models/User')

describe('Login API', () => {
  describe('POST /api/login', () => {
    test('should login successfully with valid credentials', async () => {
      // Create a test user
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash,
        picture: 'https://example.com/pic.jpg'
      })
      await user.save()

      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)

      // Response should be a JWT token (string)
      expect(typeof response.text).toBe('string')
      expect(response.text.length).toBeGreaterThan(0)
    })

    test('should return 401 with invalid username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(response.body.error).toBe('invalid user or password')
    })

    test('should return 401 with invalid password', async () => {
      const passwordHash = await bcrypt.hash('correctpassword', 10)
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash,
        picture: 'https://example.com/pic.jpg'
      })
      await user.save()

      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(401)
        .expect('Content-Type', /application\/json/)

      expect(response.body.error).toBe('invalid user or password')
    })

    test('should return 401 with empty username', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          username: '',
          password: 'password123'
        })
        .expect(401)

      expect(response.body.error).toBe('invalid user or password')
    })

    test('should return 401 with empty password', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash,
        picture: 'https://example.com/pic.jpg'
      })
      await user.save()

      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: ''
        })
        .expect(401)

      expect(response.body.error).toBe('invalid user or password')
    })

    test('should return 401 with missing credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({})
        .expect(401)

      expect(response.body.error).toBe('invalid user or password')
    })

    test('should return valid JWT token on successful login', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = new User({
        username: 'testuser',
        email: 'test@example.com',
        passwordHash,
        picture: 'https://example.com/pic.jpg'
      })
      await user.save()

      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(200)

      // JWT tokens have 3 parts separated by dots
      const tokenParts = response.text.split('.')
      expect(tokenParts).toHaveLength(3)
    })

    test('should handle case-sensitive username', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = new User({
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash,
        picture: 'https://example.com/pic.jpg'
      })
      await user.save()

      // Attempt login with different case
      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(401)

      expect(response.body.error).toBe('invalid user or password')
    })

    test('should allow login with correct case-sensitive username', async () => {
      const passwordHash = await bcrypt.hash('password123', 10)
      const user = new User({
        username: 'TestUser',
        email: 'test@example.com',
        passwordHash,
        picture: 'https://example.com/pic.jpg'
      })
      await user.save()

      const response = await request(app)
        .post('/api/login')
        .send({
          username: 'TestUser',
          password: 'password123'
        })
        .expect(200)

      expect(typeof response.text).toBe('string')
      expect(response.text.length).toBeGreaterThan(0)
    })

    test('should work with different users', async () => {
      // Create multiple users
      const user1Hash = await bcrypt.hash('pass1', 10)
      const user2Hash = await bcrypt.hash('pass2', 10)

      await User.create({
        username: 'user1',
        email: 'user1@example.com',
        passwordHash: user1Hash,
        picture: 'pic1.jpg'
      })

      await User.create({
        username: 'user2',
        email: 'user2@example.com',
        passwordHash: user2Hash,
        picture: 'pic2.jpg'
      })

      // Login as user1
      const response1 = await request(app)
        .post('/api/login')
        .send({
          username: 'user1',
          password: 'pass1'
        })
        .expect(200)

      // Login as user2
      const response2 = await request(app)
        .post('/api/login')
        .send({
          username: 'user2',
          password: 'pass2'
        })
        .expect(200)

      // Both should get tokens
      expect(response1.text).toBeTruthy()
      expect(response2.text).toBeTruthy()
      // Tokens should be different
      expect(response1.text).not.toBe(response2.text)
    })
  })
})
