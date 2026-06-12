const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const Author = require('../models/Author')
const { signAuthorToken } = require('../utils/authToken')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const author = await Author.findOne({ username })
  const passwordCorrect = author === null
    ? false
    : await bcrypt.compare(password, author.passwordHash)

  if (!(author && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid user or password' })
  }

  response.send(signAuthorToken(author))
})

module.exports = loginRouter
