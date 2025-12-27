const jwt = require('jsonwebtoken')
const poemRouter = require('express').Router()
const Poem = require('../models/Poem')
const findPoemById = require('../middleware/findPoemById')
const userExtractor = require('../middleware/userExtractor')

poemRouter.get('/:poemId', async (req, res) => {
  try {
    const poem = await Poem.findById(req.params.poemId)
    if (!poem) {
      return res.status(404).json({
        error: 'poem not found'
      })
    }
    return res.json(poem)
  } catch (error) {
    return res.status(404).json({
      error: 'poem not found'
    })
  }
})

//like poem
poemRouter.put('/:poemId', userExtractor, findPoemById, async (req, res) => {
  const { poem } = req
  if (poem.likes.some((id) => id == req.userId)) {
    poem.likes.splice(poem.likes.indexOf(req.userId), 1)
  } else {
    poem.likes.push(req.userId)
  }

  poem.save((error) => {
    if (error) {
      res.send(error)
    } else {
      res.json(poem)
    }
  })
})

// modify poem
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

  try {
    const response = await Poem.findByIdAndDelete(poemId)
    if (response === null) {
      return res.status(404).json({
        error: 'poem not found or not deleted'
      })
    }

    res.status(204).end()
  } catch (error) {
    return res.status(404).json({
      error: 'poem not found or not deleted'
    })
  }
})

module.exports = poemRouter 