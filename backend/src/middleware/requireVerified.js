const Author = require('../models/Author')

// Write-action email-verification gate. Runs AFTER userExtractor (needs
// req.userId).
//
// OFF BY DEFAULT: enforcement only kicks in when REQUIRE_EMAIL_VERIFICATION is
// the string 'true'. This is deliberate — until transactional email is actually
// configured in production (RESEND_API_KEY set + domain verified), no user can
// receive a verification link, so hard-gating publishing would lock everyone
// out. Shipping the mechanism flag-off lets it be flipped on the moment email
// is live, with no code change. Until then this is a pass-through and the client
// shows a soft "verify your email" banner instead.
module.exports = async (req, res, next) => {
  if (process.env.REQUIRE_EMAIL_VERIFICATION !== 'true') {
    return next()
  }
  try {
    const author = await Author.findById(req.userId).select('emailVerified')
    // Only block accounts we can positively identify as unverified. Legacy
    // accounts not present in the Author collection can't be evaluated here, so
    // they pass (they predate verification).
    if (author && !author.emailVerified) {
      return res.status(403).json({
        error: 'Please verify your email address before publishing.',
        code: 'EMAIL_UNVERIFIED'
      })
    }
    return next()
  } catch (err) {
    // Fail open: a transient lookup error must not block publishing for everyone
    // while this soft, opt-in gate is enabled.
    console.error(err)
    return next()
  }
}
