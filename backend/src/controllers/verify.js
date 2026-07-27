const crypto = require('crypto')
const verifyRouter = require('express').Router()
const Author = require('../models/Author')
const userExtractor = require('../middleware/userExtractor')
const { sendEmail } = require('../utils/email')
const { verifyEmail } = require('../utils/emailTemplates')

// Verify links are longer-lived than reset links (24h): confirming an email is
// less sensitive than changing a password, and lower friction is preferable.
const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000
// Generic responses never reveal whether an account/email exists (mirrors the
// anti-enumeration stance of password.js).
const GENERIC_INVALID = 'This verification link is invalid or has expired.'
const GENERIC_RESEND =
  'If your email needs verifying, a new link has been sent.'

// sha256 of the raw token. Only the hash is stored; the raw token lives only in
// the emailed link, so a DB leak cannot be turned into working links. Mirrors
// password.js.
function hashToken (token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Generates a fresh verify token, stores its HASH + expiry on the author, and
// emails the raw token as a link. Shared by /resend and register.js.
async function issueVerifyToken (author) {
  const token = crypto.randomBytes(32).toString('hex')
  author.verifyTokenHash = hashToken(token)
  author.verifyTokenExpiry = new Date(Date.now() + VERIFY_TOKEN_TTL_MS)
  await author.save()

  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`
  await sendEmail({ to: author.email, ...verifyEmail(link) })
}

// POST /api/v1/verify/confirm — body { token }
// Marks the matching account verified and clears the token (single-use). Always
// returns a generic error for a bad/expired token so it cannot be used to probe
// which tokens (or accounts) exist.
verifyRouter.post('/confirm', async (req, res) => {
  try {
    const { token } = req.body

    if (typeof token !== 'string' || !token) {
      return res.status(400).json({ error: GENERIC_INVALID })
    }

    const author = await Author.findOne({
      verifyTokenHash: hashToken(token),
      verifyTokenExpiry: { $gt: new Date() }
    })

    if (!author) {
      return res.status(400).json({ error: GENERIC_INVALID })
    }

    author.emailVerified = true
    // Single-use: clear the fields so the same link cannot be replayed.
    author.verifyTokenHash = undefined
    author.verifyTokenExpiry = undefined
    await author.save()

    return res.status(200).json({ message: 'Your email has been verified. You can now log in.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Could not verify the email. Please try again.' })
  }
})

// POST /api/v1/verify/resend — authenticated (cookie/bearer)
// Re-sends a verification link for the CURRENT user if they are still
// unverified. Responds generically in every case (already verified, unknown, or
// resent) so it reveals nothing beyond "your request was accepted".
verifyRouter.post('/resend', userExtractor, async (req, res) => {
  try {
    const author = await Author.findById(req.userId)
    if (author && author.email && !author.emailVerified) {
      await issueVerifyToken(author)
    }
    return res.status(200).json({ message: GENERIC_RESEND })
  } catch (err) {
    console.error(err)
    // Stay generic even on failure so nothing about the account leaks.
    return res.status(200).json({ message: GENERIC_RESEND })
  }
})

module.exports = verifyRouter
module.exports.issueVerifyToken = issueVerifyToken
