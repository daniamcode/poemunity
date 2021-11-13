const bcrypt = require('bcrypt')
const registerRouter = require('express').Router()
const User = require('../models/User')

registerRouter.post('/', async (req, res) => {
  try {
    const passwordHash =  await bcrypt.hash(req.body.password, 10)
    const { username, email } = req.body
    const newUser = new User({
      username,
      email,
      passwordHash
    })
    const savedUser = await newUser.save()
    res.json(savedUser)
  } catch {
  }
})

module.exports = registerRouter