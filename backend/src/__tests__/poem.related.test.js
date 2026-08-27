const request = require('supertest')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')

// GET /api/v1/poem/:poemId/related
//
// Two short lists — more by this author, more in this genre — so a poem page
// stops being a dead end with one outbound poem link.
//
// The fixture is built from DISTRACTORS, because most of the ways this can be
// wrong return a plausible-looking six poems:
//
//   * The current poem is the NEWEST of its author and of its genre, so a
//     missing self-exclusion puts it at the top of both lists rather than
//     somewhere in the tail where nobody would look.
//   * A draft sits between two published poems by date in both dimensions, so
//     an unfiltered query steps onto it in the middle of the list.
//   * The genre is stored MIXED CASE on the neighbours ('Love') and lowercase
//     on the current poem, so an exact string match returns nothing at all.
//   * Alice is prolific in a thin genre, so without the byAuthor exclusion the
//     two lists are the same six poems and the module adds no destinations.
//   * Several poems share a `date` to the millisecond, which is the shape of
//     the seeded collection, so ordering without the `_id` tie-break is
//     arbitrary among them.

const D = (iso) => new Date(iso)

const makeToken = (authorId) =>
  jwt.sign({ id: String(authorId), username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

async function makeAuthor (username, name) {
  return Author.create({ username, name: name || username, slug: username, origin: 'user' })
}

function makePoem (overrides) {
  return Poem.create({
    title: 'untitled',
    poem: 'some words',
    genre: 'love',
    likes: [],
    origin: 'user',
    ...overrides
  })
}

function related (idOrSlug, token) {
  const req = request(app).get(`/api/v1/poem/${idOrSlug}/related`)
  return token ? req.set('Authorization', `Bearer ${token}`) : req
}

const titlesOf = (rows) => rows.map((row) => row.title)

describe('GET /api/v1/poem/:poemId/related', () => {
  let alice
  let bob

  beforeEach(async () => {
    alice = await makeAuthor('alice', 'Alice Adams')
    bob = await makeAuthor('bob', 'Bob Brown')
  })

  describe('resolving the current poem', () => {
    test('404 when it does not exist', async () => {
      const response = await related('507f1f77bcf86cd799439011').expect(404)
      expect(response.body.error).toBe('poem not found')
    })

    test('404 for a malformed id (neither ObjectId nor slug)', async () => {
      await related('definitely-not-a-poem').expect(404)
    })

    test('resolves by slug as well as by id', async () => {
      const current = await makePoem({ title: 'Current', slug: 'current', authorId: alice._id, date: D('2024-03-01') })
      await makePoem({ title: 'Older', authorId: alice._id, date: D('2024-02-01') })

      const bySlug = await related('current').expect(200)
      const byId = await related(current._id).expect(200)

      expect(titlesOf(bySlug.body.byAuthor)).toEqual(['Older'])
      expect(titlesOf(byId.body.byAuthor)).toEqual(['Older'])
    })
  })

  describe('more by this author', () => {
    test('returns the author\'s other poems, newest first, and never the current one', async () => {
      const current = await makePoem({ title: 'Current', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Middle', authorId: alice._id, date: D('2024-04-01') })
      await makePoem({ title: 'Oldest', authorId: alice._id, date: D('2024-01-01') })
      // Somebody else's, same genre — belongs in byGenre, never in byAuthor.
      await makePoem({ title: 'Bobs', authorId: bob._id, date: D('2024-04-15') })

      const response = await related(current._id).expect(200)

      expect(titlesOf(response.body.byAuthor)).toEqual(['Middle', 'Oldest'])
    })

    test('skips the author\'s drafts', async () => {
      const current = await makePoem({ title: 'Current', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Newer', authorId: alice._id, date: D('2024-04-01') })
      // Between the two published ones by date: an unfiltered query steps onto
      // it in the MIDDLE of the list, not at an end where it is easy to spot.
      await makePoem({ title: 'Secret', authorId: alice._id, date: D('2024-03-01'), status: 'draft' })
      await makePoem({ title: 'Older', authorId: alice._id, date: D('2024-02-01') })

      const response = await related(current._id).expect(200)

      expect(titlesOf(response.body.byAuthor)).toEqual(['Newer', 'Older'])
    })

    test('is empty for a poem with no author, without failing the request', async () => {
      const current = await makePoem({ title: 'Orphan', date: D('2024-05-01') })
      await makePoem({ title: 'Neighbour', authorId: alice._id, date: D('2024-04-01') })

      const response = await related(current._id).expect(200)

      expect(response.body.byAuthor).toEqual([])
      // The genre list still works — losing an author does not lose both.
      expect(titlesOf(response.body.byGenre)).toEqual(['Neighbour'])
    })

    test('caps the list at six', async () => {
      const current = await makePoem({ title: 'Current', authorId: alice._id, date: D('2024-12-01') })
      for (let i = 1; i <= 8; i++) {
        await makePoem({ title: `Poem ${i}`, authorId: alice._id, date: D(`2024-0${i}-01`) })
      }

      const response = await related(current._id).expect(200)

      expect(response.body.byAuthor).toHaveLength(6)
      // Newest six, so the tail is what falls off.
      expect(titlesOf(response.body.byAuthor)).toEqual([
        'Poem 8', 'Poem 7', 'Poem 6', 'Poem 5', 'Poem 4', 'Poem 3'
      ])
    })
  })

  describe('more in this genre', () => {
    test('matches the genre case-insensitively', async () => {
      const current = await makePoem({ title: 'Current', genre: 'love', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Mixed Case', genre: 'Love', authorId: bob._id, date: D('2024-04-01') })
      await makePoem({ title: 'Shouty', genre: 'LOVE', authorId: bob._id, date: D('2024-03-01') })
      await makePoem({ title: 'Elsewhere', genre: 'nature', authorId: bob._id, date: D('2024-02-01') })

      const response = await related(current._id).expect(200)

      expect(titlesOf(response.body.byGenre)).toEqual(['Mixed Case', 'Shouty'])
    })

    test('excludes everything already listed under the author', async () => {
      // Alice is prolific in a thin genre. Without the exclusion both lists are
      // the same poems and the page gains links but no destinations.
      const current = await makePoem({ title: 'Current', genre: 'love', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Alice One', genre: 'love', authorId: alice._id, date: D('2024-04-01') })
      await makePoem({ title: 'Alice Two', genre: 'love', authorId: alice._id, date: D('2024-03-01') })
      await makePoem({ title: 'Bobs', genre: 'love', authorId: bob._id, date: D('2024-02-01') })

      const response = await related(current._id).expect(200)

      expect(titlesOf(response.body.byAuthor)).toEqual(['Alice One', 'Alice Two'])
      expect(titlesOf(response.body.byGenre)).toEqual(['Bobs'])
    })

    test('skips drafts', async () => {
      const current = await makePoem({ title: 'Current', genre: 'love', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Newer', genre: 'love', authorId: bob._id, date: D('2024-04-01') })
      await makePoem({ title: 'Secret', genre: 'love', authorId: bob._id, date: D('2024-03-01'), status: 'draft' })
      await makePoem({ title: 'Older', genre: 'love', authorId: bob._id, date: D('2024-02-01') })

      const response = await related(current._id).expect(200)

      expect(titlesOf(response.body.byGenre)).toEqual(['Newer', 'Older'])
    })

    test('includes poems stored with no status at all, as ~16k production poems are', async () => {
      const current = await makePoem({ title: 'Current', genre: 'love', authorId: alice._id, date: D('2024-05-01') })
      // Through the driver, bypassing the schema default — the shape of every
      // poem that predates the `status` field.
      await Poem.collection.insertOne({
        title: 'Legacy', poem: 'words', genre: 'love', likes: [], origin: 'user', authorId: bob._id, date: D('2024-04-01')
      })

      const response = await related(current._id).expect(200)

      expect(titlesOf(response.body.byGenre)).toEqual(['Legacy'])
    })

    test('is empty for a poem with no genre', async () => {
      const current = await makePoem({ title: 'Current', genre: undefined, authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'Somewhere', genre: 'love', authorId: bob._id, date: D('2024-04-01') })

      const response = await related(current._id).expect(200)

      expect(response.body.byGenre).toEqual([])
    })

    test('breaks a shared date by _id, descending', async () => {
      // Poems seeded in one batch share a `date` to the millisecond, which is
      // the shape of most of this collection — so without the `_id` tie-break
      // the six returned are arbitrary among the ties.
      //
      // Asserted on byGENRE deliberately. `{ authorId, date: -1, _id: -1 }` is a
      // declared index, so the byAuthor query has a third key that hands back
      // ties in _id order even with `_id` deleted from the sort spec, and the
      // same assertion there passes against the broken version. Nothing indexes
      // `genre`, so this path really does sort, and the spec is the only thing
      // deciding the order. (Same known limit as the follow lists.)
      const same = D('2024-04-01')
      const current = await makePoem({ title: 'Current', genre: 'love', authorId: alice._id, date: same })
      const first = await makePoem({ title: 'First', genre: 'love', authorId: bob._id, date: same })
      const second = await makePoem({ title: 'Second', genre: 'love', authorId: bob._id, date: same })

      const response = await related(current._id).expect(200)

      // Created later => larger _id => sorts first under _id DESC.
      expect(response.body.byGenre.map((row) => row.id)).toEqual([
        String(second._id), String(first._id)
      ])
    })

    test('caps the list at six', async () => {
      const current = await makePoem({ title: 'Current', genre: 'love', authorId: alice._id, date: D('2024-12-01') })
      for (let i = 1; i <= 8; i++) {
        await makePoem({ title: `Poem ${i}`, genre: 'love', authorId: bob._id, date: D(`2024-0${i}-01`) })
      }

      const response = await related(current._id).expect(200)

      expect(response.body.byGenre).toHaveLength(6)
    })
  })

  describe('a draft as the current poem', () => {
    test('404s for a stranger rather than 403 — a 403 confirms the slug exists', async () => {
      const draft = await makePoem({ title: 'Secret', slug: 'secret', authorId: alice._id, status: 'draft', date: D('2024-05-01') })
      await makePoem({ title: 'Public', authorId: alice._id, date: D('2024-04-01') })

      await related('secret').expect(404)
      await related(draft._id, makeToken(bob._id)).expect(404)
    })

    test('answers its author, and still lists only published neighbours', async () => {
      const draft = await makePoem({ title: 'Secret', authorId: alice._id, status: 'draft', date: D('2024-05-01') })
      await makePoem({ title: 'Public', authorId: alice._id, date: D('2024-04-01') })
      await makePoem({ title: 'Other Draft', authorId: alice._id, status: 'draft', date: D('2024-03-01') })

      const response = await related(draft._id, makeToken(alice._id)).expect(200)

      expect(titlesOf(response.body.byAuthor)).toEqual(['Public'])
    })
  })

  describe('the response shape', () => {
    test('carries what a card renders — and no poem bodies', async () => {
      const ai = await Author.create({ username: 'muse', name: 'Muse', slug: 'muse', origin: 'ai', type: 'ai' })
      const current = await makePoem({ title: 'Current', authorId: alice._id, date: D('2024-05-01') })
      await makePoem({ title: 'By The Machine', slug: 'by-the-machine', genre: 'love', authorId: ai._id, date: D('2024-04-01') })

      const response = await related(current._id).expect(200)
      const [row] = response.body.byGenre

      expect(row).toMatchObject({
        title: 'By The Machine',
        slug: 'by-the-machine',
        author: 'Muse',
        // The AI badge rides on every surface that names an author.
        authorType: 'ai'
      })
      expect(row.authorSlug).toBe('muse')
      expect(row.id).toEqual(expect.any(String))
      // Twelve full poem bodies on every poem page, to render twelve titles.
      expect(row.poem).toBeUndefined()
    })
  })
})
