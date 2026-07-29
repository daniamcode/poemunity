const request = require('supertest')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')

// GET /api/v1/poem/:poemId/next
//
// ONE rule, independent of where the reader came from:
//
//   1. the author's next poem, by date DESC / _id DESC
//   2. author exhausted -> the next author alphabetically, at their newest poem
//   3. last author      -> wrap to the first author alphabetically
//
// Authors partition the collection (every poem has exactly one), which is what
// makes a lap visit every poem exactly once before repeating.

const D = (iso) => new Date(iso)

async function makeAuthor (username, name) {
  return Author.create({ username, name: name || username, slug: username, origin: 'user' })
}

function makePoem (overrides) {
  return Poem.create({
    title: 'untitled',
    poem: 'content',
    genre: 'love',
    likes: [],
    origin: 'user',
    ...overrides
  })
}

function next (idOrSlug) {
  return request(app).get(`/api/v1/poem/${idOrSlug}/next`)
}

describe('GET /api/v1/poem/:poemId/next', () => {
  let alice
  let bob

  beforeEach(async () => {
    // 'Alice Adams' sorts before 'Bob Brown' — the author walk is alphabetical.
    alice = await makeAuthor('alice', 'Alice Adams')
    bob = await makeAuthor('bob', 'Bob Brown')
  })

  describe('resolving the current poem', () => {
    test('404 when it does not exist', async () => {
      const response = await next('507f1f77bcf86cd799439011').expect(404)
      expect(response.body.error).toBe('poem not found')
    })

    test('404 for a malformed id (neither ObjectId nor slug)', async () => {
      await next('definitely-not-a-poem').expect(404)
    })

    test('resolves by slug as well as by id', async () => {
      const current = await makePoem({ title: 'A', slug: 'poem-a', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'B', authorId: alice._id, date: D('2024-02-01') })

      const bySlug = await next('poem-a').expect(200)
      const byId = await next(current._id).expect(200)

      expect(bySlug.body.poem.id).toBe(String(expected._id))
      expect(byId.body.poem.id).toBe(String(expected._id))
    })
  })

  describe('1. continuing with the same author', () => {
    test('returns that author\'s next poem by date, newest first', async () => {
      const current = await makePoem({ title: 'Newest', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Middle', authorId: alice._id, date: D('2024-02-01') })
      await makePoem({ title: 'Oldest', authorId: alice._id, date: D('2024-01-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
      expect(response.body.poem.title).toBe('Middle')
    })

    test('skips other authors even when their poems fall in between by date', async () => {
      const current = await makePoem({ title: 'Alice newest', authorId: alice._id, date: D('2024-03-01') })
      await makePoem({ title: 'Bob middle', authorId: bob._id, date: D('2024-02-15') })
      const expected = await makePoem({ title: 'Alice older', authorId: alice._id, date: D('2024-02-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })

    test('populates the author so the card can name it', async () => {
      const current = await makePoem({ authorId: alice._id, date: D('2024-03-01') })
      await makePoem({ authorId: alice._id, date: D('2024-02-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.author).toBe('Alice Adams')
      expect(response.body.poem.authorSlug).toBe('alice')
    })

    // Poems seeded in one batch share an identical `date`. Without a second sort
    // key "next" is ambiguous and the walk can ping-pong between two of them.
    test('breaks ties on _id so identical dates still have a strict order', async () => {
      const same = D('2024-03-01')
      const poems = []
      for (let i = 0; i < 4; i++) {
        poems.push(await makePoem({ title: `Tied ${i}`, authorId: alice._id, date: same }))
      }
      const descending = [...poems].sort((a, b) => (String(a._id) < String(b._id) ? 1 : -1))

      const seen = []
      let cursor = descending[0]
      for (let i = 0; i < 3; i++) {
        const response = await next(cursor._id).expect(200)
        seen.push(response.body.poem.id)
        cursor = { _id: response.body.poem.id }
      }

      expect(seen).toEqual(descending.slice(1).map((p) => String(p._id)))
    })
  })

  describe('2. crossing to the next author', () => {
    test('opens the next author alphabetically at their newest poem', async () => {
      const current = await makePoem({ title: 'Alice only', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Bob newest', authorId: bob._id, date: D('2024-05-01') })
      await makePoem({ title: 'Bob older', authorId: bob._id, date: D('2024-01-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
      expect(response.body.poem.title).toBe('Bob newest')
    })

    test('orders authors by display name, not by insertion or id', async () => {
      // Creation order and name order must differ by more than a ROTATION, or an
      // _id sort produces the same cycle and the test passes while asserting
      // nothing. Created 1,2,3,4; named so the alphabetical order is 1,3,2,4.
      // Successor of #1 is then #3 by name but #2 by _id.
      const a1 = await makeAuthor('u1', 'Aaa First')
      const a2 = await makeAuthor('u2', 'Ccc Third')
      const a3 = await makeAuthor('u3', 'Bbb Second')
      const a4 = await makeAuthor('u4', 'Ddd Fourth')

      const current = await makePoem({ title: 'by Aaa', authorId: a1._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'by Bbb', authorId: a3._id, date: D('2024-02-01') })
      const wrongByIdOrder = await makePoem({ title: 'by Ccc', authorId: a2._id, date: D('2024-02-01') })
      await makePoem({ title: 'by Ddd', authorId: a4._id, date: D('2024-02-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
      expect(response.body.poem.id).not.toBe(String(wrongByIdOrder._id))
    })

    test('falls back to the username when an author has no name', async () => {
      const anon = await Author.create({ username: 'aaa-anon', slug: 'aaa-anon', origin: 'user' })
      const current = await makePoem({ authorId: anon._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Alice poem', authorId: alice._id, date: D('2024-02-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })

    test('skips authors that have no poems at all', async () => {
      await makeAuthor('barry', 'Barry Between')
      const current = await makePoem({ authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Bob poem', authorId: bob._id, date: D('2024-02-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })
  })

  describe('3. wrapping', () => {
    test('the last author wraps to the first author\'s newest poem', async () => {
      const expected = await makePoem({ title: 'Alice newest', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Alice older', authorId: alice._id, date: D('2024-01-01') })
      const current = await makePoem({ title: 'Bob only', authorId: bob._id, date: D('2024-03-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })

    test('a single-poem collection has nothing to show', async () => {
      const only = await makePoem({ authorId: alice._id, date: D('2024-03-01') })

      const response = await next(only._id).expect(200)

      expect(response.body.poem).toBeNull()
    })
  })

  describe('poems with no author', () => {
    // A product decision: they belong to no author, so the walk cannot place
    // them and never offers them as a destination.
    test('are never returned as the next poem', async () => {
      const current = await makePoem({ title: 'Alice only', authorId: alice._id, date: D('2024-03-01') })
      await makePoem({ title: 'Orphan', authorId: undefined, date: D('2024-02-15') })
      const expected = await makePoem({ title: 'Bob poem', authorId: bob._id, date: D('2024-02-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
      expect(response.body.poem.title).not.toBe('Orphan')
    })

    test('landing on one still moves forward, starting at the first author', async () => {
      const orphan = await makePoem({ title: 'Orphan', authorId: undefined, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Alice newest', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Bob poem', authorId: bob._id, date: D('2024-01-01') })

      const response = await next(orphan._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })

    test('an author row that no longer exists is treated the same way', async () => {
      const ghostId = '507f1f77bcf86cd799439011'
      const current = await makePoem({ authorId: ghostId, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Alice newest', authorId: alice._id, date: D('2024-05-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })
  })

  describe('undated poems', () => {
    // BSON sorts null/missing lowest so they sort last, but range operators never
    // compare across BSON types: { date: { $lt: <Date> } } does NOT match a
    // missing date. Unhandled, the undated tail would be unreachable.
    test('sort after every dated poem by the same author, and are still reached', async () => {
      const current = await makePoem({ title: 'Dated', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Undated', authorId: alice._id, date: undefined })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })

    test('an undated poem still leads on to the next author', async () => {
      const current = await makePoem({ title: 'Alice undated', authorId: alice._id, date: undefined })
      const expected = await makePoem({ title: 'Bob poem', authorId: bob._id, date: D('2024-02-01') })

      const response = await next(current._id).expect(200)

      expect(response.body.poem.id).toBe(String(expected._id))
    })
  })

  // The headline property. Authors partition the collection, so following the
  // walk from ANY poem must visit every poem exactly once before returning to
  // the start. The fixture interleaves authors by date and repeats a date, which
  // is precisely the shape that breaks a naive implementation.
  describe('the walk is a single loop over every poem', () => {
    async function walkFrom (startId, size) {
      const seen = []
      let cursor = startId
      for (let i = 0; i < size; i++) {
        const response = await next(cursor).expect(200)
        expect(response.body.poem).not.toBeNull()
        cursor = response.body.poem.id
        seen.push(cursor)
      }
      return seen
    }

    test('every starting point visits all poems exactly once, then repeats', async () => {
      const carol = await makeAuthor('carol', 'Carol Clark')
      const shared = D('2024-02-01')
      const poems = [
        await makePoem({ title: 'a1', authorId: alice._id, date: D('2024-06-01') }),
        await makePoem({ title: 'b1', authorId: bob._id, date: D('2024-05-01') }),
        await makePoem({ title: 'c1', authorId: carol._id, date: D('2024-04-01') }),
        // a2/a3 share a date within ONE author, which is what actually exercises
        // the _id tie-break; b2/c2 share one across authors, which does not.
        await makePoem({ title: 'a2', authorId: alice._id, date: shared }),
        await makePoem({ title: 'a3', authorId: alice._id, date: shared }),
        await makePoem({ title: 'b2', authorId: bob._id, date: shared }),
        await makePoem({ title: 'c2', authorId: carol._id, date: D('2024-01-01') })
      ]
      const ids = poems.map((p) => String(p._id))

      for (const start of ids) {
        const seen = await walkFrom(start, ids.length)

        // Every poem exactly once, ending back where it began.
        expect(new Set(seen).size).toBe(ids.length)
        expect([...seen].sort()).toEqual([...ids].sort())
        expect(seen[seen.length - 1]).toBe(start)
      }
    })

    test('holds when one author owns everything', async () => {
      const poems = []
      for (let i = 0; i < 4; i++) {
        poems.push(await makePoem({ title: `only-${i}`, authorId: alice._id, date: D(`2024-0${i + 1}-01`) }))
      }
      const ids = poems.map((p) => String(p._id))

      for (const start of ids) {
        const seen = await walkFrom(start, ids.length)
        expect(new Set(seen).size).toBe(ids.length)
        expect(seen[seen.length - 1]).toBe(start)
      }
    })

    test('holds when every author owns exactly one poem', async () => {
      const carol = await makeAuthor('carol', 'Carol Clark')
      const poems = [
        await makePoem({ title: 'a', authorId: alice._id, date: D('2024-01-01') }),
        await makePoem({ title: 'b', authorId: bob._id, date: D('2024-06-01') }),
        await makePoem({ title: 'c', authorId: carol._id, date: D('2024-03-01') })
      ]
      const ids = poems.map((p) => String(p._id))

      for (const start of ids) {
        const seen = await walkFrom(start, ids.length)
        expect(new Set(seen).size).toBe(ids.length)
        expect(seen[seen.length - 1]).toBe(start)
      }
    })
  })
})
