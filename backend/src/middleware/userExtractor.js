const jwt = require('jsonwebtoken')
const Author = require('../models/Author')

function parseCookies (cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map(cookie => cookie.trim())
    .filter(Boolean)
    .reduce((cookies, cookie) => {
      const separatorIndex = cookie.indexOf('=')
      if (separatorIndex === -1) return cookies

      const name = cookie.slice(0, separatorIndex)
      const value = cookie.slice(separatorIndex + 1)
      try {
        cookies[name] = decodeURIComponent(value)
      } catch {
        cookies[name] = value
      }
      return cookies
    }, {})
}

// The raw session token on a request — Bearer header first, then the session
// cookie. Shared by the resolver below and by peekUserId, so the two can never
// disagree about what a session looks like.
function extractToken (req) {
  const authorization = req.get('authorization') // express method to get this header

  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    const bearer = authorization.split(' ')[1] // token comes after the word bearer
    if (bearer) return bearer
  }

  const cookies = parseCookies(req.get('cookie'))
  return cookies.token || ''
}

// Resolve the caller's author id from the Bearer header or the session cookie,
// or null when there is no usable session. Shared by the strict middleware below
// and by `.optional`, so both agree on what a valid session is.
async function resolveUserId (req) {
  const token = extractToken(req)

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!token || !decodedToken.id) {
      return null
    }

    const { id: userId } = decodedToken

    // Session revocation: reject tokens issued before the account's last
    // password change (set on password reset). iat is in seconds; compare on the
    // same granularity, so a token issued in the same second as the change is
    // treated as still valid (sub-second tolerance — reset does not auto-login,
    // so a fresh login always comes seconds later). Legacy User accounts are not
    // in the Author collection and never carry passwordChangedAt, so they pass.
    const author = await Author.findById(userId).select('passwordChangedAt')
    if (author && author.passwordChangedAt) {
      const changedAtSec = Math.floor(author.passwordChangedAt.getTime() / 1000)
      if (typeof decodedToken.iat === 'number' && decodedToken.iat < changedAtSec) {
        return null
      }
    }

    return userId
  } catch (error) {
    return null
  }
}

module.exports = async (req, res, next) => {
  const userId = await resolveUserId(req)
  if (!userId) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  req.userId = userId
  next()
}

// Same resolution, no gate: sets req.userId when a session is present and
// carries on when it is not. For routes that are public but answer differently
// for the owner — a draft is a 404 to everyone else (see poemVisibility).
module.exports.optional = async (req, res, next) => {
  req.userId = await resolveUserId(req)
  next()
}

// Identify the caller from the session token ALONE: signature check only, no
// database round-trip, synchronous.
//
// The rate limiters need this rather than `req.userId`, for two reasons. Their
// keyGenerator runs BEFORE the routers — which is where userExtractor lives —
// so req.userId is not set yet when the key is built. And a keyGenerator must
// stay synchronous and cheap: it runs inline on every request, so querying the
// database just to build a key would cost more than the limit it serves.
//
// Deliberately skips the passwordChangedAt revocation check. A revoked token
// still names the SAME account, and a rate limit only needs the name — not a
// session that is currently valid. Anything requiring the session to be current
// must keep going through userExtractor.
//
// Returns null when there is no usable session, which is the caller's signal
// to fall back to the client address.
function peekUserId (req) {
  try {
    const token = extractToken(req)
    if (!token) return null

    const decoded = jwt.verify(token, process.env.SECRET)
    return decoded && decoded.id ? decoded.id : null
  } catch (error) {
    return null
  }
}

module.exports.peekUserId = peekUserId
