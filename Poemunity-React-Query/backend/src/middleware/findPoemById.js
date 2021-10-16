const jwt = require('jsonwebtoken')
const Poem = require('../models/Poem')

module.exports = (req, res, next) => {
  Poem.findById(req.params.poemId, (error, poem) => {
    if (error) {
      res.send(error)
    }
    if (poem) {
      req.poem = poem
      return next()
    }

    res.sendStatus(404)
  })
}