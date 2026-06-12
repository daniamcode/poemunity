const jwt = require('jsonwebtoken')

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

module.exports = (req, res, next) => {
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

    req.userId = userId

    next()
  } catch (error) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
}
