const jwt = require('jsonwebtoken')
const Poem = require('../models/Poem')

module.exports = async (req, res, next) => {
  try {
    const poem = await Poem.findById(req.params.poemId)
    if (!poem) {
      return res.status(404).json({
        error: 'poem not found'
      })
    }
    req.poem = poem
    next()
  } catch (error) {
    return res.status(404).json({
      error: 'poem not found'
    })
  }
}