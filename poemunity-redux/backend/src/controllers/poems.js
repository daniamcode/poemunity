const jwt = require('jsonwebtoken')
const poemsRouter = require('express').Router()
const Poem = require('../models/Poem')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')

poemsRouter.get('/', async (req, res) => {
  if(req.query.origin) {
    Poem.find({origin: req.query.origin}, (error, poems) => {
      if (error) {
        res.send(error)
      } else {
        res.json(poems)
      }
    })  
  } else {
    Poem.find((error, poems) => {
      if (error) {
        res.send(error)
      } else {
        res.json(poems)
      }
    })
  }
})

// create poem
poemsRouter.post('/', userExtractor, async (req, res) => {
  const poem = req.body
  const { userId } = req

  const adminId = process.env.NODE_ENV === 'development' 
  ? process.env.REACT_APP_ADMIN_PRE
  : process.env.REACT_APP_ADMIN

  const fakeUsers = [
    {id: 1, username: 'cathy2', name: 'Catherine Cawley', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/catherine-cawley.jpg'},
    {id: 2, username: 'StaceyCosgrove', name: 'Stacey Cosgrove', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/stacey-cosgrove.jpg'},
    {id: 3, username: 'sarahGR', name: 'Sarah Griffin', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/sarah-griffin.jpg'},
    {id: 4, username: 'rayson', name: 'Ray Higgins', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/ray-higgins.jpg'},
    {id: 5, username: 'typp', name: 'Ty Lue', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/ty-lue.jpg'},
    {id: 6, username: 'John Donne', name: 'John Donne', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/john-donne.jpg'},
    {id: 7, username: 'Walt Whitman', name: 'Walt Whitman', picture: 'https://poemunity.s3.us-east-2.amazonaws.com/user/walt-whitman.jpg'},
  ]

  const fakeUser = (poem.userId && userId === adminId) ? fakeUsers.find(user=>user.id === parseInt(poem.userId)) : null

  const user = await User.findById(userId)

  const newPoem = new Poem({
    ...poem,
    userId: (poem.userId && userId === adminId) ? poem.userId : user._id,
    author: (poem.userId && userId === adminId) ? fakeUser.username : user.username,
    picture: (poem.userId && userId === adminId) ? fakeUser.picture : user.picture,
  })
  try {
    const savedPoem = await newPoem.save()

    user.poems = user.poems.concat(savedPoem._id)
    await user.save()

    res.status(201)
    res.json(savedPoem)
  } catch {}
})

// add new property to all existing poems
poemsRouter.patch('/', async (req, res) => {
  const newProperty = req.body

  const response = await Poem.updateMany({$set: newProperty});

  if (response === null) {
    return res.status(404).json({
    error: 'error'
  })}
  console.log(newProperty)
  res.status(204).end()
})

module.exports = poemsRouter

