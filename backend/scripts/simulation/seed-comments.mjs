import Comment from '../../src/models/Comment.js'
import { generate } from './ai/claude.mjs'
import { activityProfileFor, canReply } from './profiles.mjs'
import {
  authorDisplayName,
  cleanGeneratedText,
  commentDateForPoem,
  formatPoemTitle,
  genreMatches,
  logAction,
  replyDateForComment,
  shuffle
} from './utils.mjs'

function poemAuthorId (poem) {
  return String(poem.authorId?._id || poem.authorId || poem.userId || '')
}

function commentTargetId (comment) {
  return String(comment.targetId?._id || comment.targetId)
}

function commentAuthorName (comment, authorsById) {
  const author = authorsById.get(String(comment.authorId?._id || comment.authorId))
  return author ? authorDisplayName(author) : 'Someone'
}

function desiredCommentCount (rank) {
  if (rank < 15) return 3 + Math.floor(Math.random() * 3)
  if (rank < 40) return 1 + Math.floor(Math.random() * 3)
  return 1
}

function chooseCommentAuthor (authors, poem, alreadyPicked) {
  const eligible = shuffle(authors.filter(author => {
    if (String(author._id) === poemAuthorId(poem)) return false
    if (alreadyPicked.has(String(author._id))) return false
    return true
  }))

  const candidates = eligible.filter(author => {
    const profile = activityProfileFor(author)
    if (Math.random() > profile.commentProbability) return false
    return genreMatches(author, poem) || Math.random() < 0.15
  })

  const matchingFallback = eligible.find(author => genreMatches(author, poem))
  return candidates[0] || matchingFallback || eligible[0] || null
}

function buildPoemCommentPrompt (author, poem, existingComments) {
  const profile = activityProfileFor(author)
  const systemPrompt = [
    `You are ${authorDisplayName(author)}.`,
    author.bio || '',
    `Your comment style: ${profile.style}.`,
    'You are leaving a comment on a poem you just read.',
    'React authentically and reference something specific in the poem.',
    'Do not start with "I" or "This poem". Vary your opening.',
    'Return only the comment text.'
  ].filter(Boolean).join('\n')

  const commentsText = existingComments.length
    ? `Others have already commented:\n${existingComments.map(comment => `- ${comment.authorName || 'Someone'}: "${comment.body}"`).join('\n')}\n\nWrite your own distinct reaction.`
    : 'Write your comment.'

  const userPrompt = `Poem title: "${poem.title || 'Untitled'}"\n\n${poem.poem}\n\n${commentsText}`
  return { systemPrompt, userPrompt }
}

function buildReplyPrompt (author, poem, parentComment, parentAuthorName) {
  const systemPrompt = [
    `You are ${authorDisplayName(author)}.`,
    author.bio || '',
    'You are replying to someone\'s comment on a poem.',
    'Keep it short: 1 to 2 sentences.',
    'You may agree, push back gently, or add something they missed.',
    'Sound like a real person, not a reviewer.',
    'Return only the reply text.'
  ].filter(Boolean).join('\n')

  const userPrompt = `Poem: "${poem.title || 'Untitled'}"\n${poem.poem}\n\n${parentAuthorName} commented: "${parentComment.body}"\n\nWrite your reply.`
  return { systemPrompt, userPrompt }
}

async function createComment (data, context) {
  if (context.dryRun) {
    return {
      ...data,
      _id: `dry-${Math.random().toString(36).slice(2)}`,
      id: `dry-${Math.random().toString(36).slice(2)}`
    }
  }

  const existing = await Comment.findOne({
    targetType: data.targetType,
    targetId: data.targetId,
    authorId: data.authorId,
    parentId: data.parentId || null,
    simulationRunId: context.runId,
    simulationKind: data.simulationKind
  })

  if (existing) return existing
  return Comment.create(data)
}

export async function seedComments (authors, poems, context) {
  const authorsById = new Map(authors.map(author => [String(author._id), author]))
  const topPoems = [...poems]
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 60)

  let createdTopLevel = 0
  let createdReplies = 0
  const insertedTopLevel = []

  for (const [rank, poem] of topPoems.entries()) {
    const targetCount = desiredCommentCount(rank)
    const alreadyPicked = new Set()
    const existingComments = await Comment.find({ targetType: 'poem', targetId: poem._id })
      .sort({ createdAt: 1 })
      .lean()

    const promptComments = existingComments.map(comment => ({
      authorName: commentAuthorName(comment, authorsById),
      body: comment.body
    }))

    for (let i = 0; i < targetCount; i += 1) {
      const author = chooseCommentAuthor(authors, poem, alreadyPicked)
      if (!author) continue
      alreadyPicked.add(String(author._id))

      const { systemPrompt, userPrompt } = buildPoemCommentPrompt(author, poem, promptComments)
      const generated = await generate(systemPrompt, userPrompt, {
        task: 'comment',
        dryRun: context.dryRun,
        callAi: context.callAi
      })
      const body = cleanGeneratedText(generated)
      if (!body) continue

      const createdAt = commentDateForPoem(poem.date)
      const comment = await createComment({
        targetType: 'poem',
        targetId: poem._id,
        authorId: author._id,
        body,
        parentId: null,
        createdAt,
        updatedAt: createdAt,
        simulationRunId: context.runId,
        simulationKind: 'seed-poem-comment'
      }, context)

      insertedTopLevel.push(comment)
      promptComments.push({ authorName: authorDisplayName(author), body })
      createdTopLevel += 1
      logAction(context, `${context.dryRun ? 'dry-commented' : 'commented'}: ${formatPoemTitle(poem)} <- ${authorDisplayName(author)}`)
    }
  }

  const commentsByPoem = new Map(topPoems.map(poem => [String(poem._id), poem]))

  for (const parentComment of insertedTopLevel) {
    if (Math.random() > 0.35) continue
    const poem = commentsByPoem.get(commentTargetId(parentComment))
    if (!poem) continue

    const candidates = shuffle(authors.filter(author => {
      if (String(author._id) === String(parentComment.authorId)) return false
      if (!canReply(author)) return false
      return genreMatches(author, poem) || Math.random() < 0.15
    }))
    const replyAuthor = candidates[0]
    if (!replyAuthor) continue

    const parentAuthorName = commentAuthorName(parentComment, authorsById)
    const { systemPrompt, userPrompt } = buildReplyPrompt(replyAuthor, poem, parentComment, parentAuthorName)
    const generated = await generate(systemPrompt, userPrompt, {
      task: 'reply',
      dryRun: context.dryRun,
      callAi: context.callAi
    })
    const body = cleanGeneratedText(generated)
    if (!body) continue

    const createdAt = replyDateForComment(parentComment.createdAt)
    await createComment({
      targetType: 'poem',
      targetId: poem._id,
      authorId: replyAuthor._id,
      body,
      parentId: parentComment._id,
      createdAt,
      updatedAt: createdAt,
      simulationRunId: context.runId,
      simulationKind: 'seed-poem-reply'
    }, context)

    createdReplies += 1
    logAction(context, `${context.dryRun ? 'dry-replied' : 'replied'}: ${formatPoemTitle(poem)} <- ${authorDisplayName(replyAuthor)}`)
  }

  return { createdTopLevel, createdReplies }
}
