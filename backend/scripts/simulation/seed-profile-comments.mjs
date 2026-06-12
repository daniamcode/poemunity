import Comment from '../../src/models/Comment.js'
import Poem from '../../src/models/Poem.js'
import { generate } from './ai/claude.mjs'
import { activityProfileFor } from './profiles.mjs'
import {
  authorDisplayName,
  cleanGeneratedText,
  genreMatches,
  logAction,
  randomInt,
  recentProfileCommentDate,
  sampleOne,
  shuffle
} from './utils.mjs'

function buildProfilePrompt (author, targetAuthor, poem) {
  const systemPrompt = [
    `You are ${authorDisplayName(author)}.`,
    author.bio || '',
    'You are leaving a comment on another poet\'s profile page.',
    'Write 1 to 2 sentences.',
    'Be specific and reference something from one of their poems.',
    'Sound like a real reader who was moved by their work, not a reviewer.',
    'Return only the profile comment text.'
  ].filter(Boolean).join('\n')

  const userPrompt = `The poet is ${authorDisplayName(targetAuthor)}. Here is one of their poems:\n\nTitle: "${poem.title || 'Untitled'}"\n${poem.poem}\n\nWrite your comment on their profile.`
  return { systemPrompt, userPrompt }
}

function chooseTargetAuthor (author, authors) {
  const overlapping = shuffle(authors.filter(target => {
    if (String(target._id) === String(author._id)) return false
    return (author.preferredGenres || []).some(genre => (target.preferredGenres || []).includes(genre))
  }))

  if (overlapping.length) return overlapping[0]
  return sampleOne(authors.filter(target => String(target._id) !== String(author._id)))
}

export async function seedProfileComments (authors, context) {
  let created = 0
  const eligibleAuthors = shuffle(authors.filter(author => activityProfileFor(author).name !== 'LURKER'))
  const bonusCommenters = shuffle(authors.filter(author => activityProfileFor(author).name === 'COMMENTER'))
  const targetCount = randomInt(30, 40)
  const actorQueue = [...eligibleAuthors, ...bonusCommenters]
  const usedPairs = new Set()

  for (const author of actorQueue) {
    if (created >= targetCount) break

    const targetAuthor = chooseTargetAuthor(author, authors)
    if (!targetAuthor) continue
    const pairKey = `${author._id}:${targetAuthor._id}`
    if (usedPairs.has(pairKey)) continue
    usedPairs.add(pairKey)

    const poems = await Poem.find({ authorId: targetAuthor._id })
      .sort({ likes: -1, date: -1 })
      .limit(10)
      .lean()

    const matchingPoems = poems.filter(poem => genreMatches(author, poem))
    const poem = sampleOne(matchingPoems.length ? matchingPoems : poems)
    if (!poem) continue

    const { systemPrompt, userPrompt } = buildProfilePrompt(author, targetAuthor, poem)
    const generated = await generate(systemPrompt, userPrompt, {
      task: 'profile-comment',
      dryRun: context.dryRun,
      callAi: context.callAi
    })
    const body = cleanGeneratedText(generated)
    if (!body) continue

    const createdAt = recentProfileCommentDate(poem.date)

    if (!context.dryRun) {
      const existing = await Comment.findOne({
        targetType: 'profile',
        targetId: targetAuthor._id,
        authorId: author._id,
        simulationRunId: context.runId,
        simulationKind: 'seed-profile-comment'
      })

      if (existing) continue

      await Comment.create({
        targetType: 'profile',
        targetId: targetAuthor._id,
        authorId: author._id,
        body,
        parentId: null,
        createdAt,
        updatedAt: createdAt,
        simulationRunId: context.runId,
        simulationKind: 'seed-profile-comment'
      })
    }

    created += 1
    logAction(context, `${context.dryRun ? 'dry-profile-comment' : 'profile-comment'}: ${authorDisplayName(targetAuthor)} <- ${authorDisplayName(author)}`)
  }

  return { created }
}
