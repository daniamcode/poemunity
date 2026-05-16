const mongoose = require('mongoose')
const poemRouter = require('express').Router()
const Poem = require('../models/Poem')
const findPoemById = require('../middleware/findPoemById')
const userExtractor = require('../middleware/userExtractor')

const AUTHOR_FIELDS = 'name slug picture username'

poemRouter.get('/:poemId', async (req, res) => {
  try {
    const { poemId } = req.params
    let poem

    if (mongoose.Types.ObjectId.isValid(poemId)) {
      poem = await Poem.findById(poemId).populate('authorId', AUTHOR_FIELDS)
    }

    if (!poem) {
      poem = await Poem.findOne({ slug: poemId }).populate('authorId', AUTHOR_FIELDS)
    }

    if (!poem) {
      return res.status(404).json({ error: 'poem not found' })
    }
    return res.json(poem)
  } catch (error) {
    return res.status(404).json({ error: 'poem not found' })
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
  const { poem } = req

  try {
    const updated = await Poem.findByIdAndUpdate(
      poem._id,
      { $set: req.body },
      { new: true, strict: false }
    ).populate('authorId', AUTHOR_FIELDS)

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update poem' })
  }
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