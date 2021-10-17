const jwt = require('jsonwebtoken')
const Poem = require('../models/Poem')

module.exports = (req, res, next) => {
  Poem.findById(req.params.poemId, (error, poem) => {
    if (error) {
      return res.status(404).json({
        error: 'poem not found'
    })}
    if (poem) {
      req.poem = poem
      return next()
    }

    res.sendStatus(404)
  })
}