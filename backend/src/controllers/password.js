const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const passwordRouter = require('express').Router()
const Author = require('../models/Author')
const { sendEmail } = require('../utils/email')
const { resetPassword } = require('../utils/emailTemplates')

const PASSWORD_MIN = 8
const PASSWORD_MAX = 128
// Reset tokens are short-lived (30 min) and single-use.
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000
// Same collation as the Author unique indexes so the email lookup matches the
// DB's case-insensitive notion of the account (mirrors register/login).
const CI_COLLATION = { locale: 'en', strength: 2 }
// Fixed, generic response for /forgot regardless of whether the account exists.
// Never reveal account existence (anti-enumeration).
const GENERIC_FORGOT_MESSAGE =
  'If an account exists for that email, a reset link has been sent.'

// sha256 of the raw token. Only the hash is ever stored; the raw token lives
// only in the emailed link, so a DB leak cannot be turned into working links.
function hashToken (token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Mirrors register.js: 8–128 chars, at least one letter and one number, not
// all-whitespace. Returns an error message when unacceptable, else null.
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

// POST /api/v1/password/forgot — body { email }
// Always responds 200 with a fixed generic message, whether or not the account
// exists, so this endpoint never reveals which emails are registered.
passwordRouter.post('/forgot', async (req, res) => {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''

    if (email) {
      const author = await Author.findOne({ email, type: 'user' }).collation(CI_COLLATION)
      if (author) {
        const token = crypto.randomBytes(32).toString('hex')
        author.resetTokenHash = hashToken(token)
        author.resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS)
        await author.save()

        const link = `${process.env.FRONTEND_URL}/reset-password?token=${token}`
        await sendEmail({ to: author.email, ...resetPassword(link) })
      }
    }

    // Identical response on every path — found, not found, or blank input.
    return res.status(200).json({ message: GENERIC_FORGOT_MESSAGE })
  } catch (err) {
    console.error(err)
    // Even on error, stay generic so failures don't leak account existence.
    return res.status(200).json({ message: GENERIC_FORGOT_MESSAGE })
  }
})

// POST /api/v1/password/reset — body { token, password }
// Session invalidation: we stamp passwordChangedAt on the account, and the auth
// middleware (userExtractor) rejects any JWT issued before that instant. So a
// reset revokes every pre-existing session/cookie even though the JWTs are
// otherwise stateless. We also do NOT auto-login on reset: no token is issued,
// and the frontend redirects the user to /login with a success message.
passwordRouter.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body

    const passwordError = validatePassword(password)
    if (passwordError) {
      return res.status(400).json({ error: passwordError })
    }

    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
    }

    const author = await Author.findOne({
      resetTokenHash: hashToken(token),
      resetTokenExpiry: { $gt: new Date() }
    })

    if (!author) {
      return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
    }

    author.passwordHash = await bcrypt.hash(password, 10)
    // Revoke every session issued before now (see userExtractor).
    author.passwordChangedAt = new Date()
    // Single-use: clear the reset fields so the same link cannot be reused.
    author.resetTokenHash = undefined
    author.resetTokenExpiry = undefined
    await author.save()

    return res.status(200).json({ message: 'Your password has been reset. You can now log in.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not reset the password. Please try again.' })
  }
})

module.exports = passwordRouter
