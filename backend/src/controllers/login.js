const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const loginRouter = require('express').Router()
const Author = require('../models/Author')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const author = await Author.findOne({ username })
  const passwordCorrect = author === null
    ? false
    : await bcrypt.compare(password, author.passwordHash)

  if (!(author && passwordCorrect)) {
    return response.status(401).json({ error: 'invalid user or password' })
  }

  const token = jwt.sign(
    { id: author._id, username: author.username, picture: author.picture },
    process.env.SECRET,
    { expiresIn: 60 * 60 * 24 * 7 }
  )

  response.send(token)
})

module.exports = loginRouter
