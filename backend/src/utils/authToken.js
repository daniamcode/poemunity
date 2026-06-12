const jwt = require('jsonwebtoken')

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

function getAdminId () {
  return process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN
}

function buildAuthorTokenPayload (author) {
  return {
    id: author._id,
    username: author.username,
    picture: author.picture,
    bio: author.bio || '',
    preferredGenres: author.preferredGenres || [],
    name: author.name || '',
    surname: author.surname || '',
    city: author.city || '',
    country: author.country || '',
    birthYear: author.birthYear || null,
    gender: author.gender || '',
    website: author.website || '',
    privateFields: author.privateFields || [],
    isAdmin: String(author._id) === getAdminId()
  }
}

function signAuthorToken (author) {
  return jwt.sign(
    buildAuthorTokenPayload(author),
    process.env.SECRET,
    { expiresIn: TOKEN_TTL_SECONDS }
  )
}

module.exports = {
  signAuthorToken
}
