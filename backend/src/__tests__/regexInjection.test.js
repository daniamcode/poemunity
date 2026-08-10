const request = require('supertest')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const { escapeRegex, MAX_REGEX_INPUT } = require('../utils/escapeRegex')

// ---------------------------------------------------------------------------
// User input that reaches a $regex.
//
// Two public, unauthenticated endpoints build a regex from a query parameter:
// `GET /authors?letter=` and `GET /poems?q=`. `?letter=` interpolated its value
// RAW, with `.toUpperCase()` standing in for sanitisation, which it is not.
//
// The assertions here are on the RESULT, not on the status code. A crafted
// value must return the honest answer — the authors whose names literally start
// with that string, i.e. none — rather than 500ing on an invalid pattern or
// quietly matching everything. A test asserting only `.expect(200)` passes
// against the vulnerable version, since a wildcard match is a perfectly
// successful response.
// ---------------------------------------------------------------------------

const poemFor = (authorId) => Poem.create({
  title: `Poem ${Math.random()}`,
  poem: 'content',
  genre: 'love',
  authorId,
  origin: 'user',
  date: new Date()
})

async function seed () {
  const ada = await Author.create({ name: 'Ada Brine', slug: 'ada-brine', type: 'user' })
  const bram = await Author.create({ name: 'Bram Ives', slug: 'bram-ives', type: 'user' })
  await poemFor(ada._id)
  await poemFor(bram._id)
  return { ada, bram }
}

const names = (res) => res.body.map(a => a.name)

describe('escapeRegex', () => {
  test('neutralises every metacharacter that enables backtracking or wildcards', () => {
    expect(escapeRegex('(a+)+$')).toBe('\\(a\\+\\)\\+\\$')
    expect(escapeRegex('.*')).toBe('\\.\\*')
    expect(escapeRegex('a|b')).toBe('a\\|b')
    expect(escapeRegex('[a-z]')).toBe('\\[a-z\\]')
    expect(escapeRegex('a{1,9}')).toBe('a\\{1,9\\}')
    expect(escapeRegex('a\\b')).toBe('a\\\\b')
  })

  test('an escaped pattern is a valid, literal RegExp', () => {
    // The other half: escaping must not itself produce something invalid.
    const hostile = '(a+)+$.*[|{'
    expect(() => new RegExp(`^${escapeRegex(hostile)}`)).not.toThrow()
    expect(new RegExp(`^${escapeRegex(hostile)}`).test(hostile)).toBe(true)
    expect(new RegExp(`^${escapeRegex(hostile)}`).test('anything else')).toBe(false)
  })

  test('leaves ordinary text alone, including accented letters', () => {
    expect(escapeRegex('Ada')).toBe('Ada')
    expect(escapeRegex('Ámbar')).toBe('Ámbar')
  })
})

describe('GET /authors?letter= — regex injection', () => {
  test('a wildcard matches nothing, rather than every author', async () => {
    // The vulnerability, stated as behaviour: raw, `^.*` matches everyone.
    await seed()

    const res = await request(app).get('/api/v1/authors?letter=' + encodeURIComponent('.*')).expect(200)

    expect(res.body).toEqual([])
  })

  test('a backtracking pattern is treated as LITERAL TEXT', async () => {
    // Asserted by finding an author whose name literally starts with it, not
    // by asserting an empty list: `^(A+)+$` matches no ordinary name either, so
    // an empty result passes against the raw version too. A red-check caught
    // that. Matching a literal is the only observable difference between "this
    // is a pattern" and "this is a string".
    await seed()
    const odd = await Author.create({ name: '(a+)+$ and other regexes', slug: 'odd-name', type: 'user' })
    await poemFor(odd._id)

    const res = await request(app)
      .get('/api/v1/authors?letter=' + encodeURIComponent('(a+)+$'))
      .expect(200)

    expect(names(res)).toEqual(['(a+)+$ and other regexes'])
  })

  test('an invalid pattern does not 500', async () => {
    // `a(` is not a valid regex. Raw, the query throws.
    await seed()

    const res = await request(app).get('/api/v1/authors?letter=' + encodeURIComponent('a(')).expect(200)

    expect(res.body).toEqual([])
  })

  test('an over-long value is TRUNCATED at the cap', async () => {
    // Observable only if the truncated part would have changed the answer. An
    // author matching the first MAX_REGEX_INPUT characters but NOT the tail:
    // truncated, the query finds them; uncompiled-whole, it does not. Asserting
    // an empty result for a long string of 'a's passed either way — red-check.
    await seed()
    const prefix = 'A'.repeat(MAX_REGEX_INPUT)
    const long = await Author.create({ name: `${prefix}XYZ`, slug: 'long-name', type: 'user' })
    await poemFor(long._id)

    const res = await request(app)
      .get('/api/v1/authors?letter=' + encodeURIComponent(`${prefix}QQQ`))
      .expect(200)

    expect(names(res)).toEqual([`${prefix}XYZ`])
  })

  test('and the endpoint still does its actual job', async () => {
    // The distractor for all of the above: a fix that simply rejected every
    // letter would pass every test so far.
    await seed()

    const res = await request(app).get('/api/v1/authors?letter=A').expect(200)

    expect(names(res)).toEqual(['Ada Brine'])
  })

  test('case-insensitively, as before', async () => {
    await seed()

    const res = await request(app).get('/api/v1/authors?letter=a').expect(200)

    expect(names(res)).toEqual(['Ada Brine'])
  })

  test('an accented initial still works — the charset was not narrowed', async () => {
    // Escaping fixes the vulnerability without restricting input to A-Z. A
    // charset allowlist would also be safe, but it would silently drop authors
    // this query can currently reach.
    const ambar = await Author.create({ name: 'Ámbar Ruiz', slug: 'ambar-ruiz', type: 'user' })
    await poemFor(ambar._id)

    const res = await request(app).get('/api/v1/authors?letter=' + encodeURIComponent('Á')).expect(200)

    expect(names(res)).toEqual(['Ámbar Ruiz'])
  })
})

describe('GET /poems?q= — the same input, already escaped', () => {
  // Pinned here alongside the letter tests because the helper is now shared:
  // a change to it must be seen to break both call sites, not just one.
  test('a wildcard search matches nothing rather than everything', async () => {
    const { ada } = await seed()
    await Poem.create({
      title: 'Aubade', slug: 'aubade-x', poem: 'c', genre: 'love', authorId: ada._id, origin: 'user', date: new Date()
    })

    // Unpaginated, this endpoint returns a bare array.
    const res = await request(app).get('/api/v1/poems?q=' + encodeURIComponent('.*')).expect(200)

    expect(res.body).toEqual([])
  })

  test('but a real search still finds the poem', async () => {
    const { ada } = await seed()
    await Poem.create({
      title: 'Aubade', slug: 'aubade-x', poem: 'c', genre: 'love', authorId: ada._id, origin: 'user', date: new Date()
    })

    const res = await request(app).get('/api/v1/poems?q=Aubade').expect(200)

    expect(res.body.map(p => p.title)).toContain('Aubade')
  })
})

describe('GET /poems?genre= — the third caller, raw until 2026-08-10', () => {
  // The genre filter is the one that is supposed to PARTITION the collection,
  // so a wildcard here does not merely return too much — it returns everything
  // while claiming to be a category page. The fixture holds three distinct
  // genres so a wrong implementation gives a DIFFERENT answer from a right one:
  // with a single genre, `.*` and `^love$` are indistinguishable.
  const seedGenres = async () => {
    const { ada } = await seed()
    await Poem.create({ title: 'L', slug: 'l-x', poem: 'c', genre: 'love', authorId: ada._id, origin: 'user', date: new Date() })
    await Poem.create({ title: 'F', slug: 'f-x', poem: 'c', genre: 'faith', authorId: ada._id, origin: 'user', date: new Date() })
    await Poem.create({ title: 'S', slug: 's-x', poem: 'c', genre: 'sorrow', authorId: ada._id, origin: 'user', date: new Date() })
  }

  const genres = (res) => res.body.map(p => p.genre).sort()

  test('a wildcard matches no genre rather than every genre', async () => {
    await seedGenres()

    const res = await request(app).get('/api/v1/poems?genre=' + encodeURIComponent('.*')).expect(200)

    // Raw, this returned love, faith, sorrow AND the two seeded by `seed()`.
    expect(res.body).toEqual([])
  })

  test('alternation is a literal, not an operator', async () => {
    await seedGenres()

    const res = await request(app).get('/api/v1/poems?genre=' + encodeURIComponent('love|faith')).expect(200)

    expect(res.body).toEqual([])
  })

  test('an invalid pattern is an empty result, not a 500', async () => {
    await seedGenres()

    // `a(` is an unterminated group: unescaped, the driver throws and the
    // endpoint answers 500 to anyone who types a bracket.
    const res = await request(app).get('/api/v1/poems?genre=' + encodeURIComponent('a(')).expect(200)

    expect(res.body).toEqual([])
  })

  test('a genre containing a metacharacter matches ITSELF', async () => {
    // Proving the escaping is literal needs a genre that literally contains
    // one — otherwise "matches nothing" is satisfied by a filter that is simply
    // broken for every input.
    const { ada } = await seed()
    await Poem.create({ title: 'M', slug: 'm-x', poem: 'c', genre: 'c++', authorId: ada._id, origin: 'user', date: new Date() })

    const res = await request(app).get('/api/v1/poems?genre=' + encodeURIComponent('c++')).expect(200)

    expect(res.body.map(p => p.title)).toEqual(['M'])
  })

  test('an ordinary genre still matches, whatever the casing', async () => {
    // The distractor for a "fix" that drops the regex for exact equality: the
    // case-insensitive anchored match is why /Love finds poems filed as love,
    // and the collection genuinely holds mixed-case genres.
    await seedGenres()

    const lower = await request(app).get('/api/v1/poems?genre=love').expect(200)
    const upper = await request(app).get('/api/v1/poems?genre=LOVE').expect(200)

    // Distinct genres, not the row count: `seed()` contributes love poems of
    // its own, so counting rows here would pin the fixture rather than the
    // filter. What matters is that faith and sorrow are absent from both.
    expect([...new Set(genres(lower))]).toEqual(['love'])
    expect([...new Set(genres(upper))]).toEqual(['love'])
    expect(upper.body.length).toBe(lower.body.length)
  })

  test('input past the cap is truncated rather than compiled', async () => {
    const res = await request(app)
      .get('/api/v1/poems?genre=' + encodeURIComponent('a'.repeat(MAX_REGEX_INPUT + 50)))
      .expect(200)

    expect(res.body).toEqual([])
  })
})
