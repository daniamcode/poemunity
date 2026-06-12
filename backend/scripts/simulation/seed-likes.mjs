import Poem from '../../src/models/Poem.js'
import { loginAll } from './auth.mjs'
import { activityProfileFor } from './profiles.mjs'
import {
  authorDisplayName,
  formatPoemTitle,
  genreMatches,
  isSimulationFamousAuthor,
  logAction,
  randomInt,
  shuffle,
  weightedSample
} from './utils.mjs'

function poemAuthorId (poem) {
  return String(poem.authorId?._id || poem.authorId || poem.userId || '')
}

function likesContain (poem, authorId) {
  return (poem.likes || []).some(id => String(id) === String(authorId))
}

export function computeLikeWeight (author, poem, famousNames) {
  if (poemAuthorId(poem) === String(author._id)) return 0
  if (likesContain(poem, author._id)) return 0

  let weight = 1
  const poemAuthor = poem.authorId && typeof poem.authorId === 'object' ? poem.authorId : null
  if (poem.authorType === 'famous' || (poemAuthor && isSimulationFamousAuthor(poemAuthor, famousNames))) weight *= 3
  if (genreMatches(author, poem)) weight *= 2

  const likeCount = poem.likes?.length ?? 0
  if (likeCount > 20) weight *= 2
  else if (likeCount > 10) weight *= 1.5
  else if (likeCount > 5) weight *= 1.2

  return weight
}

export function chooseLikesForAuthor (author, poems, famousNames) {
  const profile = activityProfileFor(author)
  const budget = randomInt(profile.likeMin, profile.likeMax)
  const outsideBudget = Math.round(budget * 0.15)
  const insideBudget = budget - outsideBudget

  const weightedCandidates = poems.map(poem => ({
    item: poem,
    weight: computeLikeWeight(author, poem, famousNames)
  }))

  const genrePicks = weightedSample(weightedCandidates, insideBudget)
  const pickedIds = new Set(genrePicks.map(poem => String(poem._id)))
  const outsideCandidates = shuffle(poems.filter(poem => {
    if (pickedIds.has(String(poem._id))) return false
    if (poemAuthorId(poem) === String(author._id)) return false
    if (likesContain(poem, author._id)) return false
    return !genreMatches(author, poem)
  }))

  return [...genrePicks, ...outsideCandidates.slice(0, outsideBudget)]
}

async function seedLikesViaDb (authors, poems, context) {
  const likedByAuthor = new Map()
  let created = 0

  for (const author of authors) {
    const picks = chooseLikesForAuthor(author, poems, context.famousNames)
    likedByAuthor.set(String(author._id), new Set())

    for (const poem of picks) {
      if (context.dryRun) {
        poem.likes = [...(poem.likes || []), String(author._id)]
        likedByAuthor.get(String(author._id)).add(String(poem._id))
        created += 1
        logAction(context, `dry-like: ${formatPoemTitle(poem)} <- ${authorDisplayName(author)}`)
        continue
      }

      const result = await Poem.updateOne(
        { _id: poem._id, likes: { $ne: String(author._id) } },
        { $addToSet: { likes: String(author._id) } }
      )

      if (result.modifiedCount > 0) {
        await recordLikeEvent(author, poem, context)
        poem.likes = [...(poem.likes || []), String(author._id)]
        likedByAuthor.get(String(author._id)).add(String(poem._id))
        created += 1
        logAction(context, `liked: ${formatPoemTitle(poem)} <- ${authorDisplayName(author)}`)
      }
    }
  }

  return { created, likedByAuthor }
}

async function seedLikesViaApi (authors, poems, context) {
  const credentials = context.credentials
  if (!credentials.length) throw new Error('SIMULATION_AUTHORS is required when using --use-api-likes')

  const tokens = await loginAll(credentials, context)
  const likedByAuthor = new Map()
  let created = 0

  for (const author of authors) {
    const token = tokens[String(author._id)] || tokens[author.username]
    if (!token) throw new Error(`Missing token for ${authorDisplayName(author)}`)

    const picks = chooseLikesForAuthor(author, poems, context.famousNames)
    likedByAuthor.set(String(author._id), new Set())

    for (const poem of picks) {
      if (context.dryRun) {
        poem.likes = [...(poem.likes || []), String(author._id)]
        likedByAuthor.get(String(author._id)).add(String(poem._id))
        created += 1
        logAction(context, `dry-like-api: ${formatPoemTitle(poem)} <- ${authorDisplayName(author)}`)
        continue
      }

      const res = await globalThis.fetch(`${context.apiBase}/api/v1/poem/${poem._id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        logAction(context, `like-failed: ${formatPoemTitle(poem)} <- ${authorDisplayName(author)} (${res.status})`)
        continue
      }

      await recordLikeEvent(author, poem, context)
      poem.likes = [...(poem.likes || []), String(author._id)]
      likedByAuthor.get(String(author._id)).add(String(poem._id))
      created += 1
      logAction(context, `liked-api: ${formatPoemTitle(poem)} <- ${authorDisplayName(author)}`)
    }
  }

  return { created, likedByAuthor }
}

export async function seedLikes (authors, poems, context) {
  if (context.useApiLikes) return seedLikesViaApi(authors, poems, context)
  return seedLikesViaDb(authors, poems, context)
}

export async function recordLikeEvent (author, poem, context) {
  await Poem.db.collection('simulation_like_events').updateOne(
    {
      runId: context.runId,
      authorId: author._id,
      poemId: poem._id
    },
    {
      $setOnInsert: {
        runId: context.runId,
        authorId: author._id,
        poemId: poem._id,
        createdAt: new Date()
      }
    },
    { upsert: true }
  )
}
