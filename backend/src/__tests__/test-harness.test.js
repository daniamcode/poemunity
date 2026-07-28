/**
 * Guards the harness itself (jest.setup.js), not application code.
 *
 * By default supertest creates a throwaway http.Server per request with
 * `app.listen(0)`, which binds the WILDCARD address. Combined with SO_REUSEADDR
 * the OS will hand us a port another local process already holds on 127.0.0.1;
 * the client then reaches THAT process instead of our app, so tests fail with
 * foreign statuses (302/404/401) or a bare `socket hang up` — on a random test
 * each run, at roughly a 25% per-run failure rate.
 *
 * jest.setup.js fixes this by listening once, on loopback, and handing supertest
 * that server. If that setup is removed the suite goes flaky again in a way that
 * is miserable to diagnose, so these tests assert the invariant directly.
 */

const http = require('http')
const request = require('supertest')
const { app } = require('../../app')

describe('test harness — supertest talks to a loopback-bound server we own', () => {
  test('the server supertest uses is bound to 127.0.0.1, not the wildcard address', () => {
    const server = http.createServer(app)
    const addr = server.address()

    // Non-null address proves supertest is handed an already-listening server
    // (its serverAddress() only calls listen(0) when address() is null).
    expect(addr).not.toBeNull()
    expect(addr.address).toBe('127.0.0.1')
  })

  test('unrelated servers are not affected by the substitution', (done) => {
    const other = http.createServer((req, res) => res.end('other'))
    expect(other.address()).toBeNull()
    other.listen(0, '127.0.0.1', () => {
      expect(other.address().port).toBeGreaterThan(0)
      other.close(done)
    })
  })

  test('a supertest request reaches our app and not a foreign listener', async () => {
    const res = await request(app).get('/').expect(200)
    expect(res.text).toBe('Server is ok')
  })

  test('repeated requests keep hitting our app (no per-request server churn)', async () => {
    for (let i = 0; i < 25; i++) {
      const res = await request(app).get('/').expect(200)
      expect(res.text).toBe('Server is ok')
    }
  })
})
