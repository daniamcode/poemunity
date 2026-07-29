const request = require('supertest')
const { app } = require('../../app')
const Poem = require('../models/Poem')
const Author = require('../models/Author')

// GET /api/v1/poem/:poemId/next
//
// The walk follows the DIMENSION the reader is browsing (genre or author) and
// never changes it. Buckets — one genre, one author — partition the collection,
// which is what makes a lap visit every poem exactly once.
//
//   1. same-bucket : next poem in this bucket, by date DESC / _id DESC
//   2. next-bucket : first poem of the next bucket alphabetically
//   3. wrap        : first poem of the first bucket alphabetically

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

function next (idOrSlug, dimension) {
  const url = `/api/v1/poem/${idOrSlug}/next`
  return request(app).get(dimension ? `${url}?dimension=${dimension}` : url)
}

describe('GET /api/v1/poem/:poemId/next', () => {
  let alice
  let bob

  beforeEach(async () => {
    // 'Alice Adams' sorts before 'Bob Brown' — the bucket walk is alphabetical.
    alice = await makeAuthor('alice', 'Alice Adams')
    bob = await makeAuthor('bob', 'Bob Brown')
  })

  test('404 when the current poem does not exist', async () => {
    const response = await next('507f1f77bcf86cd799439011').expect(404)
    expect(response.body.error).toBe('poem not found')
  })

  test('404 for a malformed id (neither ObjectId nor slug)', async () => {
    await next('definitely-not-a-poem').expect(404)
  })

  test('resolves the current poem by slug as well as by id', async () => {
    const current = await makePoem({ title: 'A', slug: 'poem-a', authorId: alice._id, date: D('2024-03-01') })
    const expected = await makePoem({ title: 'B', authorId: alice._id, date: D('2024-02-01') })

    const bySlug = await next('poem-a').expect(200)
    const byId = await next(current._id).expect(200)

    expect(bySlug.body.poem.id).toBe(String(expected._id))
    expect(bySlug.body).toEqual(byId.body)
  })

  test('serializes the poem like GET /poem/:id, with the populated author fields', async () => {
    const current = await makePoem({ title: 'A', authorId: alice._id, date: D('2024-03-01') })
    await makePoem({ title: 'B', authorId: alice._id, date: D('2024-02-01') })

    const { body } = await next(current._id).expect(200)
    expect(body.poem).toHaveProperty('id')
    expect(body.poem).toHaveProperty('title')
    expect(body.poem).toHaveProperty('poem')
    expect(body.poem).toHaveProperty('genre')
    expect(body.poem).toHaveProperty('likes')
    expect(body.poem.author).toBe('Alice Adams')
    expect(body.poem.userId).toBe(String(alice._id))
    expect(body.poem).not.toHaveProperty('authorId')
  })

  describe('dimension: genre', () => {
    test('continues the current genre, ignoring newer poems in other genres', async () => {
      const current = await makePoem({ title: 'Love A', genre: 'love', authorId: alice._id, date: D('2024-03-01') })
      // Newer than the expected answer, but a different genre — must not win.
      await makePoem({ title: 'Sad X', genre: 'sad', authorId: alice._id, date: D('2024-02-15') })
      const expected = await makePoem({ title: 'Love B', genre: 'love', authorId: bob._id, date: D('2024-02-01') })

      const { body } = await next(current._id, 'genre').expect(200)
      expect(body.scope).toBe('same-bucket')
      expect(body.poem.id).toBe(String(expected._id))
    })

    test("'Love' and 'love' are ONE bucket, not two", async () => {
      const current = await makePoem({ title: 'A', genre: 'Love', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'B', genre: 'lOvE', authorId: bob._id, date: D('2024-02-01') })

      const { body } = await next(current._id, 'genre').expect(200)
      expect(body.scope).toBe('same-bucket')
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('crosses to the next genre alphabetically at its newest poem', async () => {
      const current = await makePoem({ title: 'Happy last', genre: 'happy', authorId: alice._id, date: D('2024-03-01') })
      // 'happy' < 'love' < 'sad', so 'love' must win even though this 'sad'
      // poem is much newer.
      await makePoem({ title: 'Sad newest', genre: 'sad', authorId: bob._id, date: D('2024-06-01') })
      const expected = await makePoem({ title: 'Love newest', genre: 'love', authorId: bob._id, date: D('2024-02-01') })
      await makePoem({ title: 'Love older', genre: 'love', authorId: bob._id, date: D('2024-01-01') })

      const { body } = await next(current._id, 'genre').expect(200)
      expect(body.scope).toBe('next-bucket')
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('wraps from the last genre alphabetically to the first', async () => {
      const expected = await makePoem({ title: 'Happy newest', genre: 'happy', authorId: alice._id, date: D('2024-02-01') })
      await makePoem({ title: 'Happy older', genre: 'happy', authorId: alice._id, date: D('2024-01-01') })
      const current = await makePoem({ title: 'Sad only', genre: 'sad', authorId: bob._id, date: D('2024-03-01') })

      const { body } = await next(current._id, 'genre').expect(200)
      expect(body.scope).toBe('wrap')
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('a single-genre collection wraps to its own newest poem', async () => {
      const newest = await makePoem({ title: 'Newest', genre: 'love', authorId: alice._id, date: D('2024-03-01') })
      const oldest = await makePoem({ title: 'Oldest', genre: 'love', authorId: bob._id, date: D('2024-01-01') })

      const { body } = await next(oldest._id, 'genre').expect(200)
      expect(body.scope).toBe('wrap')
      expect(body.poem.id).toBe(String(newest._id))
    })
  })

  describe('dimension: author', () => {
    test('continues the current author, ignoring newer poems by others', async () => {
      const current = await makePoem({ title: 'Alice A', authorId: alice._id, date: D('2024-03-01') })
      await makePoem({ title: 'Bob X', authorId: bob._id, date: D('2024-02-15') })
      const expected = await makePoem({ title: 'Alice B', authorId: alice._id, date: D('2024-02-01') })

      const { body } = await next(current._id, 'author').expect(200)
      expect(body.scope).toBe('same-bucket')
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('crosses to the next author alphabetically at their newest poem', async () => {
      const current = await makePoem({ title: 'Alice last', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Bob newest', authorId: bob._id, date: D('2024-02-01') })
      await makePoem({ title: 'Bob older', authorId: bob._id, date: D('2024-01-01') })

      const { body } = await next(current._id, 'author').expect(200)
      expect(body.scope).toBe('next-bucket')
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('orders author buckets by display name, not by insertion order or id', async () => {
      // Created last, but 'Aaron Zebra' sorts first.
      const aaron = await makeAuthor('zzz-handle', 'Aaron Zebra')
      const current = await makePoem({ title: 'Alice last', authorId: alice._id, date: D('2024-03-01') })
      const aaronPoem = await makePoem({ title: 'Aaron newest', authorId: aaron._id, date: D('2024-02-01') })
      await makePoem({ title: 'Bob newest', authorId: bob._id, date: D('2024-06-01') })

      // 'Aaron Zebra' < 'Alice Adams' < 'Bob Brown': from Alice the next bucket
      // is Bob...
      const { body } = await next(current._id, 'author').expect(200)
      expect(body.scope).toBe('next-bucket')
      expect(body.poem.title).toBe('Bob newest')

      // ...and from Bob (the last bucket) it wraps to Aaron, not back to Alice.
      const fromBob = await next(body.poem.id, 'author').expect(200)
      expect(fromBob.body.scope).toBe('wrap')
      expect(fromBob.body.poem.id).toBe(String(aaronPoem._id))
    })

    test('wraps from the last author alphabetically to the first', async () => {
      const expected = await makePoem({ title: 'Alice newest', authorId: alice._id, date: D('2024-02-01') })
      await makePoem({ title: 'Alice older', authorId: alice._id, date: D('2024-01-01') })
      const current = await makePoem({ title: 'Bob only', authorId: bob._id, date: D('2024-03-01') })

      const { body } = await next(current._id, 'author').expect(200)
      expect(body.scope).toBe('wrap')
      expect(body.poem.id).toBe(String(expected._id))
    })
  })

  describe('dimension default', () => {
    test('omitting ?dimension= walks genres, not authors', async () => {
      const current = await makePoem({ title: 'Love A', genre: 'love', authorId: alice._id, date: D('2024-03-01') })
      const genreAnswer = await makePoem({ title: 'Love B', genre: 'love', authorId: bob._id, date: D('2024-02-01') })
      const authorAnswer = await makePoem({ title: 'Alice sad', genre: 'sad', authorId: alice._id, date: D('2024-01-01') })

      const defaulted = await next(current._id).expect(200)
      expect(defaulted.body.poem.id).toBe(String(genreAnswer._id))

      // Same request with the dimension stated, to prove the default IS genre...
      const explicitGenre = await next(current._id, 'genre').expect(200)
      expect(explicitGenre.body).toEqual(defaulted.body)

      // ...and that the other dimension really would have answered differently.
      const explicitAuthor = await next(current._id, 'author').expect(200)
      expect(explicitAuthor.body.poem.id).toBe(String(authorAnswer._id))
    })

    test('an unrecognised dimension falls back to genre rather than erroring', async () => {
      const current = await makePoem({ title: 'Love A', genre: 'love', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Love B', genre: 'love', authorId: bob._id, date: D('2024-02-01') })

      const { body } = await next(current._id, 'nonsense').expect(200)
      expect(body.poem.id).toBe(String(expected._id))
    })
  })

  describe('guards', () => {
    test('a poem with no genre falls back to the global date order', async () => {
      const current = await makePoem({ title: 'Malformed', genre: undefined, authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Next by date', genre: 'sad', authorId: bob._id, date: D('2024-02-01') })
      await makePoem({ title: 'Older', genre: 'love', authorId: bob._id, date: D('2024-01-01') })

      const { body } = await next(current._id, 'genre').expect(200)
      // It degrades instead of dead-ending, and is labelled from the
      // destination's bucket rather than its own (which does not exist).
      expect(body.scope).toBe('next-bucket')
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('a whitespace-only genre degrades the same way', async () => {
      const current = await makePoem({ title: 'Malformed', genre: '   ', authorId: alice._id, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Next by date', genre: 'sad', authorId: bob._id, date: D('2024-02-01') })

      const { body } = await next(current._id, 'genre').expect(200)
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('a genreless poem that is last by date wraps to the newest poem overall', async () => {
      const newest = await makePoem({ title: 'Newest', genre: 'love', authorId: bob._id, date: D('2024-05-01') })
      const current = await makePoem({ title: 'Malformed oldest', genre: '', authorId: alice._id, date: D('2024-01-01') })

      const { body } = await next(current._id, 'genre').expect(200)
      expect(body.scope).toBe('wrap')
      expect(body.poem.id).toBe(String(newest._id))
    })

    test('a poem with no author degrades the same way in the author dimension', async () => {
      const current = await makePoem({ title: 'Orphan', authorId: undefined, date: D('2024-03-01') })
      const expected = await makePoem({ title: 'Next by date', authorId: alice._id, date: D('2024-02-01') })

      const { body } = await next(current._id, 'author').expect(200)
      expect(body.poem.id).toBe(String(expected._id))
    })

    test('returns { poem: null, scope: null } for a single-poem collection', async () => {
      const only = await makePoem({ title: 'Only', authorId: alice._id, date: D('2024-01-01') })

      const { body } = await next(only._id, 'genre').expect(200)
      expect(body).toEqual({ poem: null, scope: null })

      const asAuthor = await next(only._id, 'author').expect(200)
      expect(asAuthor.body).toEqual({ poem: null, scope: null })
    })
  })

  describe('total order inside a bucket', () => {
    test('the _id tie-break makes poems sharing a date deterministic and non-repeating', async () => {
      const sameDate = D('2024-05-05')
      // Sequential inserts ⇒ increasing _id, so DESC walks them in reverse.
      const first = await makePoem({ title: 'Tie 1', genre: 'love', authorId: alice._id, date: sameDate })
      const second = await makePoem({ title: 'Tie 2', genre: 'love', authorId: alice._id, date: sameDate })
      const third = await makePoem({ title: 'Tie 3', genre: 'love', authorId: alice._id, date: sameDate })

      const afterThird = await next(third._id, 'genre').expect(200)
      expect(afterThird.body.poem.id).toBe(String(second._id))

      const afterSecond = await next(second._id, 'genre').expect(200)
      expect(afterSecond.body.poem.id).toBe(String(first._id))
      // Without the tie-break this would return `third` again and the two would
      // ping-pong forever.
      expect(afterSecond.body.poem.id).not.toBe(String(third._id))

      const afterFirst = await next(first._id, 'genre').expect(200)
      expect(afterFirst.body.scope).toBe('wrap')
      expect(afterFirst.body.poem.id).toBe(String(third._id))
    })

    test('undated poems sort last within a bucket and are still reached', async () => {
      const dated = await makePoem({ title: 'Dated', genre: 'love', authorId: alice._id, date: D('2024-01-01') })
      const undatedA = await makePoem({ title: 'Undated A', genre: 'love', authorId: alice._id })
      const undatedB = await makePoem({ title: 'Undated B', genre: 'love', authorId: alice._id })

      const step1 = await next(dated._id, 'genre').expect(200)
      expect(step1.body.poem.id).toBe(String(undatedB._id))

      const step2 = await next(step1.body.poem.id, 'genre').expect(200)
      expect(step2.body.poem.id).toBe(String(undatedA._id))

      const step3 = await next(step2.body.poem.id, 'genre').expect(200)
      expect(step3.body.scope).toBe('wrap')
      expect(step3.body.poem.id).toBe(String(dated._id))
    })
  })

  describe('the walk is total', () => {
    // THE headline guarantee, and the whole reason the design follows a
    // dimension instead of widening scope: buckets partition the collection, so
    // one lap visits every poem exactly once. The fixture deliberately
    // interleaves authors AND genres and includes a run of identical dates —
    // the exact combination that broke the earlier widening cascade.
    async function seedInterleaved (authors) {
      const genres = ['love', 'sad', 'happy']
      const sharedDate = D('2024-04-04')
      const created = []
      for (let i = 0; i < 9; i++) {
        created.push(await makePoem({
          title: `Poem ${i}`,
          authorId: authors[i % authors.length]._id,
          genre: genres[i % genres.length],
          date: i < 3 ? sharedDate : D(`2024-0${(i % 9) + 1}-01`)
        }))
      }
      return created
    }

    async function assertFullLap (created, dimension) {
      const allIds = created.map((p) => String(p._id)).sort()

      for (const start of created) {
        const startId = String(start._id)
        const visited = [startId]
        let cursor = startId

        for (let step = 0; step < created.length; step++) {
          const { body } = await next(cursor, dimension).expect(200)
          expect(body.poem).not.toBeNull()
          // A poem is never its own next — that would dead-end the control.
          expect(body.poem.id).not.toBe(cursor)
          cursor = body.poem.id
          if (cursor === startId) break
          visited.push(cursor)
        }

        // Back at the start, having seen every poem exactly once.
        expect(cursor).toBe(startId)
        expect(new Set(visited).size).toBe(created.length)
        expect([...visited].sort()).toEqual(allIds)
      }
    }

    test('dimension=genre: every start visits every poem exactly once', async () => {
      const created = await seedInterleaved([alice, bob])
      await assertFullLap(created, 'genre')
    })

    test('dimension=author: every start visits every poem exactly once', async () => {
      const carol = await makeAuthor('carol', 'Carol Clark')
      const created = await seedInterleaved([alice, bob, carol])
      await assertFullLap(created, 'author')
    })

    test('dimension=genre with three authors interleaved: still one clean lap', async () => {
      const carol = await makeAuthor('carol', 'Carol Clark')
      const created = await seedInterleaved([alice, bob, carol])
      await assertFullLap(created, 'genre')
    })

    test('mixed-case genres are one bucket, so the lap stays clean', async () => {
      // The real reason bucket keys are lowercased. If 'Love' and 'love' were
      // listed as two buckets, each would still match ALL love poems (membership
      // is case-insensitive, mirroring the list filter), the buckets would
      // overlap instead of partition, and the lap would revisit poems.
      // Spelling order matters: the OLDEST poem of each bucket is the one whose
      // key decides where the walk crosses to, so the odd casings go there.
      const created = []
      const spellings = ['LOVE', 'Love', 'love', 'Sad', 'sad']
      for (let i = 0; i < spellings.length; i++) {
        created.push(await makePoem({
          title: `Poem ${i}`,
          authorId: (i % 2 === 0 ? alice : bob)._id,
          genre: spellings[i],
          date: D(`2024-0${i + 1}-01`)
        }))
      }

      await assertFullLap(created, 'genre')
    })
  })
})
