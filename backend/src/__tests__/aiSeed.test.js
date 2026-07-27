const Author = require('../models/Author')
const Poem = require('../models/Poem')
const { upsertAiAuthor, addPoemForAuthor } = require('../../scripts/lib/aiSeed')

// mongoose is connected to an in-memory MongoDB by jest.setup.js, and each
// collection is cleared after every test.

const persona = () => ({
  username: 'example.poet',
  email: 'example.poet@fakemail.com',
  name: 'Example',
  surname: 'Poet',
  picture: null,
  bio: 'Writes quiet poems.',
  preferredGenres: ['Love', 'Nature']
})

describe('upsertAiAuthor', () => {
  test('creates an AI author with every schema flag correct', async () => {
    const { author, created } = await upsertAiAuthor(Author, persona())
    expect(created).toBe(true)
    expect(author.type).toBe('ai')
    expect(author.emailVerified).toBe(true)
    expect(author.testAccount).toBe(false)
    expect(author.fake).toBe(false)
    expect(author.slug).toBeTruthy()
    expect(author.passwordHash).toBeTruthy() // never blank
    expect(author.email).toBe('example.poet@fakemail.com')
    expect(author.preferredGenres).toEqual(['Love', 'Nature'])
  })

  test('is idempotent by username — re-running updates, never duplicates', async () => {
    await upsertAiAuthor(Author, persona())
    const second = await upsertAiAuthor(Author, { ...persona(), bio: 'Updated bio.' })
    expect(second.created).toBe(false)
    expect(second.author.bio).toBe('Updated bio.')
    expect(await Author.countDocuments({ username: 'example.poet' })).toBe(1)
  })

  test('rejects an email already owned by a different author', async () => {
    await upsertAiAuthor(Author, persona())
    await expect(
      upsertAiAuthor(Author, { ...persona(), username: 'someone.else' })
    ).rejects.toThrow(/already belongs to "example.poet"/)
  })

  test('two AI authors with distinct emails both succeed', async () => {
    await upsertAiAuthor(Author, persona())
    const other = await upsertAiAuthor(Author, {
      ...persona(), username: 'other.poet', email: 'other.poet@fakemail.com'
    })
    expect(other.created).toBe(true)
    expect(await Author.countDocuments({ type: 'ai' })).toBe(2)
  })

  test('generates a unique slug when the base slug is taken', async () => {
    const a = await upsertAiAuthor(Author, { username: 'a1', email: 'a1@fakemail.com', name: 'River Stone' })
    const b = await upsertAiAuthor(Author, { username: 'b2', email: 'b2@fakemail.com', name: 'River Stone' })
    expect(a.author.slug).not.toBe(b.author.slug)
  })
})

describe('addPoemForAuthor', () => {
  test('creates a poem wired to the AI author (authorId + origin:ai) and links it', async () => {
    const { author } = await upsertAiAuthor(Author, persona())
    const { poem, created } = await addPoemForAuthor(Poem, Author, author, {
      title: 'First Light', poem: 'The kettle hums.', genre: 'Nature', date: '2024-03-01'
    })
    expect(created).toBe(true)
    expect(String(poem.authorId)).toBe(String(author._id))
    expect(poem.origin).toBe('ai')
    expect(poem.slug).toBeTruthy()

    const reloaded = await Author.findById(author._id)
    expect(reloaded.poems.map(String)).toContain(String(poem._id))
  })

  test('is idempotent by (title, authorId)', async () => {
    const { author } = await upsertAiAuthor(Author, persona())
    const data = { title: 'Same Title', poem: 'x', genre: 'Love' }
    await addPoemForAuthor(Poem, Author, author, data)
    const again = await addPoemForAuthor(Poem, Author, author, data)
    expect(again.created).toBe(false)
    expect(await Poem.countDocuments({ authorId: author._id })).toBe(1)
  })
})
