const jwt = require('jsonwebtoken')

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7

function getAdminId () {
  return process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN
}

// The JWT (stored in the session cookie) must stay small — cookies cap at
// ~4KB, so it carries IDENTITY ONLY. Profile/display data (picture, bio,
// birthYear, …) is served from the DB via GET /users/profile, never the token.
function buildAuthorTokenPayload (author) {
  return {
    id: author._id,
    username: author.username,
    isAdmin: String(author._id) === getAdminId()
  }
}

// Full profile shape used by GET /users/profile (and PATCH responses) to
// hydrate the client's AppContext from the database.
function buildAuthorProfile (author) {
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
    isAdmin: String(author._id) === getAdminId(),
    // Drives the client's "verify your email" banner. Deliberately NOT in the
    // JWT payload — the token stays identity-only; verification state is read
    // fresh from the DB via this profile.
    emailVerified: author.emailVerified ?? false
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
  signAuthorToken,
  buildAuthorProfile,
  getAdminId
}
