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

// Resolve the caller's author id from the Bearer header or the session cookie,
// or null when there is no usable session. Shared by the strict middleware below
// and by `.optional`, so both agree on what a valid session is.
async function resolveUserId (req) {
  const authorization = req.get('authorization') // express method to get this header
  const cookies = parseCookies(req.get('cookie'))
  let token = ''

  if (authorization && authorization.toLowerCase().startsWith('bearer')) {
    token = authorization.split(' ')[1] // token comes after the word bearer
  }

  if (!token && cookies.token) {
    token = cookies.token
  }

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
