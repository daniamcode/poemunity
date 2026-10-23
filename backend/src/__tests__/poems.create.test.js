const request = require('supertest')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { app } = require('../../app')
const User = require('../models/User')
const Poem = require('../models/Poem')

describe('Poems API - Create and Update', () => {
  let testUser
  let authToken

  beforeEach(async () => {
    // Create a test user and generate auth token
    const passwordHash = await bcrypt.hash('password123', 10)
    testUser = await User.create({
      username: 'testuser',
      name: 'Test User',
      email: 'test@example.com',
      passwordHash,
      picture: 'https://example.com/pic.jpg'
    })

    const userForToken = {
      id: testUser._id,
      username: testUser.username,
      picture: testUser.picture
    }

    authToken = jwt.sign(
      userForToken,
      process.env.SECRET,
      {
        expiresIn: 60 * 60 * 24 * 7
      }
    )

    // Make testUser the admin for bulk PATCH tests
    process.env.REACT_APP_ADMIN = testUser._id.toString()
  })

  describe('POST /api/v1/poems', () => {
    /**
     * A POEM NEEDS WORDS AND A NAME.
     *
     * `Poem` declares neither field as required, so the API stored empty poems
     * — which are then listed like any other, get a detail page, and are
     * emitted into the sitemap, with a slug derived from an absent title.
     *
     * Every assertion here checks the COLLECTION as well as the status. The
     * handler builds and saves the document, so a version that answered 400
     * after saving would satisfy a status-only test.
     */
    describe('rejects a poem with nothing in it', () => {
      const post = (body) => request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      test.each([
        ['no title at all', { poem: 'Some verse', genre: 'Love' }],
        ['an empty title', { title: '', poem: 'Some verse', genre: 'Love' }],
        ['a title of spaces', { title: '   ', poem: 'Some verse', genre: 'Love' }],
        ['no body at all', { title: 'Aubade', genre: 'Love' }],
        ['an empty body', { title: 'Aubade', poem: '', genre: 'Love' }],
        ['a body of whitespace', { title: 'Aubade', poem: ' \n\t ', genre: 'Love' }]
      ])('%s is a 400 and persists nothing', async (_label, body) => {
        const before = await Poem.countDocuments()

        await post(body).expect(400)

        expect(await Poem.countDocuments()).toBe(before)
      })

      test('a real poem still saves, with both fields trimmed', async () => {
        // The distractor for a check that rejects too much — and it pins the
        // trimming, so a padded title cannot pass the guard and then be stored
        // with the padding intact.
        const res = await post({ title: '  Aubade  ', poem: '  Some verse  ', genre: 'Love' }).expect(201)

        expect(res.body.title).toBe('Aubade')
        expect(res.body.poem).toBe('Some verse')
      })
    })

    test('should create a new poem successfully', async () => {
      const newPoem = {
        title: 'New Poem',
        poem: 'This is a beautiful poem about nature',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      expect(response.body.title).toBe('New Poem')
      expect(response.body.poem).toBe('This is a beautiful poem about nature')
      expect(response.body.genre).toBe('love')
      expect(response.body.author).toBe('Test User')
      expect(response.body.userId).toBe(testUser._id.toString())
      expect(response.body.picture).toBe('https://example.com/pic.jpg')
      // The create response also carries the freshly recomputed ranking (the new
      // poem credited its author) so the client refreshes the sidebar in the same
      // round-trip — the poem fields stay top-level, ranking is a sibling.
      expect(Array.isArray(response.body.ranking)).toBe(true)
    })

    test('should add poem to user poems array', async () => {
      const newPoem = {
        title: 'Test Poem',
        poem: 'Content',
        genre: 'sad',
        date: new Date()
      }

      await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      const updatedUser = await User.findById(testUser._id)
      expect(updatedUser.poems).toHaveLength(1)
    })

    // The category dropdown constrains the UI only: this endpoint spreads the
    // request body into a `strict: false` model, so before validation any
    // client could store an invented genre. The poem then had a URL but no
    // category nav entry and no sitemap entry — orphaned from the moment it
    // was written, exactly like the four categories the 140-category migration
    // stranded (168 poems).
    test('rejects a genre outside the curated category list', async () => {
      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Orphan', poem: 'Content', genre: 'notacategory', date: new Date() })
        .expect(400)

      expect(response.body.error).toMatch(/genre/i)
      expect(await Poem.findOne({ title: 'Orphan' })).toBeNull()
    })

    test('rejects a missing genre', async () => {
      await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'No Genre', poem: 'Content', date: new Date() })
        .expect(400)
    })

    test('stores the slug when given a category display name', async () => {
      // Seed data and hand-made calls use display names; storing 'Sorrow &
      // Grieving' beside 'sorrow-and-grieving' would split one category in two.
      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Display Name', poem: 'Content', genre: 'Sorrow & Grieving', date: new Date() })
        .expect(201)

      expect(response.body.genre).toBe('sorrow-and-grieving')
    })

    test('should create poem in database', async () => {
      const newPoem = {
        title: 'Database Poem',
        poem: 'This poem should be saved',
        genre: 'hope',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      const poemInDb = await Poem.findById(response.body.id)
      expect(poemInDb).toBeDefined()
      expect(poemInDb.title).toBe('Database Poem')
    })

    test('should set author as display name of authenticated user', async () => {
      const newPoem = {
        title: 'Author Test',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.author).toBe(testUser.name)
    })

    test('should set picture from authenticated user', async () => {
      const newPoem = {
        title: 'Picture Test',
        poem: 'Content',
        genre: 'sad',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.picture).toBe(testUser.picture)
    })

    test('should initialize poem with empty likes array', async () => {
      const newPoem = {
        title: 'Likes Test',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.likes).toBeDefined()
      expect(Array.isArray(response.body.likes)).toBe(true)
      expect(response.body.likes).toHaveLength(0)
    })

    test('should return 401 without authentication token', async () => {
      const newPoem = {
        title: 'Unauthorized Poem',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .send(newPoem)
        .expect(401)

      expect(response.body.error).toBe('token missing or invalid')
    })

    test('should return 401 with invalid token', async () => {
      const newPoem = {
        title: 'Invalid Token Poem',
        poem: 'Content',
        genre: 'sad',
        date: new Date()
      }

      await request(app)
        .post('/api/v1/poems')
        .set('Authorization', 'Bearer invalid-token')
        .send(newPoem)
        .expect(401)
    })

    test('should create multiple poems for same user', async () => {
      const poem1 = {
        title: 'First Poem',
        poem: 'Content 1',
        genre: 'love',
        date: new Date()
      }

      const poem2 = {
        title: 'Second Poem',
        poem: 'Content 2',
        genre: 'sad',
        date: new Date()
      }

      await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(poem1)
        .expect(201)

      await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(poem2)
        .expect(201)

      const updatedUser = await User.findById(testUser._id)
      expect(updatedUser.poems).toHaveLength(2)
    })

    test('should handle poems with different genres', async () => {
      // All real categories — the API rejects anything outside the curated list.
      const genres = ['love', 'sad', 'hope', 'anger', 'nature']

      for (const genre of genres) {
        const response = await request(app)
          .post('/api/v1/poems')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            title: `${genre} poem`,
            poem: `Content about ${genre}`,
            genre,
            date: new Date()
          })
          .expect(201)

        expect(response.body.genre).toBe(genre)
      }
    })

    test('should handle long poem content', async () => {
      const longContent = 'This is a very long poem. '.repeat(100)
      const newPoem = {
        title: 'Long Poem',
        poem: longContent,
        genre: 'nature',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      // `.trim()` because the fixture is built with `.repeat()`, which leaves a
      // trailing space — and the create route now trims both fields (see the
      // empty-poem guard above). This test is about long content surviving, not
      // about trailing whitespace surviving.
      expect(response.body.poem).toBe(longContent.trim())
    })

    test('should handle special characters in poem content', async () => {
      const specialContent = 'Roses are red 🌹\nViolets are blue 💙\nPoetry is art\nAnd so are you! 😊'
      const newPoem = {
        title: 'Special Characters',
        poem: specialContent,
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.poem).toBe(specialContent)
    })

    // NOTE: this whole file authenticates as the ADMIN (see beforeEach, which
    // sets REACT_APP_ADMIN to testUser), and preserving a client-supplied date
    // is an admin-only capability — an ordinary poet gets the server clock, so
    // that they cannot pin a poem to the top of every list with a future date.
    // The non-admin half of this rule lives in poemFieldAllowlist.test.js.
    test('should preserve a date supplied by the admin', async () => {
      const testDate = new Date('2024-01-15T10:30:00.000Z')
      const newPoem = {
        title: 'Date Test',
        poem: 'Content',
        genre: 'love',
        date: testDate
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(new Date(response.body.date).toISOString()).toBe(testDate.toISOString())
    })

    test('should handle poems created by different users', async () => {
      // Create second user
      const passwordHash = await bcrypt.hash('password456', 10)
      const user2 = await User.create({
        username: 'user2',
        name: 'User Two',
        email: 'user2@example.com',
        passwordHash,
        picture: 'https://example.com/pic2.jpg'
      })

      const token2 = jwt.sign(
        { id: user2._id, username: user2.username, picture: user2.picture },
        process.env.SECRET,
        { expiresIn: 60 * 60 * 24 * 7 }
      )

      // Create poem with first user
      const response1 = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'User 1 Poem',
          poem: 'Content 1',
          genre: 'love',
          date: new Date()
        })
        .expect(201)

      // Create poem with second user
      const response2 = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${token2}`)
        .send({
          title: 'User 2 Poem',
          poem: 'Content 2',
          genre: 'sad',
          date: new Date()
        })
        .expect(201)

      expect(response1.body.author).toBe('Test User')
      expect(response2.body.author).toBe('User Two')
      expect(response1.body.userId).not.toBe(response2.body.userId)
    })

    test('should include _id in response', async () => {
      const newPoem = {
        title: 'ID Test',
        poem: 'Content',
        genre: 'love',
        date: new Date()
      }

      const response = await request(app)
        .post('/api/v1/poems')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPoem)
        .expect(201)

      expect(response.body.id).toBeDefined()
      expect(typeof response.body.id).toBe('string')
    })
  })

  describe('PATCH /api/v1/poems (bulk update)', () => {
    // This is the one endpoint that can change every poem at once, so it is
    // admin-gated, allowlisted and DRY RUN BY DEFAULT (`?apply=true` to act) —
    // see the handler for the reasoning. Every test asserts on the COLLECTION
    // as well as the status, because both wrong answers here pass a status-only
    // check: a route that applies the update and still calls itself a dry run,
    // and a route that writes nothing and answers 204. The old
    // `updateMany({}, { $set: req.body })` survived a green suite exactly that
    // way.

    const seed = (status) => Poem.create([
      {
        title: 'Poem 1',
        author: 'testuser',
        poem: 'Content 1',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic1.jpg',
        date: new Date(),
        status
      },
      {
        title: 'Poem 2',
        author: 'testuser',
        poem: 'Content 2',
        genre: 'sad',
        likes: [],
        userId: testUser._id,
        picture: 'pic2.jpg',
        date: new Date(),
        status
      }
    ])

    const patch = (query = '') => request(app)
      .patch(`/api/v1/poems${query}`)
      .set('Authorization', `Bearer ${authToken}`)

    const statuses = async () =>
      (await Poem.find({}).sort({ title: 1 })).map(poem => poem.status)

    test('one request cannot unpublish the site: without ?apply=true it writes nothing', async () => {
      await seed('published')

      const res = await patch().send({ status: 'draft' }).expect(200)

      expect(res.body.applied).toBe(false)
      expect(res.body.matched).toBe(2)
      // The write is the assertion. A version that applies the update and then
      // describes itself as a dry run answers 200 with this same body.
      expect(await statuses()).toEqual(['published', 'published'])
    })

    test('?apply=true performs the update and reports what it changed', async () => {
      await seed('draft')

      const res = await patch('?apply=true').send({ status: 'published' }).expect(200)

      expect(res.body).toEqual({ applied: true, matched: 2, modified: 2 })
      expect(await statuses()).toEqual(['published', 'published'])
    })

    test('drops fields outside the allowlist, even with ?apply=true', async () => {
      await seed('draft')

      await patch('?apply=true')
        .send({ status: 'published', newField: 'newValue', verified: true })
        .expect(200)

      const poems = await Poem.find({}).sort({ title: 1 })
      expect(poems.map(poem => poem.status)).toEqual(['published', 'published'])
      // `Poem` is `strict: false`, so an unknown key is persisted verbatim.
      // This checks the DOCUMENT, not the response — the allowlist is the point,
      // and a test that only read the status would pass without it.
      expect(poems[0].toObject().newField).toBeUndefined()
      expect(poems[0].toObject().verified).toBeUndefined()
    })

    test('cannot overwrite every poem’s words in one request', async () => {
      await seed('published')

      await patch('?apply=true')
        .send({ title: 'One Title', poem: 'One Body', status: 'published' })
        .expect(200)

      const poems = await Poem.find({}).sort({ title: 1 })
      expect(poems.map(poem => poem.title)).toEqual(['Poem 1', 'Poem 2'])
      expect(poems.map(poem => poem.poem)).toEqual(['Content 1', 'Content 2'])
    })

    test('rejects a status that is not a real one, without writing', async () => {
      await seed('published')

      const res = await patch('?apply=true').send({ status: 'archeved' }).expect(400)
      expect(res.body.error).toMatch(/status/i)

      // Not folded into `published` (which is what normalizeStatus does for one
      // poem) and not stored: a typo must not rewrite 16k documents, in either
      // direction.
      expect(await statuses()).toEqual(['published', 'published'])
    })

    test('validates the genre and stores a display name as its slug', async () => {
      await seed('published')

      await patch('?apply=true').send({ genre: 'not-a-category' }).expect(400)

      // SORTED, and by title rather than trusting the natural order: `seed`
      // inserts the two documents in parallel, so an unsorted `find` returns
      // them in either order and `toEqual(['love','sad'])` flaked for exactly
      // that reason.
      const untouched = await Poem.find({}).sort({ title: 1 })
      expect(untouched.map(poem => poem.genre)).toEqual(['love', 'sad'])

      // Same normalisation as creation: silently storing 'Hope' next to 'hope'
      // would split one category in two, which is why the list endpoint has to
      // match genres case-insensitively in the first place.
      await patch('?apply=true').send({ genre: 'Hope' }).expect(200)
      const refiled = await Poem.find({}).sort({ title: 1 })
      expect(refiled.map(poem => poem.genre)).toEqual(['hope', 'hope'])
    })

    test('rejects a body with nothing in it that may be set', async () => {
      await seed('published')

      const res = await patch('?apply=true').send({ newField: 'value' }).expect(400)

      // Names the allowlist rather than failing obscurely at the driver with an
      // empty `$set`.
      expect(res.body.error).toContain('status')
      expect(await statuses()).toEqual(['published', 'published'])
    })

    test('rejects a value it cannot apply', async () => {
      await seed('published')

      // `likes` is [String] and `origin` is a string: a wrong shape is a 400
      // here, where the driver would otherwise answer 500 after the request had
      // already been allowed through.
      await patch('?apply=true').send({ likes: 'aaaaaaaaaaaaaaaaaaaaaaaa' }).expect(400)
      await patch('?apply=true').send({ origin: 42 }).expect(400)

      const poems = await Poem.find({})
      expect(poems.every(poem => poem.likes.length === 0)).toBe(true)
      expect(poems.every(poem => poem.origin === undefined)).toBe(true)
    })

    test('applies across every author, not just one', async () => {
      const secondUser = await User.create({
        username: 'user2',
        email: 'user2@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        picture: 'pic.jpg'
      })

      await Poem.create([
        {
          title: 'User 1 Poem',
          author: 'testuser',
          poem: 'Content',
          genre: 'love',
          likes: [],
          userId: testUser._id,
          picture: 'pic1.jpg',
          date: new Date()
        },
        {
          title: 'User 2 Poem',
          author: 'user2',
          poem: 'Content',
          genre: 'sad',
          likes: [],
          userId: secondUser._id,
          picture: 'pic2.jpg',
          date: new Date()
        }
      ])

      // `origin` is on the allowlist — an allowlist that admitted nothing would
      // be as broken as one that admitted everything, and no other test here
      // writes a field besides status/genre.
      const res = await patch('?apply=true').send({ origin: 'famous' }).expect(200)

      expect(res.body).toEqual({ applied: true, matched: 2, modified: 2 })
      const poems = await Poem.find({})
      expect(poems).toHaveLength(2)
      expect(poems.every(poem => poem.origin === 'famous')).toBe(true)
    })

    test('an admin may still bulk-clear likes', async () => {
      // The legitimate bulk repair this endpoint exists for: a like wave that
      // has to be undone across the collection after a spam incident.
      const LIKES = ['aaaaaaaaaaaaaaaaaaaaaaaa', 'bbbbbbbbbbbbbbbbbbbbbbbb']
      await Poem.create([
        {
          title: 'Poem 1',
          author: 'testuser',
          poem: 'Content 1',
          genre: 'love',
          likes: LIKES,
          userId: testUser._id,
          date: new Date()
        },
        {
          title: 'Poem 2',
          author: 'testuser',
          poem: 'Content 2',
          genre: 'sad',
          likes: LIKES,
          userId: testUser._id,
          date: new Date()
        }
      ])

      const res = await patch('?apply=true').send({ likes: [] }).expect(200)
      expect(res.body.modified).toBe(2)

      const poems = await Poem.find({})
      expect(poems.every(poem => poem.likes.length === 0)).toBe(true)
    })

    test('should require admin authentication', async () => {
      await Poem.create({
        title: 'Test Poem',
        author: 'testuser',
        poem: 'Content',
        genre: 'love',
        likes: [],
        userId: testUser._id,
        picture: 'pic.jpg',
        date: new Date()
      })

      // No Authorization header
      await request(app)
        .patch('/api/v1/poems')
        .send({ status: 'draft' })
        .expect(401)
    })

    test('a signed-in user who is not the admin gets 403 and writes nothing', async () => {
      await seed('published')

      const other = await User.create({
        username: 'notadmin',
        name: 'Not Admin',
        email: 'notadmin@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        picture: 'pic.jpg'
      })
      const otherToken = jwt.sign(
        { id: other._id, username: other.username },
        process.env.SECRET,
        { expiresIn: 60 * 60 * 24 * 7 }
      )

      await request(app)
        .patch('/api/v1/poems?apply=true')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ status: 'draft' })
        .expect(403)

      expect(await statuses()).toEqual(['published', 'published'])
    })

    test('reports zero matches on an empty collection', async () => {
      const res = await patch().send({ status: 'draft' }).expect(200)

      // The echoed `update` is what a dry run is for: read what would be
      // written, and how much of the collection it touches, before deciding.
      expect(res.body).toEqual({
        applied: false,
        matched: 0,
        update: { status: 'draft' }
      })
    })
  })
})
