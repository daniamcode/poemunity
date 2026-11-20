const request = require('supertest')
const { app } = require('../../app')

// ---------------------------------------------------------------------------
// robots.txt for the API origin.
//
// `poemunity-backend.vercel.app` is a SEPARATE host from `poemunity.com`, and
// robots.txt is per-host: the file in `frontend/public/` never reaches here.
// Nor could a static copy — `backend/vercel.json` routes `/(.*)` into this
// function, so anything not matched by a route 404s instead of being served
// from disk. A route is the only shape that works, and until 2026-11-20 there
// was no route at all.
//
// A missing robots.txt means "assume everything is allowed" under RFC 9309.
// That mattered here because this host was the MAJORITY of the site's edge
// traffic (804,966 of 1,310,510 requests in the 30 days to 2026-11-20) and has
// no rate limiter on any GET route: `GET /poems?limit=100&page=N` walks all
// 16,087 poems as JSON with nothing in front of it, and CORS stops browsers but
// not `curl`. The endpoint is trivially discoverable too — `NEXT_PUBLIC_API_URL`
// is a public var baked into the frontend's JS bundle.
//
// What is asserted below is the DISALLOW, not just the status code. A route
// answering 200 with an `Allow: /` in it would satisfy a status-only test and
// leave the door exactly as open as before — the shape of bug
// poemFieldAllowlist.test.js exists to rule out.
//
// The route must also answer WITHOUT a session: a crawler reads robots.txt
// before it decides whether to crawl, so anything behind auth or a limiter that
// 429s it means the bot never learns it should stop. Our own server-to-server
// calls (frontend SSR, the /api/backend proxy) do not read robots.txt at all,
// so this cannot self-DoS the way an IP-keyed rate limit would.
// ---------------------------------------------------------------------------

/** Directives only, comments stripped, so a stray word in prose can't satisfy. */
const directives = text =>
  text
    .split('\n')
    .map(line => line.replace(/#.*$/, '').trim())
    .filter(Boolean)

describe('GET /robots.txt (API origin)', () => {
  test('answers 200 as plain text, with no session in the way', async () => {
    const res = await request(app).get('/robots.txt').expect(200)
    expect(res.headers['content-type']).toMatch(/text\/plain/)
  })

  test('disallows the whole origin for every crawler', async () => {
    const res = await request(app).get('/robots.txt')
    const rules = directives(res.text)

    expect(rules).toContain('User-agent: *')
    expect(rules).toContain('Disallow: /')

    // No Allow anywhere: one reopens the entire API, and there is nothing here
    // worth indexing — the HTML for every poem lives on the frontend.
    expect(rules.filter(rule => /^allow:/i.test(rule))).toEqual([])
  })

  test('serves without a trailing-whitespace or encoding surprise', async () => {
    // Vercel serves this from the same function as the API. If the handler
    // ever returns JSON (an error body, a 404 envelope) instead of text, a
    // crawler parsing it finds no directives and reads it as "allow all" —
    // which is precisely the state this route exists to end.
    const res = await request(app).get('/robots.txt')
    expect(res.text).toMatch(/^User-agent: \*$/m)
    expect(res.text).toMatch(/^Disallow: \/$/m)
    expect(() => JSON.parse(res.text)).toThrow()
  })
})
