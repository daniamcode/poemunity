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

module.exports = async (req, res, next) => {
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
      return res.status(401).json({ error: 'token missing or invalid' })
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
        return res.status(401).json({ error: 'token missing or invalid' })
      }
    }

    req.userId = userId

    next()
  } catch (error) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
}
