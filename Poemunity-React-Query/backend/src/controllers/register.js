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
      passwordHash,
      picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/default-profile-icon.jpg'
    })
    const userExists = await User.findOne(
    {
     $or: [
            { username },
            { email }
          ]
    })
    if(userExists) {
      if(userExists.username === username) {
        res.status(401).send({error: 'This username already exists. Please try with another one', code: '1'})
      } else if(userExists.email === email) {
        res.status(401).send({error: 'This email already exists. Please try with another one', code: '2'})
      } else {
        res.status(401).send({error: 'This is an unknown error', code: '3'})
      }
    } else {
      const savedUser = await newUser.save()
      res.json(savedUser)
    }
  } catch {
  }
})

module.exports = registerRouter