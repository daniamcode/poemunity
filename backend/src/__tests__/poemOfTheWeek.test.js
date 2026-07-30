const request = require('supertest')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')
const { weekIndex, weekStart } = require('../controllers/poems')

// GET /api/v1/poems/poem-of-the-week
//
// One famous poem, the same for everyone, rotating every Monday. The pick is
// DERIVED from the date rather than stored, so there is no scheduler to miss a
// week and nothing to keep in sync.

const get = () => request(app).get('/api/v1/poems/poem-of-the-week')

async function makeFamousPoem (title, index) {
  const author = await Author.create({
    username: `poet-${index}`,
    name: `Poet ${index}`,
    slug: `poet-${index}`,
    type: 'famous'
  })
  return Poem.create({
    title,
    poem: 'content',
    genre: 'love',
    likes: [],
    origin: 'famous',
    authorId: author._id
  })
}

describe('weekIndex', () => {
  // 1 Jan 1970 was a Thursday, so the +3 offset is what puts the boundary on
  // Monday. Off by one and the poem changes mid-weekend.
  test('increments on Monday, not on any other day', () => {
    const sunday = new Date('2026-07-26T23:59:59Z')
    const monday = new Date('2026-07-27T00:00:00Z')
    const tuesday = new Date('2026-07-28T12:00:00Z')

    expect(weekIndex(monday)).toBe(weekIndex(sunday) + 1)
    expect(weekIndex(tuesday)).toBe(weekIndex(monday))
  })

  test('is stable across a whole week', () => {
    const monday = new Date('2026-07-27T00:00:00Z')
    const sunday = new Date('2026-08-02T23:59:59Z')

    expect(weekIndex(sunday)).toBe(weekIndex(monday))
  })

  test('weekStart resolves to the Monday of that week', () => {
    const index = weekIndex(new Date('2026-07-30T12:00:00Z'))

    expect(weekStart(index).toISOString().slice(0, 10)).toBe('2026-07-27')
    // getUTCDay: 1 === Monday.
    expect(weekStart(index).getUTCDay()).toBe(1)
  })
})

describe('GET /api/v1/poems/poem-of-the-week', () => {
  test('returns a famous poem and the Monday its week began', async () => {
    await makeFamousPoem('Ozymandias', 1)

    const response = await get().expect(200)

    expect(response.body.poem.title).toBe('Ozymandias')
    expect(response.body.poem.author).toBe('Poet 1')
    expect(new Date(response.body.weekStart).getUTCDay()).toBe(1)
  })

  // The whole point of the feature: famous poets only.
  test('never picks a community or AI poem', async () => {
    const user = await Author.create({ username: 'u', name: 'A User', slug: 'u', type: 'user' })
    const ai = await Author.create({ username: 'bot', name: 'A Bot', slug: 'bot', type: 'ai' })
    await Poem.create({ title: 'Mine', poem: 'x', genre: 'love', likes: [], origin: 'user', authorId: user._id })
    await Poem.create({ title: 'Generated', poem: 'x', genre: 'love', likes: [], origin: 'ai', authorId: ai._id })
    await makeFamousPoem('Ozymandias', 2)

    const response = await get().expect(200)

    expect(response.body.poem.title).toBe('Ozymandias')
  })

  test('is null when there are no famous poems at all', async () => {
    const user = await Author.create({ username: 'u2', name: 'A User', slug: 'u2', type: 'user' })
    await Poem.create({ title: 'Mine', poem: 'x', genre: 'love', likes: [], origin: 'user', authorId: user._id })

    const response = await get().expect(200)

    expect(response.body.poem).toBeNull()
  })

  test('every visitor gets the same poem within a week', async () => {
    for (let i = 0; i < 5; i++) await makeFamousPoem(`Poem ${i}`, i)

    const [a, b, c] = await Promise.all([get(), get(), get()])

    expect(a.body.poem.id).toBe(b.body.poem.id)
    expect(b.body.poem.id).toBe(c.body.poem.id)
  })

  // Rotation is what makes it a poem of the WEEK. Driving it off the index
  // directly proves consecutive weeks differ without waiting seven days.
  test('consecutive weeks select different poems', async () => {
    for (let i = 0; i < 5; i++) await makeFamousPoem(`Poem ${i}`, i)

    const total = await Poem.countDocuments({ origin: 'famous' })
    const ordered = await Poem.find({ origin: 'famous' }).sort({ _id: 1 })

    const thisWeek = weekIndex(new Date('2026-07-27T00:00:00Z'))
    const nextWeek = weekIndex(new Date('2026-08-03T00:00:00Z'))

    expect(nextWeek).toBe(thisWeek + 1)
    expect(String(ordered[thisWeek % total]._id))
      .not.toBe(String(ordered[nextWeek % total]._id))
  })

  test('wraps around rather than running out of poems', async () => {
    await makeFamousPoem('Only One', 9)

    // A single poem means every week resolves to it — the modulo must not fall
    // off the end.
    const response = await get().expect(200)

    expect(response.body.poem.title).toBe('Only One')
  })
})
