const jwt = require('jsonwebtoken')
const poemRouter = require('express').Router()
const Poem = require('../models/Poem')
const findPoemById = require('../middleware/findPoemById')
const userExtractor = require('../middleware/userExtractor')

poemRouter.get('/:poemId', async (req, res) => {
  Poem.findById(req.params.poemId, (error, poem) => {
    if (error) {
      return res.status(404).json({
        error: 'poem not found'
    })}
    if (poem) {
      return res.json(poem)
    }
  })
})

// poemRouter.put('/:poemId', userExtractor, findPoemById, async (req, res) => {
//   const { poem } = req
//   if (poem.likes.some((id) => id === req.body.userId)) {
//     poem.likes.splice(poem.likes.indexOf(req.body.userId), 1)
//   } else {
//     poem.likes.push(req.body.userId)
//   }

//   poem.save((error) => {
//     if (error) {
//       res.send(error)
//     } else {
//       res.json(poem)
//     }
//   })
// })
    
poemRouter.patch('/:poemId', userExtractor, findPoemById, async (req, res) => {
  const { poem } = req;

  Object.entries(req.body).forEach((item) => {
    const key = item[0];
    const value = item[1];
    poem[key] = value;
  });
  poem.save((error) => {
    if (error) {
      res.send(error);
    }
    res.json(poem);
  });
})

poemRouter.delete('/:poemId', userExtractor, async (req, res) => {
  const { poemId } = req.params
  
  const response = await Poem.findByIdAndDelete(poemId)
  if (response === null) return res.sendStatus(404)

  res.status(204).end()
})

module.exports = poemRouter