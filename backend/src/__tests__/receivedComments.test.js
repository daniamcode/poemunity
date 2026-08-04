const request = require('supertest')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const Comment = require('../models/Comment')

// ---------------------------------------------------------------------------
// GET /api/v1/comments/received — the "Received" half of the My comments tab.
//
// THREE SOURCES, and the third is the interesting one:
//   - comments on poems I authored
//   - comments on my author page
//   - REPLIES to comments I wrote, anywhere, including on a stranger's poem
//
// That last one is what people mean by "replies", and before this it was
// reachable nowhere at all — you answered somebody on a poem that was not
// yours, they answered back, and nothing in the site would show you.
//
// My OWN comments are excluded throughout: commenting on my own poem is not
// something I received, and the Written tab already lists it.
// ---------------------------------------------------------------------------

const makeToken = (id) =>
  jwt.sign({ id: String(id), username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

const received = (id) =>
  request(app).get('/api/v1/comments/received').set('Authorization', `Bearer ${makeToken(id)}`)

const bodies = (res) => res.body.comments.map(c => c.body)

const comment = (authorId, targetType, targetId, body, extra = {}) =>
  Comment.create({ authorId, targetType, targetId, body, ...extra })

async function seed () {
  const me = await Author.create({ username: 'me', name: 'Me Poet', slug: 'me-poet', type: 'user' })
  const other = await Author.create({ username: 'nadia', name: 'Nadia Novak', slug: 'nadia-novak', type: 'user' })
  const myPoem = await Poem.create({
    title: 'Mine', slug: 'mine-me', poem: 'w', genre: 'love', authorId: me._id, origin: 'user', date: new Date()
  })
  const theirPoem = await Poem.create({
    title: 'Theirs', slug: 'theirs-nadia', poem: 'w', genre: 'love', authorId: other._id, origin: 'user', date: new Date()
  })
  return { me, other, myPoem, theirPoem }
}

describe('GET /comments/received', () => {
  test('401 without a session', async () => {
    await request(app).get('/api/v1/comments/received').expect(401)
  })

  test('a comment on my poem', async () => {
    const { me, other, myPoem } = await seed()
    await comment(other._id, 'poem', myPoem._id, 'on your poem')

    const res = await received(me._id).expect(200)

    expect(bodies(res)).toEqual(['on your poem'])
    expect(res.body.comments[0]).toMatchObject({
      targetType: 'poem',
      isReply: false,
      poem: { title: 'Mine', slug: 'mine-me' },
      author: { name: 'Nadia Novak', slug: 'nadia-novak' }
    })
  })

  test('a comment on my author page', async () => {
    const { me, other } = await seed()
    await comment(other._id, 'profile', me._id, 'on your page')

    const res = await received(me._id).expect(200)

    expect(bodies(res)).toEqual(['on your page'])
    expect(res.body.comments[0].targetType).toBe('profile')
    expect(res.body.comments[0].poem).toBeUndefined()
  })

  test('a REPLY to me on somebody else’s poem — reachable nowhere before', async () => {
    // The whole reason this endpoint has three sources rather than two. The
    // poem is not mine and the page is not mine; only the parent is.
    const { me, other, theirPoem } = await seed()
    const mine = await comment(me._id, 'poem', theirPoem._id, 'my thought')
    await comment(other._id, 'poem', theirPoem._id, 'answering you', { parentId: mine._id })

    const res = await received(me._id).expect(200)

    expect(bodies(res)).toEqual(['answering you'])
    expect(res.body.comments[0].isReply).toBe(true)
    expect(res.body.comments[0].poem.slug).toBe('theirs-nadia')
  })

  test('marks a reply on MY OWN poem as a reply, not just a comment', async () => {
    // Both sources match it. `isReply` is what lets the UI say "replied to you"
    // instead of the weaker "commented on your poem".
    const { me, other, myPoem } = await seed()
    const mine = await comment(me._id, 'poem', myPoem._id, 'my note')
    await comment(other._id, 'poem', myPoem._id, 'answering you', { parentId: mine._id })

    const res = await received(me._id).expect(200)

    expect(res.body.comments).toHaveLength(1)
    expect(res.body.comments[0].isReply).toBe(true)
  })

  describe('what is NOT received', () => {
    test('my own comment on my own poem', async () => {
      const { me, myPoem } = await seed()
      await comment(me._id, 'poem', myPoem._id, 'talking to myself')

      const res = await received(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('my own reply to myself', async () => {
      const { me, theirPoem } = await seed()
      const mine = await comment(me._id, 'poem', theirPoem._id, 'my thought')
      await comment(me._id, 'poem', theirPoem._id, 'and another', { parentId: mine._id })

      const res = await received(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('a comment on a stranger’s poem that is not a reply to me', async () => {
      // The distractor: it lives on the same poem as a comment of mine, so a
      // query keyed on the POEM rather than the parent would wrongly include it.
      const { me, other, theirPoem } = await seed()
      await comment(me._id, 'poem', theirPoem._id, 'my thought')
      await comment(other._id, 'poem', theirPoem._id, 'unrelated remark')

      const res = await received(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('a comment on somebody else’s author page', async () => {
      const { me, other } = await seed()
      await comment(me._id, 'profile', other._id, 'hello there')

      const res = await received(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('a comment on a poem I have since withdrawn to a draft', async () => {
      // It is on something no reader can reach, so the row would link to a 404.
      const { me, other, myPoem } = await seed()
      await comment(other._id, 'poem', myPoem._id, 'on your poem')
      await Poem.findByIdAndUpdate(myPoem._id, { $set: { status: 'draft' } })

      const res = await received(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('and withdrawn poems do not eat the page', async () => {
      // The test above passes with the FIRST filter removed, because the
      // mapping stage drops the row a second time — red-check found that. This
      // is what the first filter actually buys: without it, comments on a
      // withdrawn poem enter the query, fill the `limit` slots as the newest
      // rows, and are then discarded — so a full page comes back empty while
      // reachable comments sit on page two, unreachable.
      const { me, other, myPoem } = await seed()
      const live = await Poem.create({
        title: 'Live', slug: 'live-me', poem: 'w', genre: 'love', authorId: me._id, origin: 'user', date: new Date()
      })
      for (let i = 0; i < 12; i++) {
        await comment(other._id, 'poem', myPoem._id, `hidden ${i}`, { createdAt: new Date(2026, 5, i + 1) })
      }
      await comment(other._id, 'poem', live._id, 'still reachable', { createdAt: new Date(2026, 0, 1) })
      await Poem.findByIdAndUpdate(myPoem._id, { $set: { status: 'draft' } })

      const res = await received(me._id).query({ page: 1, limit: 10 }).expect(200)

      expect(bodies(res)).toEqual(['still reachable'])
    })
  })

  test('all three sources appear together, newest first', async () => {
    const { me, other, myPoem, theirPoem } = await seed()
    const mine = await comment(me._id, 'poem', theirPoem._id, 'my thought', { createdAt: new Date('2026-01-01') })
    await comment(other._id, 'poem', myPoem._id, 'on your poem', { createdAt: new Date('2026-02-01') })
    await comment(other._id, 'profile', me._id, 'on your page', { createdAt: new Date('2026-03-01') })
    await comment(other._id, 'poem', theirPoem._id, 'answering you', { parentId: mine._id, createdAt: new Date('2026-04-01') })

    const res = await received(me._id).expect(200)

    expect(bodies(res)).toEqual(['answering you', 'on your page', 'on your poem'])
  })

  test('an AI commenter keeps its type, so the badge survives here', async () => {
    const { me, myPoem } = await seed()
    const bot = await Author.create({ username: 'aria', name: 'Aria', slug: 'aria', type: 'ai' })
    await comment(bot._id, 'poem', myPoem._id, 'from a bot')

    const res = await received(me._id).expect(200)

    expect(res.body.comments[0].author.type).toBe('ai')
  })

  test('pages without repeating or dropping a row', async () => {
    const { me, other, myPoem } = await seed()
    for (let i = 0; i < 12; i++) {
      await comment(other._id, 'poem', myPoem._id, `c${i}`, { createdAt: new Date(2026, 0, i + 1) })
    }

    const p1 = await received(me._id).query({ page: 1, limit: 10 }).expect(200)
    const p2 = await received(me._id).query({ page: 2, limit: 10 }).expect(200)

    expect(p1.body.comments).toHaveLength(10)
    expect(p1.body.hasMore).toBe(true)
    expect(p2.body.comments).toHaveLength(2)
    expect(p2.body.hasMore).toBe(false)

    const ids = [...p1.body.comments, ...p2.body.comments].map(c => c.id)
    expect(new Set(ids).size).toBe(12)
  })
})
