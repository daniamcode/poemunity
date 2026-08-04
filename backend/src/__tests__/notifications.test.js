const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const { app } = require('../../app')
const Author = require('../models/Author')
const Poem = require('../models/Poem')
const Follow = require('../models/Follow')
const Notification = require('../models/Notification')
const { isNotificationEnabled, retract } = require('../utils/notifications')

// ---------------------------------------------------------------------------
// Notifications.
//
// Two things here are worth more care than the rest.
//
// COLLAPSING is a property of the STORAGE, not the rendering: twelve likes on
// one poem must be one row saying twelve, or the comment somebody wrote you is
// buried under a wall of identical like rows. So the assertions are on how many
// DOCUMENTS exist, not on what a response happens to render.
//
// ABSENT MEANS ON. Every author predates `notificationPrefs`, so nothing is
// stored for any of them, and reading that as "wants nothing" would switch
// notifications off for the entire existing user base. The end-to-end tests
// here cannot actually prove that rule — Mongoose fills schema defaults on
// hydration, so a stored document with no prefs reads back as all-true anyway —
// which a red-check found. The rule is pinned by a direct unit test of
// `isNotificationEnabled` on a plain object instead. Both are kept: the
// end-to-end ones pin the behaviour, the unit test pins the reason.
// ---------------------------------------------------------------------------

const makeToken = (id) =>
  jwt.sign({ id: String(id), username: 'tester' }, process.env.SECRET, { expiresIn: '1d' })

const auth = (req, id) => req.set('Authorization', `Bearer ${makeToken(id)}`)

async function seed () {
  // NO notificationPrefs on any of these — the shape of every existing author.
  const poet = await Author.create({ username: 'poet', name: 'Nadia Novak', slug: 'nadia-novak', type: 'user' })
  const ada = await Author.create({ username: 'ada', name: 'Ada Brine', slug: 'ada-brine', type: 'user' })
  const milo = await Author.create({ username: 'milo', name: 'Milo Vex', slug: 'milo-vex', type: 'user' })

  const poem = await Poem.create({
    title: 'Aubade',
    slug: 'aubade-nadia',
    poem: 'words',
    genre: 'love',
    authorId: poet._id,
    origin: 'user',
    likes: [],
    date: new Date()
  })

  return { poet, ada, milo, poem }
}

const like = (poemId, actorId) =>
  auth(request(app).put(`/api/v1/poem/${poemId}`), actorId)

const inbox = (ownerId) => Notification.find({ recipient: ownerId })

describe('Notifications — triggers', () => {
  test('a like tells the poem author', async () => {
    const { poet, ada, poem } = await seed()

    await like(poem._id, ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].type).toBe('like')
    expect(String(rows[0].poem)).toBe(String(poem._id))
    expect(rows[0].count).toBe(1)
  })

  test('UNLIKING tells nobody', async () => {
    // The route toggles, so notifying on every call would say "someone liked
    // your poem" when they took a like away — and like/unlike would become a
    // way to poke somebody repeatedly.
    //
    // The read step in the middle is what gives this test teeth, and it was
    // added after a red-check: without it, a notify-on-unlike bug is INVISIBLE,
    // because the second call collapses into the same unread row with the same
    // actor already in it, so neither the row count nor the count field moves.
    // Marking read first means a stray notify has to raise a NEW unread row —
    // read rows are never merged into — which is exactly the "poke somebody"
    // behaviour being guarded against.
    const { poet, ada, poem } = await seed()

    await like(poem._id, ada._id).expect(200)
    await auth(request(app).post('/api/v1/notifications/read'), poet._id).send({}).expect(200)

    await like(poem._id, ada._id).expect(200) // toggles it back off

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows.filter(r => !r.read)).toHaveLength(0)
  })

  test('liking your own poem tells nobody', async () => {
    const { poet, poem } = await seed()

    await like(poem._id, poet._id).expect(200)

    expect(await inbox(poet._id)).toHaveLength(0)
  })

  test('a comment tells the poem author', async () => {
    const { poet, ada, poem } = await seed()

    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'lovely' })
      .expect(201)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].type).toBe('comment')
  })

  test('a PROFILE comment notifies nobody', async () => {
    // Profile comments share the route but their targetId is an AUTHOR id.
    // Looked up as a poem it finds nothing — the point is that it must not
    // notify the author whose id happens to sit in that field.
    const { poet, ada } = await seed()

    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'profile', targetId: String(poet._id), body: 'hi' })
      .expect(201)

    expect(await inbox(poet._id)).toHaveLength(0)
  })

  test('a follow tells the followed author', async () => {
    const { poet, ada } = await seed()

    await auth(request(app).post('/api/v1/authors/nadia-novak/follow'), ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].type).toBe('follow')
    // No poem on a follow — which is also what makes follows collapse with each
    // other and never with a poem event.
    expect(rows[0].poem).toBeFalsy()
  })

  test('publishing a draft tells the author’s followers, and only them', async () => {
    const { poet, ada, milo } = await seed()
    await Follow.create({ follower: ada._id, following: poet._id })

    const draft = await Poem.create({
      title: 'Nocturne',
      slug: 'nocturne-nadia',
      poem: 'words',
      genre: 'love',
      authorId: poet._id,
      origin: 'user',
      status: 'draft',
      date: new Date()
    })

    await auth(request(app).patch(`/api/v1/poem/${draft._id}`), poet._id)
      .send({ status: 'published' }).expect(200)

    expect(await inbox(ada._id)).toHaveLength(1)
    // Milo follows nobody. A fan-out that notified every author would pass a
    // test that only checked Ada.
    expect(await inbox(milo._id)).toHaveLength(0)
    // And the poet is not told about their own poem.
    expect(await inbox(poet._id)).toHaveLength(0)
  })

  test('WITHDRAWING a poem tells nobody', async () => {
    // There is no "never mind" notification, and a poet toggling a poem while
    // they fiddle with it would otherwise spam their followers.
    const { poet, ada, poem } = await seed()
    await Follow.create({ follower: ada._id, following: poet._id })

    await auth(request(app).patch(`/api/v1/poem/${poem._id}`), poet._id)
      .send({ status: 'draft' }).expect(200)

    expect(await inbox(ada._id)).toHaveLength(0)
  })

  test('an ordinary edit tells nobody', async () => {
    const { poet, ada, poem } = await seed()
    await Follow.create({ follower: ada._id, following: poet._id })

    await auth(request(app).patch(`/api/v1/poem/${poem._id}`), poet._id)
      .send({ title: 'Aubade, revised' }).expect(200)

    expect(await inbox(ada._id)).toHaveLength(0)
  })
})

describe('Notifications — collapsing', () => {
  test('two people liking one poem is ONE row saying two', async () => {
    const { poet, ada, milo, poem } = await seed()

    await like(poem._id, ada._id).expect(200)
    await like(poem._id, milo._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].count).toBe(2)
    expect(rows[0].actors).toHaveLength(2)
  })

  test('the same person twice is still one', async () => {
    // like → unlike → like. The count tracks DISTINCT actors, so a toggler
    // cannot inflate it.
    const { poet, ada, poem } = await seed()

    await like(poem._id, ada._id).expect(200)
    await like(poem._id, ada._id).expect(200)
    await like(poem._id, ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].count).toBe(1)
  })

  test('likes on DIFFERENT poems stay separate', async () => {
    // The distractor for the collapse tests: a merge keyed only on
    // (recipient, type) would fold these two together and still pass every
    // test above.
    const { poet, ada, poem } = await seed()
    const other = await Poem.create({
      title: 'Second',
      slug: 'second-nadia',
      poem: 'w',
      genre: 'love',
      authorId: poet._id,
      origin: 'user',
      likes: [],
      date: new Date()
    })

    await like(poem._id, ada._id).expect(200)
    await like(other._id, ada._id).expect(200)

    expect(await inbox(poet._id)).toHaveLength(2)
  })

  test('a like and a comment on the same poem stay separate', async () => {
    const { poet, ada, poem } = await seed()

    await like(poem._id, ada._id).expect(200)
    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'oh' })
      .expect(201)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.type).sort()).toEqual(['comment', 'like'])
  })

  test('a READ row is not merged into — a new like raises a fresh one', async () => {
    // You already saw that notification, so a new like has to be able to make
    // something unread again rather than silently updating a row you have
    // already dismissed.
    const { poet, ada, milo, poem } = await seed()

    await like(poem._id, ada._id).expect(200)
    await auth(request(app).post('/api/v1/notifications/read'), poet._id).send({}).expect(200)

    await like(poem._id, milo._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(2)
    expect(rows.filter(r => !r.read)).toHaveLength(1)
  })
})

describe('Notifications — preferences', () => {
  test('an author with NO prefs field is notified — absent means ON', async () => {
    // Inserted THROUGH THE DRIVER, bypassing the schema, because the schema's
    // `default: true` means every author created normally already has the
    // field — so a fixture built with Author.create() cannot reach this case at
    // all, and the test would be hollow. Documents with nothing here are the
    // entire existing user base, and a truthiness check would silently switch
    // their notifications off. Same technique as the drafts fixture inserting a
    // poem with no `status`.
    const { ada } = await seed()
    const { insertedId: legacyId } = await Author.collection.insertOne({
      username: 'legacy', name: 'Legacy Poet', slug: 'legacy-poet', type: 'user'
    })
    const raw = await Author.collection.findOne({ _id: legacyId })
    expect(raw.notificationPrefs).toBeUndefined()

    const legacyPoem = await Poem.create({
      title: 'Old Song',
      slug: 'old-song-legacy',
      poem: 'w',
      genre: 'love',
      authorId: legacyId,
      origin: 'user',
      likes: [],
      date: new Date()
    })

    await like(legacyPoem._id, ada._id).expect(200)

    expect(await inbox(legacyId)).toHaveLength(1)
  })

  // The two tests above go through Mongoose, which fills schema defaults when
  // it HYDRATES a document — so a stored document with no `notificationPrefs`
  // still reads back as all-true, and `=== true` would pass them both. Found by
  // red-check; the tests are kept because they pin the end-to-end behaviour,
  // but they are not what guards the rule.
  //
  // This is: the helper's contract on a PLAIN object, with no hydration to fall
  // back on. It is the case that appears the moment anyone adds `.lean()` to
  // the lookup in notify() — an ordinary performance change that would silently
  // switch every legacy author's notifications off.
  describe('isNotificationEnabled on an unhydrated object', () => {
    test('absent means ON', () => {
      expect(isNotificationEnabled({}, 'like')).toBe(true)
      expect(isNotificationEnabled({ notificationPrefs: {} }, 'like')).toBe(true)
      expect(isNotificationEnabled(undefined, 'like')).toBe(true)
    })

    test('only an explicit false means off', () => {
      expect(isNotificationEnabled({ notificationPrefs: { like: false } }, 'like')).toBe(false)
      expect(isNotificationEnabled({ notificationPrefs: { like: true } }, 'like')).toBe(true)
      // A different type being off says nothing about this one.
      expect(isNotificationEnabled({ notificationPrefs: { comment: false } }, 'like')).toBe(true)
    })
  })

  test('GET /preferences reports every type as on for a legacy author too', async () => {
    // The other half: the API must not render four "off" toggles at somebody
    // whose notifications are in fact all on.
    const { insertedId } = await Author.collection.insertOne({
      username: 'legacy2', name: 'Legacy Two', slug: 'legacy-two', type: 'user'
    })

    const res = await auth(request(app).get('/api/v1/notifications/preferences'), insertedId).expect(200)

    expect(res.body).toEqual({ like: true, comment: true, follow: true, newPoem: true })
  })

  test('GET /preferences reports every type as on for an author with none stored', async () => {
    const { poet } = await seed()

    const res = await auth(request(app).get('/api/v1/notifications/preferences'), poet._id).expect(200)

    expect(res.body).toEqual({ like: true, comment: true, follow: true, newPoem: true })
  })

  test('turning one off silences only that type', async () => {
    const { poet, ada, poem } = await seed()

    await auth(request(app).patch('/api/v1/notifications/preferences'), poet._id)
      .send({ like: false }).expect(200)

    await like(poem._id, ada._id).expect(200)
    await auth(request(app).post('/api/v1/authors/nadia-novak/follow'), ada._id).expect(200)

    const rows = await inbox(poet._id)
    // The follow still arrives — a preference that silenced everything would
    // pass a test that only checked the like was gone.
    expect(rows).toHaveLength(1)
    expect(rows[0].type).toBe('follow')
  })

  test('turning it back on restores it', async () => {
    const { poet, ada, poem } = await seed()

    await auth(request(app).patch('/api/v1/notifications/preferences'), poet._id)
      .send({ like: false }).expect(200)
    await auth(request(app).patch('/api/v1/notifications/preferences'), poet._id)
      .send({ like: true }).expect(200)

    await like(poem._id, ada._id).expect(200)

    expect(await inbox(poet._id)).toHaveLength(1)
  })

  test('ignores a key that is not a notification type', async () => {
    const { poet } = await seed()

    const res = await auth(request(app).patch('/api/v1/notifications/preferences'), poet._id)
      .send({ like: false, isAdmin: true, nonsense: false }).expect(200)

    expect(res.body).toEqual({ like: false, comment: true, follow: true, newPoem: true })
    const fresh = await Author.findById(poet._id)
    expect(fresh.isAdmin).toBeUndefined()
  })
})

describe('Notifications — reading them', () => {
  test('the list is scoped to the session, never to a parameter', async () => {
    const { poet, ada, milo, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    // Milo asks, and even names the poet. He gets his own empty inbox.
    const res = await auth(
      request(app).get(`/api/v1/notifications?recipient=${poet._id}&userId=${poet._id}`),
      milo._id
    ).expect(200)

    expect(res.body.notifications).toHaveLength(0)
    expect(res.body.notifications).toEqual([])
  })

  test('401 without a session', async () => {
    await request(app).get('/api/v1/notifications').expect(401)
    await request(app).get('/api/v1/notifications/unread-count').expect(401)
  })

  test('orders by latest ACTIVITY, not creation', async () => {
    // The distractor: the OLDER notification is the one that gets collapsed
    // into, so a sort on createdAt returns the opposite order. A poem that
    // gathered likes this morning must not sit where its first like landed.
    const { poet, ada, milo, poem } = await seed()
    const second = await Poem.create({
      title: 'Second',
      slug: 'second-nadia',
      poem: 'w',
      genre: 'love',
      authorId: poet._id,
      origin: 'user',
      likes: [],
      date: new Date()
    })

    await like(poem._id, ada._id).expect(200) // older row
    await like(second._id, ada._id).expect(200) // newer row
    await like(poem._id, milo._id).expect(200) // collapses into the OLDER one

    const res = await auth(request(app).get('/api/v1/notifications'), poet._id).expect(200)

    expect(res.body.notifications[0].poem.title).toBe('Aubade')
    expect(res.body.notifications[0].count).toBe(2)
  })

  test('populates the actors and the poem so a row can be rendered', async () => {
    const { poet, ada, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    const res = await auth(request(app).get('/api/v1/notifications'), poet._id).expect(200)

    expect(res.body.notifications[0].actors[0].name).toBe('Ada Brine')
    expect(res.body.notifications[0].poem.slug).toBe('aubade-nadia')
  })

  test('pages without a count query, and without leaking the probe row', async () => {
    // `hasMore` comes from asking for ONE row more than the page, so the probe
    // must not be rendered as an eleventh row and must not reappear on page 2.
    const { poet, poem } = await seed()
    for (let i = 0; i < 12; i++) {
      const author = await Author.create({ username: `u${i}`, name: `Liker ${i}`, slug: `l-${i}`, type: 'user' })
      await like(poem._id, author._id).expect(200)
      await auth(request(app).post('/api/v1/notifications/read'), poet._id).send({}).expect(200)
    }

    const p1 = await auth(request(app).get('/api/v1/notifications?page=1'), poet._id).expect(200)
    const p2 = await auth(request(app).get('/api/v1/notifications?page=2'), poet._id).expect(200)

    expect(p1.body.notifications).toHaveLength(10)
    expect(p1.body.hasMore).toBe(true)
    expect(p2.body.notifications).toHaveLength(2)
    expect(p2.body.hasMore).toBe(false)

    const ids = [...p1.body.notifications, ...p2.body.notifications].map(n => n.id)
    expect(new Set(ids).size).toBe(12)
  })

  test('an exactly-full page does not claim there is more', async () => {
    // The off-by-one the probe row invites: with exactly `limit` rows, the
    // extra find returns nothing and hasMore must be false.
    const { poet, poem } = await seed()
    for (let i = 0; i < 10; i++) {
      const author = await Author.create({ username: `x${i}`, name: `X ${i}`, slug: `x-${i}`, type: 'user' })
      await like(poem._id, author._id).expect(200)
      await auth(request(app).post('/api/v1/notifications/read'), poet._id).send({}).expect(200)
    }

    const res = await auth(request(app).get('/api/v1/notifications?page=1'), poet._id).expect(200)

    expect(res.body.notifications).toHaveLength(10)
    expect(res.body.hasMore).toBe(false)
  })

  test('unread-count counts only unread', async () => {
    const { poet, ada, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    const before = await auth(request(app).get('/api/v1/notifications/unread-count'), poet._id).expect(200)
    expect(before.body.count).toBe(1)

    await auth(request(app).post('/api/v1/notifications/read'), poet._id).send({}).expect(200)

    const after = await auth(request(app).get('/api/v1/notifications/unread-count'), poet._id).expect(200)
    expect(after.body.count).toBe(0)
  })

  test('marking read by id cannot reach somebody else’s notifications', async () => {
    // The ids narrow the recipient-scoped query; they never widen it.
    const { poet, ada, milo, poem } = await seed()
    await like(poem._id, ada._id).expect(200)
    const [poetsRow] = await inbox(poet._id)

    const res = await auth(request(app).post('/api/v1/notifications/read'), milo._id)
      .send({ ids: [String(poetsRow._id)] }).expect(200)

    expect(res.body.updated).toBe(0)
    const [still] = await inbox(poet._id)
    expect(still.read).toBe(false)
  })

  test('marking read with no ids marks everything', async () => {
    const { poet, ada, milo, poem } = await seed()
    const second = await Poem.create({
      title: 'Second',
      slug: 'second-nadia',
      poem: 'w',
      genre: 'love',
      authorId: poet._id,
      origin: 'user',
      likes: [],
      date: new Date()
    })
    await like(poem._id, ada._id).expect(200)
    await like(second._id, milo._id).expect(200)

    const res = await auth(request(app).post('/api/v1/notifications/read'), poet._id).send({}).expect(200)

    expect(res.body.updated).toBe(2)
    expect(res.body.unreadCount).toBe(0)
  })
})

describe('Notifications — every type carries what its row needs to link', () => {
  // The client turns a row into a destination in `notificationHref`:
  //   follow  -> /authors/<actor slug or id>
  //   others  -> /detail/<poem slug or id>
  // and renders NOTHING clickable when neither is present. So a row that omits
  // the field its own type needs is a dead notification — visible, but going
  // nowhere. This asserts the contract for all four types in one place, since
  // only `like` was covered before.

  const hrefFieldsFor = (row) => ({
    type: row.type,
    poemSlug: row.poem?.slug ?? null,
    actorSlug: row.actors?.[0]?.slug ?? null,
    actorName: row.actors?.[0]?.name ?? null
  })

  test('a LIKE row carries the poem slug', async () => {
    const { poet, ada, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    const res = await auth(request(app).get('/api/v1/notifications'), poet._id).expect(200)

    expect(hrefFieldsFor(res.body.notifications[0])).toEqual({
      type: 'like', poemSlug: 'aubade-nadia', actorSlug: 'ada-brine', actorName: 'Ada Brine'
    })
  })

  test('a COMMENT row carries the poem slug', async () => {
    const { poet, ada, poem } = await seed()
    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'lovely' })
      .expect(201)

    const res = await auth(request(app).get('/api/v1/notifications'), poet._id).expect(200)

    expect(hrefFieldsFor(res.body.notifications[0])).toEqual({
      type: 'comment', poemSlug: 'aubade-nadia', actorSlug: 'ada-brine', actorName: 'Ada Brine'
    })
  })

  test('a FOLLOW row carries the actor slug and NO poem', async () => {
    // The one type that routes to an author. A poem field here would send the
    // reader to a poem that has nothing to do with the notification.
    const { poet, ada } = await seed()
    await auth(request(app).post(`/api/v1/authors/${ada._id}/follow`), poet._id).expect(200)

    const res = await auth(request(app).get('/api/v1/notifications'), ada._id).expect(200)

    expect(hrefFieldsFor(res.body.notifications[0])).toEqual({
      type: 'follow', poemSlug: null, actorSlug: 'nadia-novak', actorName: 'Nadia Novak'
    })
    expect(res.body.notifications[0].poem).toBeFalsy()
  })

  test('a NEW POEM row carries the newly published poem slug', async () => {
    // The type the report came from. The actor is the POET, and the poem must
    // be the one just published — not the draft's old identity.
    const { poet, ada } = await seed()
    await auth(request(app).post(`/api/v1/authors/${poet._id}/follow`), ada._id).expect(200)

    const draft = await Poem.create({
      title: 'Second Light',
      slug: 'second-light',
      poem: 'words',
      genre: 'love',
      authorId: poet._id,
      origin: 'user',
      status: 'draft',
      date: new Date()
    })

    await auth(request(app).patch(`/api/v1/poem/${draft._id}`), poet._id)
      .send({ status: 'published' })
      .expect(200)

    const res = await auth(request(app).get('/api/v1/notifications'), ada._id).expect(200)
    const row = res.body.notifications.find(n => n.type === 'newPoem')

    expect(hrefFieldsFor(row)).toEqual({
      type: 'newPoem', poemSlug: 'second-light', actorSlug: 'nadia-novak', actorName: 'Nadia Novak'
    })
  })

  test('every row exposes an `id`, which read-marking needs', async () => {
    // `POST /notifications/read { ids }` takes row ids. A row serialized
    // without one cannot be marked read individually.
    const { poet, ada, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    const res = await auth(request(app).get('/api/v1/notifications'), poet._id).expect(200)

    expect(res.body.notifications[0].id).toEqual(expect.any(String))
    expect(res.body.notifications[0]._id).toBeUndefined()
  })
})

describe('Notifications — different event types never merge', () => {
  // Reported: "somebody commented on my poem and liked it, and I only received
  // one notification, about the like."
  //
  // Collapsing merges into an existing UNREAD row of the same
  // (recipient, TYPE, poem) — the type is part of that key precisely so a
  // comment and a like on one poem stay two rows. This pins that, because the
  // failure is silent: one row is a plausible-looking inbox, and the missing
  // event is one a poet would want most.

  test('a comment and a like from the SAME person on the SAME poem are two rows', async () => {
    const { poet, ada, poem } = await seed()

    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'lovely' })
      .expect(201)
    await like(poem._id, ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(2)
    expect(rows.map(r => r.type).sort()).toEqual(['comment', 'like'])
    // And each counts one actor, rather than one row counting two events.
    expect(rows.every(r => r.count === 1)).toBe(true)
  })

  test('the API returns both, and the badge counts both', async () => {
    const { poet, ada, poem } = await seed()

    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'lovely' })
      .expect(201)
    await like(poem._id, ada._id).expect(200)

    const list = await auth(request(app).get('/api/v1/notifications'), poet._id).expect(200)
    const badge = await auth(request(app).get('/api/v1/notifications/unread-count'), poet._id).expect(200)

    expect(list.body.notifications.map(n => n.type).sort()).toEqual(['comment', 'like'])
    expect(list.body.notifications).toHaveLength(2)
    expect(badge.body.count).toBe(2)
  })

  test('order does not matter — like first, then comment', async () => {
    const { poet, ada, poem } = await seed()

    await like(poem._id, ada._id).expect(200)
    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'lovely' })
      .expect(201)

    expect(await inbox(poet._id)).toHaveLength(2)
  })

  test('a follow and a poem event stay separate too', async () => {
    // The follow row has `poem: null`, which is the other half of the same key.
    const { poet, ada, poem } = await seed()

    await auth(request(app).post('/api/v1/authors/nadia-novak/follow'), ada._id).expect(200)
    await like(poem._id, ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows.map(r => r.type).sort()).toEqual(['follow', 'like'])
  })

  test('turning OFF one type silences only that type', async () => {
    // The most likely explanation for a real inbox showing one of two: the
    // preference. Pinned so the behaviour is unambiguous — comment off must
    // still leave the like.
    const { poet, ada, poem } = await seed()
    await Author.findByIdAndUpdate(poet._id, { $set: { 'notificationPrefs.comment': false } })

    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'lovely' })
      .expect(201)
    await like(poem._id, ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].type).toBe('like')
  })
})

describe('Notifications — taking a like back takes its notification back', () => {
  // "The notification of the like should be removed in that case."
  //
  // Bounded by READ state, not by age or list position: an unread row is one
  // nobody has looked at, so removing it costs no one a memory. A row the poet
  // has already seen stays, because deleting it would rewrite something they
  // witnessed.

  test('unliking removes the notification entirely when it was the only like', async () => {
    const { poet, ada, poem } = await seed()

    await like(poem._id, ada._id).expect(200)
    expect(await inbox(poet._id)).toHaveLength(1)

    await like(poem._id, ada._id).expect(200) // toggles off

    expect(await inbox(poet._id)).toHaveLength(0)
  })

  test('the badge goes back down', async () => {
    const { poet, ada, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    await like(poem._id, ada._id).expect(200)

    const badge = await auth(request(app).get('/api/v1/notifications/unread-count'), poet._id).expect(200)
    expect(badge.body.count).toBe(0)
  })

  test('one person unliking leaves everybody else’s like intact', async () => {
    // The distractor that matters: with two likers, unliking must decrement to
    // one, not delete the row and not leave it saying two.
    const { poet, ada, milo, poem } = await seed()
    await like(poem._id, ada._id).expect(200)
    await like(poem._id, milo._id).expect(200)

    const before = await inbox(poet._id)
    expect(before[0].count).toBe(2)

    await like(poem._id, ada._id).expect(200) // ada takes hers back

    const after = await inbox(poet._id)
    expect(after).toHaveLength(1)
    expect(after[0].count).toBe(1)
    expect(after[0].actors.map(String)).toEqual([String(milo._id)])
  })

  test('a notification the poet has ALREADY READ is left alone', async () => {
    // The boundary. You saw it; the site does not get to un-tell you.
    const { poet, ada, poem } = await seed()
    await like(poem._id, ada._id).expect(200)
    await auth(request(app).post('/api/v1/notifications/read'), poet._id).send({}).expect(200)

    await like(poem._id, ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].read).toBe(true)
    expect(rows[0].count).toBe(1)
  })

  test('unliking touches no other notification type', async () => {
    // The comment row shares (recipient, poem) and differs only by type.
    const { poet, ada, poem } = await seed()
    await auth(request(app).post('/api/v1/comments'), ada._id)
      .send({ targetType: 'poem', targetId: String(poem._id), body: 'lovely' })
      .expect(201)
    await like(poem._id, ada._id).expect(200)

    await like(poem._id, ada._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows.map(r => r.type)).toEqual(['comment'])
  })

  test('unliking someone else’s poem does not touch YOUR notifications', async () => {
    const { poet, ada, milo, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    // Milo never liked it; his toggle adds a like, it does not retract Ada's.
    await like(poem._id, milo._id).expect(200)

    const rows = await inbox(poet._id)
    expect(rows[0].count).toBe(2)
  })

  test('unliking a poem you never liked is a no-op, not a decrement', async () => {
    // `retract` must not subtract a like that was never counted. The like route
    // toggles, so milo's first press ADDS — this drives retract directly to
    // cover the case where the actor is simply not in the row.
    const { poet, ada, milo, poem } = await seed()
    await like(poem._id, ada._id).expect(200)

    await retract({
      recipientId: poet._id,
      actorId: milo._id,
      type: 'like',
      poemId: poem._id
    })

    const rows = await inbox(poet._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].count).toBe(1)
  })
})

describe('Notifications — declared indexes', () => {
  test('the indexes the queries need are declared', () => {
    const declared = Notification.schema.indexes().map(([keys]) => JSON.stringify(keys))

    // The list, ordered by latest activity.
    expect(declared).toContain(JSON.stringify({ recipient: 1, updatedAt: -1, _id: -1 }))
    // The badge count and the collapse lookup.
    expect(declared).toContain(JSON.stringify({ recipient: 1, read: 1, type: 1, poem: 1 }))
  })

  test('and nothing else — a standalone recipient index is a redundant write', () => {
    // `{ recipient: 1 }` is a strict PREFIX of both indexes above, and MongoDB
    // uses a compound index from any prefix of its keys. So it can answer no
    // query they cannot, while costing an extra index write on every insert
    // and every collapse — pure overhead on the write path.
    //
    // Pinned rather than merely deleted because `autoIndex` is ON in
    // production and only ever CREATES: dropping this from the schema does not
    // drop it from Atlas (see scripts/drop-redundant-notification-index.js),
    // and re-adding `index: true` here would silently reinstate the cost.
    const declared = Notification.schema.indexes().map(([keys]) => JSON.stringify(keys))

    expect(declared).not.toContain(JSON.stringify({ recipient: 1 }))
    expect(declared).toHaveLength(2)
  })
})

describe('Notifications — the publish fan-out', () => {
  // The fan-out is the one path whose cost scales with somebody else's
  // popularity, and it runs INSIDE the request the poet is waiting on. These
  // tests are about how many round trips it takes, not only about what it
  // writes — a correct-but-quadratic fan-out passes every other test in this
  // file.
  const { notifyMany } = require('../utils/notifications')

  test('fetches every recipient preference in ONE query, not one per recipient', async () => {
    const { poet, ada, milo } = await seed()
    const zora = await Author.create({ username: 'zora', name: 'Zora Quist', slug: 'zora-q', type: 'user' })
    const poem = await Poem.create({
      title: 'Fanout', slug: 'fanout-x', poem: 'w', genre: 'love', authorId: poet._id, origin: 'user', date: new Date()
    })

    const findSpy = jest.spyOn(Author, 'find')
    const findByIdSpy = jest.spyOn(Author, 'findById')

    await notifyMany({
      recipientIds: [ada._id, milo._id, zora._id],
      actorId: poet._id,
      type: 'newPoem',
      poemId: poem._id
    })

    // One batched lookup for three recipients...
    expect(findSpy).toHaveBeenCalledTimes(1)
    // ...and crucially NOT the per-recipient lookup notify() would do alone.
    expect(findByIdSpy).not.toHaveBeenCalled()

    // Still actually notified all three — the point is fewer queries, not less work.
    expect(await Notification.countDocuments({ type: 'newPoem' })).toBe(3)

    findSpy.mockRestore()
    findByIdSpy.mockRestore()
  })

  test('still honours an opt-out when batched', async () => {
    // The distractor for the test above: batching the lookup is only correct if
    // the preference CHECK survives it. Skipping the check would make this the
    // only failing assertion in the file.
    const { poet, ada, milo } = await seed()
    await Author.findByIdAndUpdate(ada._id, { $set: { 'notificationPrefs.newPoem': false } })
    const poem = await Poem.create({
      title: 'Optout', slug: 'optout-x', poem: 'w', genre: 'love', authorId: poet._id, origin: 'user', date: new Date()
    })

    await notifyMany({
      recipientIds: [ada._id, milo._id],
      actorId: poet._id,
      type: 'newPoem',
      poemId: poem._id
    })

    expect(await inbox(ada._id)).toHaveLength(0)
    expect(await inbox(milo._id)).toHaveLength(1)
  })

  test('absent preferences still mean ON when batched', async () => {
    // The recipient is inserted through the RAW DRIVER, with no
    // `notificationPrefs` key at all. That is not a contrivance — it is the
    // shape of every author who predates the field, i.e. all of them.
    //
    // `Author.create` would NOT reproduce it: Mongoose applies schema defaults
    // on creation and persists them, so a created author really does carry
    // `notificationPrefs: { like: true, ... }` in the database and this test
    // passed against a deliberately broken `=== true` check. A red-check caught
    // that; the driver insert is what makes the assertion mean anything.
    //
    // This is the path where it matters, because notifyMany reads with
    // `.lean()` and so gets no hydration defaults to fall back on either.
    const { poet } = await seed()
    const legacyId = new mongoose.Types.ObjectId()
    await Author.collection.insertOne({
      _id: legacyId, username: 'legacy', name: 'Legacy Reader', slug: 'legacy-reader', type: 'user'
    })
    const poem = await Poem.create({
      title: 'Absent', slug: 'absent-x', poem: 'w', genre: 'love', authorId: poet._id, origin: 'user', date: new Date()
    })

    const stored = await Author.collection.findOne({ _id: legacyId })
    expect(stored.notificationPrefs).toBeUndefined() // the premise of the test

    await notifyMany({ recipientIds: [legacyId], actorId: poet._id, type: 'newPoem', poemId: poem._id })

    expect(await inbox(legacyId)).toHaveLength(1)
  })

  test('a duplicated recipient is paid for once', async () => {
    const { poet, ada } = await seed()
    const poem = await Poem.create({
      title: 'Dupe', slug: 'dupe-x', poem: 'w', genre: 'love', authorId: poet._id, origin: 'user', date: new Date()
    })

    const findSpy = jest.spyOn(Author, 'find')
    await notifyMany({
      recipientIds: [ada._id, String(ada._id), ada._id],
      actorId: poet._id,
      type: 'newPoem',
      poemId: poem._id
    })

    expect(findSpy.mock.calls[0][0]._id.$in).toHaveLength(1)
    // And collapsing would have hidden a repeat anyway — assert the count too,
    // which is what a second delivery would actually have bumped.
    const rows = await inbox(ada._id)
    expect(rows).toHaveLength(1)
    expect(rows[0].count).toBe(1)

    findSpy.mockRestore()
  })

  test('skips a recipient who no longer exists', async () => {
    const { poet, ada } = await seed()
    const deleted = new mongoose.Types.ObjectId()
    const poem = await Poem.create({
      title: 'Gone', slug: 'gone-x', poem: 'w', genre: 'love', authorId: poet._id, origin: 'user', date: new Date()
    })

    await notifyMany({
      recipientIds: [ada._id, deleted],
      actorId: poet._id,
      type: 'newPoem',
      poemId: poem._id
    })

    expect(await Notification.countDocuments({ type: 'newPoem' })).toBe(1)
    expect(await inbox(ada._id)).toHaveLength(1)
  })

  test('an empty follower list costs no queries at all', async () => {
    const findSpy = jest.spyOn(Author, 'find')

    await notifyMany({ recipientIds: [], actorId: new mongoose.Types.ObjectId(), type: 'newPoem' })

    expect(findSpy).not.toHaveBeenCalled()
    findSpy.mockRestore()
  })
})
