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
    {id: 1, username: 'cathy2', name: 'Catherine Cawley', picture: 'https://cdn.getyourguide.com/img/location/5c88db055a755.jpeg/88.jpg'},
    {id: 2, username: 'StaceyCosgrove', name: 'Stacey Cosgrove', picture: 'https://media-cdn.tripadvisor.com/media/photo-s/05/62/06/0e/restaurant-els-valencians.jpg'},
    {id: 3, username: 'sarahGR', name: 'Sarah Griffin', picture: 'https://cdn.pixabay.com/photo/2017/11/09/17/11/sea-2934076_960_720.jpg'},
    {id: 4, username: 'rayson', name: 'Ray Higgins', picture: 'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/old-books-arranged-on-shelf-royalty-free-image-1572384534.jpg'},
    {id: 5, username: 'typp', name: 'Ty Lue', picture: 'https://volcanodiscovery.de/uploads/tx_tplink/sakurajima_j02376m.jpg'},
    {id: 6, username: 'John Donne', name: 'John Donne', picture: 'https://lh3.googleusercontent.com/-ieCqz9txEts/YOfrlyPMShI/AAAAAAAADfw/agqHfV63mu0rehEcd7mPZBnNJg8V3hlhwCLcBGAsYHQ/image.png'},
    {id: 7, username: 'Walt Whitman', name: 'Walt Whitman', picture: 'https://static1.abc.es/media/cultura/2018/09/01/walt-whitman-personal-trainer-U30920346632mrF-U301308396057toD-620x650@abc.jpg'},
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

