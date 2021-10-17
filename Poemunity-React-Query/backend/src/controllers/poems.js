const jwt = require('jsonwebtoken')
const poemsRouter = require('express').Router()
const Poem = require('../models/Poem')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')

poemsRouter.get('/', async (req, res) => {
  console.log(req)
  Poem.find((error, poems) => {
    if (error) {
      res.send(error)
    } else {
      res.json(poems)
    }
  })
})

poemsRouter.post('/', userExtractor, async (req, res) => {
  const poem = req.body
  const { userId } = req

  const user = await User.findById(userId)

  const newPoem = new Poem({
    ...poem,
    userId: user._id,
    author: user.username
  })
  try {
    const savedPoem = await newPoem.save()

    user.poems = user.poems.concat(savedPoem._id)
    await user.save()

    res.status(201)
    res.json(savedPoem)
  } catch {}
})

module.exports = poemsRouter

