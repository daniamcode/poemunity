const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/', async (request, response) => {
  const { body } = request
  const { username, password } = body

  let user = await User.findOne({ username })

  let passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)
    
  if (!(user && passwordCorrect)) {
    response.status(401).json({
    error: 'invalid user or password'})
  } else {
    const userForToken = {
      id: user._id,
      username: user.username,
      picture: user.picture
    }
  
    const token = jwt.sign(
      userForToken,
      process.env.SECRET,
      {
        expiresIn: 60 * 60 * 24 * 7
      }
    )
  
    response.send(token)
  }
})

module.exports = loginRouter