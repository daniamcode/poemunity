const bcrypt = require('bcryptjs')
const adminRouter = require('express').Router()
const Author = require('../models/Author')
const userExtractor = require('../middleware/userExtractor')
const isAdmin = require('../middleware/isAdmin')
const { slugifyAuthor } = require('../utils/slugUtils')

const PASSWORD_MIN = 8
const PASSWORD_MAX = 128

async function buildUniqueSlug (name) {
  const base = slugifyAuthor(name) || 'author'
  let slug = base
  let counter = 2
  while (await Author.exists({ slug })) {
    slug = `${base}-${counter++}`
  }
  return slug
}

// Same policy as register.js: 8–128 chars, at least one letter and one number.
function validatePassword (password) {
  if (typeof password !== 'string' || password.length < PASSWORD_MIN) {
    return 'Password must be at least 8 characters'
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be at most ${PASSWORD_MAX} characters`
  }
  if (!password.trim()) {
    return 'Password cannot be blank'
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number'
  }
  return null
}

// POST /api/v1/admin/test-users — admin only
// Creates a pre-verified, disposable test account for exercising app features.
// testAccount:true means the unique-email index does NOT apply (see Author.js),
// so many test users can share ONE inbox — handy for testing verify/reset flows
// against a single mailbox. These accounts are hidden from public rankings and
// author listings.
adminRouter.post('/test-users', userExtractor, isAdmin, async (req, res) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : ''
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : undefined
    const { password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }
    const passwordError = validatePassword(password)
    if (passwordError) {
      return res.status(400).json({ error: passwordError })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const slug = await buildUniqueSlug(username)

    const testUser = new Author({
      name: username,
      slug,
      username,
      email,
      passwordHash,
      picture: null,
      type: 'user',
      fake: false,
      emailVerified: true,
      testAccount: true
    })

    const saved = await testUser.save()
    return res.status(201).json(saved)
  } catch (err) {
    // A duplicate USERNAME (or slug) can still collide — those stay unique even
    // for test accounts. Email is intentionally exempt.
    if (err && err.code === 11000) {
      return res.status(409).json({ error: 'This username already exists. Please try with another one' })
    }
    console.error(err)
    return res.status(500).json({ error: 'Failed to create test user' })
  }
})

module.exports = adminRouter
