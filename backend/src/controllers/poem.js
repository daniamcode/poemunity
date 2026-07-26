const mongoose = require('mongoose')
const poemRouter = require('express').Router()
const Poem = require('../models/Poem')
const findPoemById = require('../middleware/findPoemById')
const userExtractor = require('../middleware/userExtractor')
const { computeRanking } = require('../utils/ranking')

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

// like poem
poemRouter.put('/:poemId', userExtractor, findPoemById, async (req, res) => {
  const { poem } = req
  if (poem.likes.some((id) => id == req.userId)) {
    poem.likes.splice(poem.likes.indexOf(req.userId), 1)
  } else {
    poem.likes.push(req.userId)
  }

  try {
    await poem.save()
    // Embed the recomputed ranking so the client refreshes the sidebar in the same
    // request — a like changes the poem author's points. Matches the sidebar's
    // origin:'user' view (see GET /ranking).
    const ranking = await computeRanking({ origin: 'user' })
    res.json({ ...poem.toJSON(), ranking })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update poem' })
  }
})

const isOwnerOrAdmin = (req, res, next) => {
  const { poem, userId } = req
  const adminId = process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

  if (String(poem.authorId) !== userId && userId !== adminId) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

const ALLOWED_PATCH_FIELDS = ['poem', 'title', 'genre', 'date', 'likes', 'origin', 'userId']

// modify poem
poemRouter.patch('/:poemId', userExtractor, findPoemById, isOwnerOrAdmin, async (req, res) => {
  const doc = req.poem

  const update = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => ALLOWED_PATCH_FIELDS.includes(key))
  )

  try {
    const updated = await Poem.findByIdAndUpdate(
      doc._id,
      { $set: update },
      { new: true }
    ).populate('authorId', AUTHOR_FIELDS)

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update poem' })
  }
})

poemRouter.delete('/:poemId', userExtractor, findPoemById, isOwnerOrAdmin, async (req, res) => {
  const { poem } = req

  try {
    const response = await Poem.findByIdAndDelete(poem._id)
    if (response === null) {
      return res.status(404).json({
        error: 'poem not found or not deleted'
      })
    }

    // Return the recomputed ranking (the author lost this poem's points) so the
    // client refreshes the sidebar without a second call. This replaces the old
    // 204 No Content. Matches the sidebar's origin:'user' view (see GET /ranking).
    const ranking = await computeRanking({ origin: 'user' })
    res.json({ ranking })
  } catch (error) {
    return res.status(404).json({
      error: 'poem not found or not deleted'
    })
  }
})

module.exports = poemRouter
