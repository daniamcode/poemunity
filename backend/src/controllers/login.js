const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const Author = require('../models/Author')
const { signAuthorToken } = require('../utils/authToken')

// Same collation as the Author unique indexes so login matches username/email
// case-insensitively (users forget the exact casing they registered with).
const CI_COLLATION = { locale: 'en', strength: 2 }
// A real bcrypt hash of a random string. When no account matches we still run a
// bcrypt.compare against this so an unknown user costs the same time as a wrong
// password — closing the timing side-channel that would otherwise reveal which
// accounts exist.
const DUMMY_HASH = '$2a$10$I0OhNV4eEkBeOevhauFydOdG2HkylDK7..Lq.KUmx/M3Ru3cOZPVm'
// Identical response for every failure mode (unknown user / wrong password /
// missing input) so login never reveals whether an account exists.
const INVALID_CREDENTIALS = { error: 'invalid user or password' }

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body
  const identifier = typeof username === 'string' ? username.trim() : ''

  const author = identifier
    ? await Author.findOne({ $or: [{ username: identifier }, { email: identifier }] }).collation(CI_COLLATION)
    : null

  // Always run a compare (against a dummy hash when the user is unknown) to keep
  // the timing constant regardless of whether the account exists.
  const hash = (author && author.passwordHash) || DUMMY_HASH
  const passwordCorrect = typeof password === 'string'
    ? await bcrypt.compare(password, hash)
    : false

  if (!author || !author.passwordHash || !passwordCorrect) {
    return response.status(401).json(INVALID_CREDENTIALS)
  }

  response.send(signAuthorToken(author))
})

module.exports = loginRouter
