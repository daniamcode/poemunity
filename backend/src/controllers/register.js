const bcrypt = require('bcryptjs')
const registerRouter = require('express').Router()
const Author = require('../models/Author')
const { slugifyAuthor } = require('../utils/slugUtils')

const USERNAME_MIN = 3
const USERNAME_MAX = 30
const PASSWORD_MIN = 8
const PASSWORD_MAX = 128
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Same collation as the unique indexes on Author so lookups match the DB's
// case-insensitive notion of "already taken".
const CI_COLLATION = { locale: 'en', strength: 2 }
// Neutral message for the email-conflict path. We deliberately do NOT confirm
// that the email is registered (anti-enumeration); see the header note in
// docs/EMAIL_AUTH_PLAN.md §10-G. code '2' is retained only so the client can
// highlight the email field.
const EMAIL_CONFLICT_MESSAGE =
  'We could not complete registration with these details. If you already have an account, try logging in or resetting your password.'

async function buildUniqueSlug (name) {
  const base = slugifyAuthor(name) || 'author'
  let slug = base
  let counter = 2
  while (await Author.exists({ slug })) {
    slug = `${base}-${counter++}`
  }
  return slug
}

// Returns an error message when the password is unacceptable, else null.
// Policy: 8–128 chars, at least one letter and one number, not all-whitespace.
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

// GET /api/v1/register/availability?username=&email=
// Public, debounced-friendly check so the client can warn before submit. Uses
// the same case-insensitive lookups as registration. Only the params that were
// provided appear in the response.
registerRouter.get('/availability', async (req, res) => {
  try {
    const username = typeof req.query.username === 'string' ? req.query.username.trim() : ''
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : ''

    const result = {}
    if (username) {
      const taken = await Author.findOne({ username }).collation(CI_COLLATION).select('_id')
      result.usernameAvailable = !taken
    }
    if (email) {
      const taken = await Author.findOne({ email }).collation(CI_COLLATION).select('_id')
      result.emailAvailable = !taken
    }
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Availability check failed' })
  }
})

registerRouter.post('/', async (req, res) => {
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : req.body.username
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : req.body.email
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : undefined
    const { password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required', code: '0' })
    }
    if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters', code: '0' })
    }
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'Invalid email format', code: '0' })
    }
    const passwordError = validatePassword(password)
    if (passwordError) {
      return res.status(400).json({ error: passwordError, code: '0' })
    }

    // Pre-check for friendly, field-specific feedback. The DB unique indexes
    // (caught below) remain the source of truth against the read-then-write
    // race — this check is best-effort UX, not the guarantee.
    const authorExists = await Author.findOne({ $or: [{ username }, { email }] }).collation(CI_COLLATION)
    if (authorExists) {
      if (authorExists.username && authorExists.username.toLowerCase() === username.toLowerCase()) {
        return res.status(409).send({ error: 'This username already exists. Please try with another one', code: '1' })
      }
      return res.status(409).send({ error: EMAIL_CONFLICT_MESSAGE, code: '2' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const slug = await buildUniqueSlug(name || username)

    const newAuthor = new Author({
      name: name || username,
      slug,
      username,
      email,
      passwordHash,
      picture: null,
      type: 'user',
      fake: false
    })

    try {
      const savedAuthor = await newAuthor.save()
      return res.json(savedAuthor)
    } catch (err) {
      // Lost the race: the unique index rejected a concurrent duplicate. Map
      // the raw E11000 to the same friendly 409 the pre-check returns instead
      // of leaking a generic 500.
      if (err && err.code === 11000) {
        const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : null
        if (field === 'email') {
          return res.status(409).send({ error: EMAIL_CONFLICT_MESSAGE, code: '2' })
        }
        // username or slug (both derived from the username) → treat as username taken
        return res.status(409).send({ error: 'This username already exists. Please try with another one', code: '1' })
      }
      throw err
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Registration failed' })
  }
})

module.exports = registerRouter
