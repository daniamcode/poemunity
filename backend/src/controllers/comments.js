const mongoose = require('mongoose')
const commentsRouter = require('express').Router()
const Comment = require('../models/Comment')
const Poem = require('../models/Poem')
const userExtractor = require('../middleware/userExtractor')
const requireVerified = require('../middleware/requireVerified')
const { isDraft, PUBLISHED_MATCH } = require('../utils/poemVisibility')
const Author = require('../models/Author')
const { notify, NOTIFICATION_TYPE } = require('../utils/notifications')

// `type` rides along so the UI can mark AI-authored comments as such.
const AUTHOR_FIELDS = 'name slug picture type'

const getAdminId = () =>
  process.env.NODE_ENV === 'development'
    ? process.env.REACT_APP_ADMIN_PRE
    : process.env.REACT_APP_ADMIN

const MY_COMMENTS_DEFAULT_LIMIT = 10
const MY_COMMENTS_MAX_LIMIT = 50

// GET /api/v1/comments/mine — the profile's "My comments" tab.
//
// Declared before any parameterised route so the literal path wins the match.
//
// Scoped by `req.userId`, never by a query parameter. Comments are public
// content, so this is not hiding anything — but "my comments" scoped by
// something the client names is the shape of a list that later becomes
// "anyone's comments" by accident.
//
// WHY THE TARGETS ARE RESOLVED BY HAND. `targetId` is a bare ObjectId with no
// `ref`, because `targetType` decides which collection it points at — so
// `.populate()` cannot follow it. Two extra queries, one per collection,
// batched by id: not one per comment.
//
// A comment whose target is GONE OR NO LONGER PUBLIC is dropped rather than
// listed. Its poem may have been deleted or withdrawn to a draft, and a row
// linking to a 404 is worse than no row — the same reason `PUBLISHED_MATCH`
// composes into every other public read.
commentsRouter.get('/mine', userExtractor, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || MY_COMMENTS_DEFAULT_LIMIT, MY_COMMENTS_MAX_LIMIT)

    // One row more than the page answers "is there another page" without a
    // second countDocuments — same trade as the notifications list.
    const rows = await Comment.find({ authorId: req.userId })
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit + 1)

    const hasMore = rows.length > limit
    const page_ = hasMore ? rows.slice(0, limit) : rows

    const poemIds = page_.filter(c => c.targetType === 'poem').map(c => c.targetId)
    const authorIds = page_.filter(c => c.targetType === 'profile').map(c => c.targetId)

    const [poems, authors] = await Promise.all([
      poemIds.length
        ? Poem.find({ _id: { $in: poemIds }, ...PUBLISHED_MATCH })
            .select('title slug authorId')
            .populate('authorId', 'name username slug')
        : [],
      authorIds.length
        ? Author.find({ _id: { $in: authorIds } }).select('name username slug')
        : []
    ])

    const poemById = new Map(poems.map(p => [String(p._id), p]))
    const authorById = new Map(authors.map(a => [String(a._id), a]))

    const comments = page_
      .map(comment => {
        const key = String(comment.targetId)
        if (comment.targetType === 'poem') {
          const poem = poemById.get(key)
          if (!poem) return null
          return {
            id: String(comment._id),
            body: comment.body,
            createdAt: comment.createdAt,
            targetType: 'poem',
            poem: {
              id: String(poem._id),
              title: poem.title,
              slug: poem.slug,
              author: poem.authorId
                ? {
                    name: poem.authorId.name || poem.authorId.username,
                    slug: poem.authorId.slug
                  }
                : null
            }
          }
        }

        const author = authorById.get(key)
        if (!author) return null
        return {
          id: String(comment._id),
          body: comment.body,
          createdAt: comment.createdAt,
          targetType: 'profile',
          author: {
            name: author.name || author.username,
            slug: author.slug
          }
        }
      })
      .filter(Boolean)

    res.json({ comments, page, limit, hasMore })
  } catch (error) {
    console.error('My comments error:', error)
    res.status(500).json({ error: 'Failed to load comments' })
  }
})

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
commentsRouter.post('/', userExtractor, requireVerified, async (req, res) => {
  const { targetType, targetId, body, parentId } = req.body
  if (!targetType || !targetId || !body?.trim()) {
    return res.status(400).json({ error: 'targetType, targetId, and body are required' })
  }
  try {
    // A draft has no public thread, so it cannot be commented on — not even by
    // its author, whose comment would surface the moment it is published. Only
    // an existing DRAFT is rejected: `targetId` is not constrained to poems that
    // exist (profile comments share this route), so a missing poem is left alone.
    if (targetType === 'poem' && mongoose.Types.ObjectId.isValid(targetId)) {
      const target = await Poem.findById(targetId).select('status')
      if (isDraft(target)) {
        return res.status(404).json({ error: 'Poem not found' })
      }
    }

    const comment = new Comment({
      targetType,
      targetId,
      authorId: req.userId,
      body: body.trim(),
      parentId: parentId || null
    })
    await comment.save()
    await comment.populate('authorId', AUTHOR_FIELDS)

    // Both kinds of comment notify, but they are DIFFERENT events with
    // different recipients: a poem comment goes to the poem's author, a profile
    // comment to the author whose page it is.
    //
    // Profile comments notified nobody until 2026-08-04. `targetId` is an
    // author id, not a poem id, so looking it up as a poem found nothing — the
    // event was dropped rather than misrouted, which was right, but the "tell
    // them properly later" half never happened. Somebody wrote on your profile
    // and you never learned. Reported from the live site.
    if (mongoose.Types.ObjectId.isValid(targetId)) {
      if (targetType === 'poem') {
        const poem = await Poem.findById(targetId).select('authorId')
        if (poem) {
          await notify({
            recipientId: poem.authorId,
            actorId: req.userId,
            type: NOTIFICATION_TYPE.COMMENT,
            poemId: poem._id
          })
        }
      } else if (targetType === 'profile') {
        // The target IS the recipient: a profile comment is addressed to the
        // author whose page it is on. It carries no `poemId`, which is also
        // what makes profile comments collapse with each other and never with
        // a poem event — the same shape as a follow.
        //
        // `exists` rather than a full read: nothing about the author is needed
        // beyond "is this a real one", and notify() loads their preferences
        // itself.
        const target = await Author.exists({ _id: targetId })
        if (target) {
          await notify({
            recipientId: targetId,
            actorId: req.userId,
            type: NOTIFICATION_TYPE.PROFILE_COMMENT
          })
        }
      }
    }

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
