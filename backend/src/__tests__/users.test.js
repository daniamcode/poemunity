const request = require('supertest')
const { app } = require('../../app')
const User = require('../models/User')

/**
 * THE TWO LEGACY /users ROUTES ARE GONE, AND MUST STAY GONE.
 *
 * Both were public and both were dead — nothing in the frontend, the scripts or
 * the Cypress specs called either. Found by the 2026-08-10 audit:
 *
 *   GET  /api/v1/users   listed every legacy user document with no auth,
 *                        EMAIL INCLUDED (`User.toJSON` strips only the password
 *                        hash). Verified against a running server: an address
 *                        came back in the response body.
 *   POST /api/v1/users   created an account anonymously — no auth, no rate
 *                        limit, no validation, no email. Verified: 201 from an
 *                        anonymous request, i.e. unlimited document insertion
 *                        into production by anyone who found the path.
 *
 * This file used to be ~300 lines asserting that both worked, which is why they
 * survived so long: a route with a thorough test suite reads as load-bearing.
 * What is worth pinning is the opposite, so the tests below assert 404 AND
 * assert on the DATABASE — a route that answered 500 while still writing would
 * satisfy a status-code check.
 *
 * The rest of the router (stats, me, profile, picture) is covered by
 * userStats.test.js and migration-verification.test.js.
 */
describe('the removed legacy user routes', () => {
  test('GET /api/v1/users is not a route', async () => {
    await User.create({
      username: 'legacy-user',
      name: 'Legacy User',
      email: 'legacy@example.com',
      passwordHash: 'x'
    })

    const response = await request(app).get('/api/v1/users')

    expect(response.status).toBe(404)
    // The point is the email, not the status. A handler that 404'd after
    // serializing, or one restored behind a different path, would still leak it.
    expect(JSON.stringify(response.body)).not.toContain('legacy@example.com')
  })

  test('POST /api/v1/users creates nothing', async () => {
    const before = await User.countDocuments()

    const response = await request(app)
      .post('/api/v1/users')
      .send({ username: 'anon-created', name: 'Anon', password: 'password123' })

    expect(response.status).toBe(404)
    // Asserted against the collection, not the response: the original handler
    // saved the document BEFORE it answered, so a route that failed on its way
    // to replying would still have created the account.
    expect(await User.countDocuments()).toBe(before)
    expect(await User.findOne({ username: 'anon-created' })).toBeNull()
  })

  test('the surviving routes on this router still answer', async () => {
    // The distractor for a fix that removed the router or its mount rather than
    // the two handlers: /stats is on the same router and must still be reached,
    // answering 401 unauthenticated rather than 404.
    await request(app).get('/api/v1/users/stats').expect(401)
    await request(app).get('/api/v1/users/profile').expect(401)
  })
})
