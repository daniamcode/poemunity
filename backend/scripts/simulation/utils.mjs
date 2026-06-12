const DEFAULT_FAMOUS_USERNAMES = ['moonwriter23', 'VersesBy_Sadie', 'angry.quill', 'historybuff42', 'lostinlove23']

export function parseArgs (argv = process.argv.slice(2)) {
  const args = {
    dryRun: false,
    callAi: false,
    confirmProduction: false,
    useApiLikes: false,
    runId: process.env.SIMULATION_RUN_ID || 'seed-activity-v1'
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--call-ai') args.callAi = true
    else if (arg === '--confirm-production') args.confirmProduction = true
    else if (arg === '--use-api-likes') args.useApiLikes = true
    else if (arg === '--run-id') {
      args.runId = argv[i + 1]
      i += 1
    } else if (arg.startsWith('--run-id=')) {
      args.runId = arg.slice('--run-id='.length)
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  if (!args.runId) throw new Error('Missing run id')
  if (process.env.SIMULATION_LIKES_MODE === 'api') args.useApiLikes = true
  return args
}

export function requireEnv (name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required env var: ${name}`)
  return value
}

export function getMongoUri () {
  if (process.env.NODE_ENV === 'production') return requireEnv('MONGODB')
  return process.env.MONGODB_PRE || requireEnv('MONGODB')
}

export function getApiBase () {
  return (process.env.API_BASE || 'http://localhost:4200').replace(/\/$/, '')
}

export function randomInt (min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

export function sampleOne (items) {
  if (!items.length) return null
  return items[randomInt(0, items.length - 1)]
}

export function shuffle (items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = result[i]
    result[i] = result[j]
    result[j] = tmp
  }
  return result
}

export function weightedSample (items, count) {
  const pool = items
    .filter(item => item.weight > 0)
    .map(item => ({ ...item }))
  const picks = []

  while (pool.length && picks.length < count) {
    const total = pool.reduce((sum, item) => sum + item.weight, 0)
    let roll = Math.random() * total
    const index = pool.findIndex(item => {
      roll -= item.weight
      return roll <= 0
    })
    const pickedIndex = index === -1 ? pool.length - 1 : index
    picks.push(pool[pickedIndex].item)
    pool.splice(pickedIndex, 1)
  }

  return picks
}

export function normalizeGenre (genre = '') {
  return String(genre)
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function genreMatches (author, poem) {
  const poemGenre = normalizeGenre(poem.genre)
  return getPreferredGenreNames(author).some(genre => normalizeGenre(genre) === poemGenre)
}

export function getPreferredGenreNames (author) {
  return (author.preferredGenres || [])
    .map(genre => typeof genre === 'string' ? genre : genre?.genre)
    .filter(Boolean)
}

export function addDays (date, days) {
  return new Date(new Date(date).getTime() + days * 24 * 60 * 60 * 1000)
}

export function randomDateBetween (start, end) {
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) {
    return new Date(Math.min(Date.now() - 24 * 60 * 60 * 1000, startTime || Date.now()))
  }
  return new Date(startTime + Math.random() * (endTime - startTime))
}

export function yesterday () {
  const date = new Date()
  date.setDate(date.getDate() - 1)
  return date
}

export function clampPastDate (date) {
  const max = yesterday()
  return new Date(date) > max ? max : new Date(date)
}

export function commentDateForPoem (poemDate) {
  const base = poemDate ? new Date(poemDate) : addDays(new Date(), -90)
  const r = Math.random()
  let daysAfter
  if (r < 0.55) daysAfter = Math.random() * 7
  else if (r < 0.85) daysAfter = 7 + Math.random() * 23
  else daysAfter = 30 + Math.random() * 60

  return clampPastDate(addDays(base, daysAfter))
}

export function replyDateForComment (commentDate) {
  const start = addDays(commentDate, 1)
  const end = clampPastDate(addDays(commentDate, randomInt(1, 5)))
  return randomDateBetween(start, end)
}

export function recentProfileCommentDate (poemDate) {
  const earliest = poemDate ? addDays(poemDate, 1) : addDays(new Date(), -365)
  const latest = yesterday()
  const oneYearAgo = addDays(new Date(), -365)
  return randomDateBetween(earliest > oneYearAgo ? earliest : oneYearAgo, latest)
}

export function cleanGeneratedText (text, maxLength = 1000) {
  return String(text || '')
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\s+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxLength)
    .trim()
}

export function authorDisplayName (author) {
  return author.username || author.name || String(author._id)
}

export function formatPoemTitle (poem) {
  const title = String(poem.title || poem._id || 'Untitled')
    .replace(/\s+/g, ' ')
    .trim()
  return title.length > 80 ? `${title.slice(0, 77)}...` : title
}

export function parseAuthorCredentials () {
  if (!process.env.SIMULATION_AUTHORS) return []
  const parsed = JSON.parse(process.env.SIMULATION_AUTHORS)
  if (!Array.isArray(parsed)) throw new Error('SIMULATION_AUTHORS must be a JSON array')
  return parsed
}

export function famousUsernames () {
  const raw = process.env.SIMULATION_FAMOUS_USERNAMES
  if (!raw) return DEFAULT_FAMOUS_USERNAMES
  return raw.split(',').map(value => value.trim()).filter(Boolean)
}

export function isSimulationFamousAuthor (author, famousNames = famousUsernames()) {
  return author.type === 'famous' || famousNames.includes(author.username)
}

export function logAction (context, message) {
  context.log(message)
}
