const request = require('supertest')
const mongoose = require('mongoose')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')

// ---------------------------------------------------------------------------
// The author listings count poems through TWO different aggregation shapes, and
// these tests exist because the two must agree on every rule.
//
//   /authors?limit= and /authors/letters group the POEMS once and join authors
//   onto the result.
//   /authors?letter= keeps the per-author $lookup, because a name filter
//   narrows to ~100 authors before the lookup and the grouped shape is then 8x
//   SLOWER (measured — see countedAuthorsPipeline).
//
// A rule enforced in one shape and not the other is invisible until somebody
// browses by letter and gets a different answer to the same question. So the
// interesting assertions here are the ones applied to BOTH endpoints.
// ---------------------------------------------------------------------------

const poem = (authorId, overrides = {}) => Poem.create({
  title: `Poem ${Math.random()}`,
  poem: 'content',
  genre: 'love',
  authorId,
  origin: 'user',
  date: new Date(),
  ...overrides
})

const names = (res) => res.body.map(a => a.name)

describe('Author listings — counting', () => {
  describe('the filter is applied before the limit', () => {
    test('a test account with the most poems does not shrink the top list', async () => {
      // THE regression this inversion could introduce. Grouping poems first
      // makes it tempting to $sort/$limit before joining the author — but then
      // a filtered-out author inside the limit is dropped AFTER the cut, and
      // the list silently comes back one row short instead of admitting the
      // next real author.
      const hidden = await Author.create({ name: 'Hidden Tester', slug: 'hidden-t', type: 'user', testAccount: true })
      for (let i = 0; i < 5; i++) await poem(hidden._id)

      const real = []
      for (let i = 0; i < 3; i++) {
        const a = await Author.create({ name: `Real ${i}`, slug: `real-${i}`, type: 'user' })
        await poem(a._id)
        real.push(a)
      }

      const res = await request(app).get('/api/v1/authors?limit=3').expect(200)

      expect(res.body).toHaveLength(3)
      expect(names(res)).not.toContain('Hidden Tester')
      expect(names(res).sort()).toEqual(['Real 0', 'Real 1', 'Real 2'])
    })

    test('and the same account is absent from the letter index', async () => {
      const hidden = await Author.create({ name: 'Zeta Tester', slug: 'zeta-t', type: 'user', testAccount: true })
      await poem(hidden._id)

      const letters = await request(app).get('/api/v1/authors/letters').expect(200)

      expect(letters.body).not.toContain('Z')
    })
  })

  describe('drafts do not count, in either shape', () => {
    let author

    beforeEach(async () => {
      author = await Author.create({ name: 'Quilla Drafts', slug: 'quilla-d', type: 'user' })
    })

    test('an author whose only poem is a draft is in no listing', async () => {
      await poem(author._id, { status: 'draft' })

      const top = await request(app).get('/api/v1/authors?limit=50').expect(200)
      const letters = await request(app).get('/api/v1/authors/letters').expect(200)
      const byLetter = await request(app).get('/api/v1/authors?letter=Q').expect(200)

      expect(names(top)).not.toContain('Quilla Drafts')
      expect(letters.body).not.toContain('Q')
      expect(names(byLetter)).not.toContain('Quilla Drafts')
    })

    test('a draft is not added to a published count', async () => {
      await poem(author._id, { status: 'published' })
      await poem(author._id, { status: 'draft' })
      // The distractor: a poem stored with NO status key at all, which is how
      // all ~16k pre-existing poems look. It must count as published.
      await Poem.collection.insertOne({
        title: 'Legacy', poem: 'c', genre: 'love', authorId: author._id, origin: 'user', date: new Date()
      })

      const top = await request(app).get('/api/v1/authors?limit=50').expect(200)
      const byLetter = await request(app).get('/api/v1/authors?letter=Q').expect(200)

      const inTop = top.body.find(a => a.name === 'Quilla Drafts')
      const inLetter = byLetter.body.find(a => a.name === 'Quilla Drafts')

      expect(inTop.count).toBe(2)
      // Both shapes must agree, or browsing by letter contradicts the top list.
      expect(inLetter.count).toBe(2)
    })
  })

  test('poems with no author produce no phantom row', async () => {
    // Grouping by authorId buckets these under `null`. Left unhandled the join
    // yields a row with no name and a real count.
    await Poem.collection.insertOne({
      title: 'Orphan', poem: 'c', genre: 'love', origin: 'user', date: new Date(), status: 'published'
    })
    await Poem.collection.insertOne({
      title: 'Orphan 2', poem: 'c', genre: 'love', authorId: null, origin: 'user', date: new Date(), status: 'published'
    })

    const res = await request(app).get('/api/v1/authors?limit=50').expect(200)

    expect(res.body.every(a => a.name)).toBe(true)
    expect(res.body.every(a => a.id && a.id !== 'null')).toBe(true)
  })

  test('an author deleted after publishing leaves no headless row', async () => {
    const ghost = await Author.create({ name: 'Ghost Writer', slug: 'ghost-w', type: 'user' })
    await poem(ghost._id)
    await Author.findByIdAndDelete(ghost._id)

    const res = await request(app).get('/api/v1/authors?limit=50').expect(200)

    expect(names(res)).not.toContain('Ghost Writer')
    expect(res.body.every(a => a.name)).toBe(true)
  })

  test('the top list is ordered by count, and ties are stable across requests', async () => {
    // Authors tie on poem count constantly, and this is a $limit — without a
    // tie-break, which authors make the cut can differ between two identical
    // requests.
    const many = await Author.create({ name: 'Many Poems', slug: 'many-p', type: 'user' })
    for (let i = 0; i < 4; i++) await poem(many._id)

    for (let i = 0; i < 6; i++) {
      const a = await Author.create({ name: `Tied ${i}`, slug: `tied-${i}`, type: 'user' })
      await poem(a._id)
    }

    const first = await request(app).get('/api/v1/authors?limit=4').expect(200)
    const second = await request(app).get('/api/v1/authors?limit=4').expect(200)

    expect(first.body[0].name).toBe('Many Poems')
    expect(first.body[0].count).toBe(4)
    expect(names(first)).toEqual(names(second))
  })

  test('the type filter still applies to both shapes', async () => {
    const ai = await Author.create({ name: 'Aria Bot', slug: 'aria-bot', type: 'ai' })
    await poem(ai._id)
    const human = await Author.create({ name: 'Alan Human', slug: 'alan-h', type: 'user' })
    await poem(human._id)

    const top = await request(app).get('/api/v1/authors?limit=50&type=ai').expect(200)
    const byLetter = await request(app).get('/api/v1/authors?letter=A&type=ai').expect(200)

    expect(names(top)).toEqual(['Aria Bot'])
    expect(names(byLetter)).toEqual(['Aria Bot'])
  })

  test('an author with no name is not offered as a letter', async () => {
    // `name` is optional — the listings fall back to `username` for display,
    // but a missing name has no first letter to file under.
    const nameless = await Author.create({ username: 'nameless', slug: 'nameless', type: 'user' })
    await poem(nameless._id)

    const letters = await request(app).get('/api/v1/authors/letters').expect(200)
    const top = await request(app).get('/api/v1/authors?limit=50').expect(200)

    expect(letters.body.every(l => /^[A-Z]$/.test(l))).toBe(true)
    // Still listed in the top authors, under the username fallback.
    expect(names(top)).toContain('nameless')
  })

  test('the two shapes agree on which letters have authors', async () => {
    // The strongest cross-check available: every letter /letters offers must
    // return at least one author from the OTHER pipeline, and every author the
    // other pipeline can return must have its letter offered.
    for (const name of ['Bea Stone', 'Bram Ives', 'Cleo Vane', 'Dara Ash']) {
      const a = await Author.create({ name, slug: name.toLowerCase().replace(' ', '-'), type: 'user' })
      await poem(a._id)
    }
    const draftOnly = await Author.create({ name: 'Enid Quiet', slug: 'enid-q', type: 'user' })
    await poem(draftOnly._id, { status: 'draft' })

    const letters = await request(app).get('/api/v1/authors/letters').expect(200)

    expect(letters.body).toEqual(expect.arrayContaining(['B', 'C', 'D']))
    expect(letters.body).not.toContain('E')

    for (const letter of letters.body) {
      const res = await request(app).get(`/api/v1/authors?letter=${letter}`).expect(200)
      expect(res.body.length).toBeGreaterThan(0)
    }
  })

  test('a huge limit is still capped', async () => {
    const author = await Author.create({ name: 'Cap Test', slug: 'cap-t', type: 'user' })
    await poem(author._id)

    const res = await request(app).get('/api/v1/authors?limit=99999').expect(200)

    expect(res.body.length).toBeLessThanOrEqual(100)
  })
})

describe('Author listings — the aggregation shapes themselves', () => {
  test('an ObjectId authorId stored as a STRING is not silently uncounted', async () => {
    // Poem is strict:false, so a script writing `authorId` as a string persists
    // it. The per-author $lookup compares with $expr (no type coercion) and the
    // grouped shape buckets by raw value — both would drop it, which is the
    // honest current behaviour. Pinned so the day someone "fixes" one shape,
    // this test says the other needs the same fix.
    const author = await Author.create({ name: 'Stringy Ref', slug: 'stringy', type: 'user' })
    await Poem.collection.insertOne({
      title: 'Stringy', poem: 'c', genre: 'love', authorId: String(author._id), origin: 'user', date: new Date()
    })

    const top = await request(app).get('/api/v1/authors?limit=50').expect(200)
    const byLetter = await request(app).get('/api/v1/authors?letter=S').expect(200)

    expect(names(top)).not.toContain('Stringy Ref')
    expect(names(byLetter)).not.toContain('Stringy Ref')
  })

  test('counts survive an author id that matches no poem', async () => {
    const lonely = new mongoose.Types.ObjectId()
    await Author.create({ _id: lonely, name: 'Lonely One', slug: 'lonely', type: 'user' })

    const res = await request(app).get('/api/v1/authors?limit=50').expect(200)

    expect(names(res)).not.toContain('Lonely One')
  })
})
