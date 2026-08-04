const request = require('supertest')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const Comment = require('../models/Comment')

// ---------------------------------------------------------------------------
// GET /api/v1/comments/mine — the profile's "My comments" tab.
//
// It exists because a comment is currently a dead end: you write one on a poem
// and afterwards have no way back to it. Your poems and the poems you liked
// already have their own tabs, so this is the only part of "my activity" that
// was unreachable.
//
// Two rules carry the weight. It is scoped by the SESSION, never by a query
// parameter. And a comment whose target is gone or no longer public is DROPPED,
// because a row linking to a 404 is worse than no row.
// ---------------------------------------------------------------------------

const makeToken = (id) =>
  jwt.sign({ id: String(id), username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

const mine = (id) =>
  request(app).get('/api/v1/comments/mine').set('Authorization', `Bearer ${makeToken(id)}`)

const bodies = (res) => res.body.comments.map(c => c.body)

async function seed () {
  const me = await Author.create({ username: 'me', name: 'Me Poet', slug: 'me-poet', type: 'user' })
  const other = await Author.create({ username: 'nadia', name: 'Nadia Novak', slug: 'nadia-novak', type: 'user' })
  const poem = await Poem.create({
    title: 'Aubade',
    slug: 'aubade-nadia',
    poem: 'words',
    genre: 'love',
    authorId: other._id,
    origin: 'user',
    date: new Date()
  })
  return { me, other, poem }
}

const comment = (authorId, targetType, targetId, body, createdAt) =>
  Comment.create({ authorId, targetType, targetId, body, createdAt: createdAt || new Date() })

describe('GET /comments/mine', () => {
  test('401 without a session', async () => {
    await request(app).get('/api/v1/comments/mine').expect(401)
  })

  test('returns your comments, newest first', async () => {
    const { me, poem } = await seed()
    await comment(me._id, 'poem', poem._id, 'older', new Date('2026-01-01'))
    await comment(me._id, 'poem', poem._id, 'newer', new Date('2026-06-01'))

    const res = await mine(me._id).expect(200)

    expect(bodies(res)).toEqual(['newer', 'older'])
  })

  test('carries the poem and its author, so a row can link back', async () => {
    // The whole point of the tab: getting back to what you commented on.
    const { me, poem } = await seed()
    await comment(me._id, 'poem', poem._id, 'lovely')

    const res = await mine(me._id).expect(200)

    expect(res.body.comments[0]).toMatchObject({
      body: 'lovely',
      targetType: 'poem',
      poem: {
        title: 'Aubade',
        slug: 'aubade-nadia',
        author: { name: 'Nadia Novak', slug: 'nadia-novak' }
      }
    })
  })

  test('never returns somebody else’s comments', async () => {
    // The distractor: the other author has MORE comments, so an unscoped query
    // returns a different, larger answer rather than coincidentally matching.
    const { me, other, poem } = await seed()
    await comment(other._id, 'poem', poem._id, 'theirs 1')
    await comment(other._id, 'poem', poem._id, 'theirs 2')
    await comment(me._id, 'poem', poem._id, 'mine')

    const res = await mine(me._id).expect(200)

    expect(bodies(res)).toEqual(['mine'])
  })

  test('is scoped by the session, never by a query parameter', async () => {
    const { me, other, poem } = await seed()
    await comment(other._id, 'poem', poem._id, 'theirs')

    const res = await mine(me._id).query({ authorId: String(other._id) }).expect(200)

    expect(res.body.comments).toEqual([])
  })

  describe('targets that can no longer be reached', () => {
    test('drops a comment whose poem was withdrawn to a draft', async () => {
      // Its author took it private. The comment still exists, but linking to it
      // would send the reader to a 404.
      const { me, poem } = await seed()
      await comment(me._id, 'poem', poem._id, 'on a poem since withdrawn')
      await Poem.findByIdAndUpdate(poem._id, { $set: { status: 'draft' } })

      const res = await mine(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('drops a comment whose poem was deleted', async () => {
      const { me, poem } = await seed()
      await comment(me._id, 'poem', poem._id, 'on a deleted poem')
      await Poem.findByIdAndDelete(poem._id)

      const res = await mine(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('but keeps the reachable ones alongside', async () => {
      // The distractor for both of the above: dropping everything would pass
      // them just as well.
      const { me, other, poem } = await seed()
      const alive = await Poem.create({
        title: 'Second Light',
        slug: 'second-light',
        poem: 'w',
        genre: 'love',
        authorId: other._id,
        origin: 'user',
        date: new Date()
      })
      await comment(me._id, 'poem', poem._id, 'doomed', new Date('2026-01-01'))
      await comment(me._id, 'poem', alive._id, 'fine', new Date('2026-02-01'))
      await Poem.findByIdAndDelete(poem._id)

      const res = await mine(me._id).expect(200)

      expect(bodies(res)).toEqual(['fine'])
    })

    test('counts a legacy poem with no status field as reachable', async () => {
      // ~16k poems predate `status`; "published" means published OR ABSENT.
      const { me, other } = await seed()
      const legacy = await Poem.collection.insertOne({
        title: 'Legacy', slug: 'legacy-x', poem: 'w', genre: 'love', authorId: other._id, origin: 'user', date: new Date()
      })
      await comment(me._id, 'poem', legacy.insertedId, 'on a legacy poem')

      const res = await mine(me._id).expect(200)

      expect(bodies(res)).toEqual(['on a legacy poem'])
    })
  })

  describe('profile comments', () => {
    test('are included, and carry the author instead of a poem', async () => {
      // Excluding them would make a tab called "my comments" quietly show only
      // some of them.
      const { me, other } = await seed()
      await comment(me._id, 'profile', other._id, 'nice profile')

      const res = await mine(me._id).expect(200)

      expect(res.body.comments[0]).toMatchObject({
        body: 'nice profile',
        targetType: 'profile',
        author: { name: 'Nadia Novak', slug: 'nadia-novak' }
      })
      expect(res.body.comments[0].poem).toBeUndefined()
    })

    test('are dropped when the author is gone', async () => {
      const { me, other } = await seed()
      await comment(me._id, 'profile', other._id, 'nice profile')
      await Author.findByIdAndDelete(other._id)

      const res = await mine(me._id).expect(200)

      expect(res.body.comments).toEqual([])
    })

    test('sit alongside poem comments in one list', async () => {
      const { me, other, poem } = await seed()
      await comment(me._id, 'poem', poem._id, 'on the poem', new Date('2026-01-01'))
      await comment(me._id, 'profile', other._id, 'on the profile', new Date('2026-02-01'))

      const res = await mine(me._id).expect(200)

      expect(bodies(res)).toEqual(['on the profile', 'on the poem'])
    })
  })

  describe('pagination', () => {
    test('pages without repeating or dropping a row', async () => {
      const { me, poem } = await seed()
      for (let i = 0; i < 12; i++) {
        await comment(me._id, 'poem', poem._id, `c${i}`, new Date(2026, 0, i + 1))
      }

      const p1 = await mine(me._id).query({ page: 1, limit: 10 }).expect(200)
      const p2 = await mine(me._id).query({ page: 2, limit: 10 }).expect(200)

      expect(p1.body.comments).toHaveLength(10)
      expect(p1.body.hasMore).toBe(true)
      expect(p2.body.comments).toHaveLength(2)
      expect(p2.body.hasMore).toBe(false)

      const ids = [...p1.body.comments, ...p2.body.comments].map(c => c.id)
      expect(new Set(ids).size).toBe(12)
    })

    test('an exactly-full page does not claim there is more', async () => {
      const { me, poem } = await seed()
      for (let i = 0; i < 10; i++) {
        await comment(me._id, 'poem', poem._id, `c${i}`, new Date(2026, 0, i + 1))
      }

      const res = await mine(me._id).query({ page: 1, limit: 10 }).expect(200)

      expect(res.body.comments).toHaveLength(10)
      expect(res.body.hasMore).toBe(false)
    })

    test('caps the page size', async () => {
      const { me } = await seed()

      const res = await mine(me._id).query({ limit: 9999 }).expect(200)

      expect(res.body.limit).toBeLessThanOrEqual(50)
    })
  })

  test('the index the query needs is declared, with its tie-break', () => {
    // Two things at once.
    //
    // Querying by authorId would otherwise scan the whole collection, and
    // `autoIndex` only ever CREATES — so a declaration dropped from the schema
    // lingers in Atlas forever while the code stops relying on it.
    //
    // And `_id` is the tie-break the paginated sort needs: the AI seed writes
    // hundreds of comments sharing a `createdAt` to the millisecond, and a
    // paginated sort with arbitrary ties can repeat one row across a page
    // boundary while dropping another.
    //
    // There is NO behavioural test for that tie-break, deliberately. One was
    // written and deleted: it passed with `_id` removed from the sort spec AND
    // from the index, because at fixture size the driver returns ties in a
    // stable order anyway. It could not fail, which is worse than not existing.
    // The declaration is the honest place to pin this.
    const declared = Comment.schema.indexes().map(([keys]) => JSON.stringify(keys))

    expect(declared).toContain(JSON.stringify({ authorId: 1, createdAt: -1, _id: -1 }))
  })
})
