const commentsRouter = require('express').Router()
const Comment = require('../models/Comment')
const userExtractor = require('../middleware/userExtractor')

const AUTHOR_FIELDS = 'name slug picture'

const getAdminId = () =>
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

// GET /api/v1/comments?targetType=poem&targetId=xxx
// GET /api/v1/comments?since=<ISO timestamp>  (simulation script use)
commentsRouter.get('/', async (req, res) => {
  const { targetType, targetId, since } = req.query
  try {
    const filter = {}
    if (targetType) filter.targetType = targetType
    if (targetId) filter.targetId = targetId
    if (since) filter.createdAt = { $gt: new Date(since) }

    if (!targetType && !targetId && !since) {
      return res.status(400).json({ error: 'Provide targetType+targetId or since' })
    }

    const comments = await Comment.find(filter)
      .populate('authorId', AUTHOR_FIELDS)
      .sort({ createdAt: 1 })
    res.json(comments)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// POST /api/v1/comments
commentsRouter.post('/', userExtractor, async (req, res) => {
  const { targetType, targetId, body, parentId } = req.body
  if (!targetType || !targetId || !body?.trim()) {
    return res.status(400).json({ error: 'targetType, targetId, and body are required' })
  }
  try {
    const comment = new Comment({
      targetType,
      targetId,
      authorId: req.userId,
      body: body.trim(),
      parentId: parentId || null
    })
    await comment.save()
    await comment.populate('authorId', AUTHOR_FIELDS)
    res.status(201).json(comment)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: 'Failed to create comment' })
  }
})

// PATCH /api/v1/comments/:commentId  (owner only)
commentsRouter.patch('/:commentId', userExtractor, async (req, res) => {
  const { body } = req.body
  if (!body?.trim()) {
    return res.status(400).json({ error: 'body is required' })
  }
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })
    if (String(comment.authorId) !== req.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    comment.body = body.trim()
    await comment.save()
    await comment.populate('authorId', AUTHOR_FIELDS)
    res.json(comment)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update comment' })
  }
})

// DELETE /api/v1/comments/:commentId  (owner or admin)
commentsRouter.delete('/:commentId', userExtractor, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) return res.status(404).json({ error: 'Comment not found' })
    const isOwner = String(comment.authorId) === req.userId
    const isAdmin = req.userId === getAdminId()
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    await Comment.findByIdAndDelete(comment._id)
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

module.exports = commentsRouter
