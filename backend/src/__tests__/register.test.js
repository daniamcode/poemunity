const request = require('supertest')
const bcrypt = require('bcrypt')
const { app } = require('../../app')
const User = require('../models/User')

describe('Register API', () => {
  describe('POST /api/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'password123'
        })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      expect(response.body.username).toBe('newuser')
      expect(response.body.email).toBe('newuser@example.com')
      expect(response.body.picture).toBe('https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg')
      expect(response.body).toHaveProperty('id')
      expect(response.body).not.toHaveProperty('passwordHash')
    })

    test('should hash the password', async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)

      const user = await User.findOne({ username: 'testuser' })
      expect(user.passwordHash).toBeDefined()
      expect(user.passwordHash).not.toBe('password123')

      // Verify the hash is valid
      const isValid = await bcrypt.compare('password123', user.passwordHash)
      expect(isValid).toBe(true)
    })

    test('should return 401 when username already exists', async () => {
      // Create existing user
      await User.create({
        username: 'existinguser',
        email: 'first@example.com',
        passwordHash: await bcrypt.hash('pass', 10),
        picture: 'pic.jpg'
      })

      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'existinguser',
          email: 'different@example.com',
          password: 'password123'
        })
        .expect(401)

      expect(response.body.error).toBe('This username already exists. Please try with another one')
      expect(response.body.code).toBe('1')
    })

    test('should return 401 when email already exists', async () => {
      // Create existing user
      await User.create({
        username: 'user1',
        email: 'existing@example.com',
        passwordHash: await bcrypt.hash('pass', 10),
        picture: 'pic.jpg'
      })

      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'differentuser',
          email: 'existing@example.com',
          password: 'password123'
        })
        .expect(401)

      expect(response.body.error).toBe('This email already exists. Please try with another one')
      expect(response.body.code).toBe('2')
    })

    test('should create user in database', async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'dbuser',
          email: 'dbuser@example.com',
          password: 'password123'
        })
        .expect(200)

      const user = await User.findOne({ username: 'dbuser' })
      expect(user).toBeDefined()
      expect(user.username).toBe('dbuser')
      expect(user.email).toBe('dbuser@example.com')
    })

    test('should assign default profile picture', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)

      expect(response.body.picture).toBe('https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg')
    })

    test('should allow registration with different usernames and emails', async () => {
      // First user
      await request(app)
        .post('/api/register')
        .send({
          username: 'user1',
          email: 'user1@example.com',
          password: 'pass1'
        })
        .expect(200)

      // Second user
      await request(app)
        .post('/api/register')
        .send({
          username: 'user2',
          email: 'user2@example.com',
          password: 'pass2'
        })
        .expect(200)

      // Both should exist in database
      const count = await User.countDocuments()
      expect(count).toBe(2)
    })

    test('should handle case-sensitive username uniqueness', async () => {
      // Create user with lowercase
      await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test1@example.com',
          password: 'pass1'
        })
        .expect(200)

      // Try to register with different case
      await request(app)
        .post('/api/register')
        .send({
          username: 'TestUser',
          email: 'test2@example.com',
          password: 'pass2'
        })
        .expect(200)

      // Both should exist as they are different
      const count = await User.countDocuments()
      expect(count).toBe(2)
    })

    test('should handle case-sensitive email uniqueness', async () => {
      // Create user with lowercase email
      await request(app)
        .post('/api/register')
        .send({
          username: 'user1',
          email: 'test@example.com',
          password: 'pass1'
        })
        .expect(200)

      // Try to register with different case email
      await request(app)
        .post('/api/register')
        .send({
          username: 'user2',
          email: 'Test@Example.com',
          password: 'pass2'
        })
        .expect(200)

      // Both should exist as they are different
      const count = await User.countDocuments()
      expect(count).toBe(2)
    })

    test('should not expose password in response', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'secureuser',
          email: 'secure@example.com',
          password: 'secretpassword'
        })
        .expect(200)

      expect(response.body.password).toBeUndefined()
      expect(response.body).not.toHaveProperty('password')
    })

    test('should handle special characters in username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'user_123-test',
          email: 'special@example.com',
          password: 'password123'
        })
        .expect(200)

      expect(response.body.username).toBe('user_123-test')
    })

    test('should handle special characters in email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          username: 'testuser',
          email: 'test.user+tag@example.co.uk',
          password: 'password123'
        })
        .expect(200)

      expect(response.body.email).toBe('test.user+tag@example.co.uk')
    })

    test('should initialize user with empty poems array', async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'newuser',
          email: 'new@example.com',
          password: 'password123'
        })
        .expect(200)

      const user = await User.findOne({ username: 'newuser' })
      expect(user.poems).toBeDefined()
      expect(Array.isArray(user.poems)).toBe(true)
      expect(user.poems).toHaveLength(0)
    })

    test('should use bcrypt with salt rounds of 10', async () => {
      await request(app)
        .post('/api/register')
        .send({
          username: 'bcryptuser',
          email: 'bcrypt@example.com',
          password: 'testpassword'
        })
        .expect(200)

      const user = await User.findOne({ username: 'bcryptuser' })

      // Bcrypt hashes start with $2b$ (or $2a$) followed by cost factor
      expect(user.passwordHash).toMatch(/^\$2[ab]\$10\$/)
    })
  })
})
