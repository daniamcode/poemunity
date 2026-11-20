const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const { rateLimit, ipKeyGenerator } = require('express-rate-limit')

const loginRouter = require('./src/controllers/login')
const registerRouter = require('./src/controllers/register')
const passwordRouter = require('./src/controllers/password')
const verifyRouter = require('./src/controllers/verify')
const adminRouter = require('./src/controllers/admin')
const usersRouter = require('./src/controllers/users')
const poemsRouter = require('./src/controllers/poems')
const poemRouter = require('./src/controllers/poem')
const authorsRouter = require('./src/controllers/authors')
const followsRouter = require('./src/controllers/follows')
const commentsRouter = require('./src/controllers/comments')
const notificationsRouter = require('./src/controllers/notifications')
const userExtractor = require('./src/middleware/userExtractor')

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL env var must be set in production')
}

if (process.env.NODE_ENV === 'production' && !process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY not set — email features are disabled')
}

const getAllowedOrigins = () => {
  if (process.env.FRONTEND_URLS) {
    return process.env.FRONTEND_URLS.split(',').map(origin => origin.trim()).filter(Boolean)
  }
  if (process.env.FRONTEND_URL) return [process.env.FRONTEND_URL]
  return ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
}

app.use(helmet())
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}
app.use(express.json({ limit: '2mb' }))
app.use(
  cors({
    origin: getAllowedOrigins(),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })
)

// The seed/simulation scripts may act at machine speed — they post comments and
// (in `--use-api-likes` mode) PUT likes in bulk — and they authenticate that
// way with a shared secret. Every limiter that the scripts can legitimately
// trip exempts a request carrying it; `skip` below decides per limiter.
const hasSimulationSecret = req =>
  Boolean(process.env.SIMULATION_INTERNAL_SECRET) &&
  req.get('x-simulation-secret') === process.env.SIMULATION_INTERNAL_SECRET

/**
 * The login bucket, keyed per ACCOUNT as well as per address.
 *
 * `req.ip` alone was ONE bucket for the whole site, and two things made it so:
 * Express defaults to `trust proxy: false` (so `req.ip` is the socket address
 * and X-Forwarded-For is ignored), and `pages/api/backend/[...path].ts` is a
 * server-side `fetch` that forwards neither the client IP nor X-Forwarded-For —
 * so every real reader arrives from Vercel's egress IP. Five attempts anywhere
 * exhausted the quota for everyone, for fifteen minutes. That is the
 * "login is broken in production" report, verified live before this change.
 *
 * The identifier being attempted joins the key, which is what gives each reader
 * their own five attempts instead of sharing one. It is also the better key for
 * what this limiter exists to stop — guessing ONE account's password — since a
 * per-IP limit is exactly what a botnet spreads across anyway.
 *
 * Normalised the same way the route matches (CI_COLLATION in
 * controllers/login.js): lowercased, because login accepts username OR email
 * case-insensitively, and a gate that did not would hand five fresh attempts to
 * every spelling of one account.
 *
 * `ipKeyGenerator`, not a bare `req.ip`: it collapses IPv6 to its /56 subnet so
 * one address cannot hand itself a new bucket per interface, and it is the
 * helper express-rate-limit documents for custom keyGenerators — calling it is
 * what keeps the library's own keyGenerator validation satisfied.
 *
 * An absent or non-string username keys to `ip|` — one bucket, which is the
 * right answer for a request that names no account.
 */
const loginIdentifier = body =>
  body && typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: req => `${ipKeyGenerator(req.ip)}|${loginIdentifier(req.body)}`,
  skip: req =>
    process.env.NODE_ENV === 'test' ||
    hasSimulationSecret(req)
})

/**
 * Key for the four gates that have no session to key on: register,
 * availability, password and verify.
 *
 * Same shape as loginLimiter — `<address>|<subject>` — because they suffer the
 * identical bug for the identical reason: `req.ip` is one shared address behind
 * the frontend proxy, so each was ONE bucket for the whole site. 3 registrations
 * an HOUR, 30 availability checks a MINUTE, 5 password resets an HOUR, 10
 * verifications an HOUR — shared by every reader at once. A couple of people on
 * the register page exhausted it for everyone.
 *
 * The subject is whatever the request is ABOUT: the account being registered or
 * reset, the name being checked, the token being confirmed. Lowercased to match
 * the routes' case-insensitive collation (CI_COLLATION), so five spellings of
 * one address cannot buy five quotas. verify/resend carries a session instead
 * and takes it through peekUserId, for the same reason the write limiters do —
 * this key is built before userExtractor runs.
 *
 * THE TRADE-OFF, STATED PLAINLY. These four were per-ACTOR limits by intent,
 * and the old shared bucket capped the whole SITE, which accidentally also
 * capped a determined attacker. Per-subject keying trades that cap away: a
 * legitimate reader is never blocked by strangers again and a direct hit is
 * still bounded per address, but an attacker who varies the subject gets a fresh
 * quota. That is the same trade loginLimiter already made, and for the same
 * reason — a limit that blocks every legitimate reader is not a limit, it is an
 * outage. If a hard site-wide ceiling is wanted back, the way to have both is a
 * second, generous global bucket alongside this one; it is deliberately not
 * bundled here.
 *
 * An absent subject keys to `<address>|` — one bucket, which is the right
 * answer for a request that names nothing.
 */
const gateSubject = req => {
  const session = userExtractor.peekUserId(req)
  if (session) return session

  const body = req.body || {}
  const query = req.query || {}
  const raw = [body.email, query.email, body.username, query.username, body.token]
    .find(value => typeof value === 'string' && value.trim())

  return raw ? raw.trim().toLowerCase() : ''
}

const gateLimitKey = req => `${ipKeyGenerator(req.ip)}|${gateSubject(req)}`

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: gateLimitKey,
  // Only gate account creation (POST). The public availability check (GET) has
  // its own, looser limiter below so debounced typing does not burn the quota.
  skip: req => process.env.NODE_ENV === 'test' || req.method !== 'POST'
})

// Hard rate-limit on password-reset requests so /forgot cannot be used to spray
// reset emails or probe for accounts. Mirrors registerLimiter (per-IP/hour).
const passwordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many password reset attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: gateLimitKey,
  skip: req => process.env.NODE_ENV === 'test'
})

// Rate-limit verification endpoints so /verify/confirm can't be used to brute
// tokens and /verify/resend can't spray emails. Mirrors passwordLimiter.
const verifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many verification attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: gateLimitKey,
  skip: req => process.env.NODE_ENV === 'test'
})

const availabilityLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many availability checks, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: gateLimitKey,
  skip: () => process.env.NODE_ENV === 'test'
})

/**
 * Key for the four authenticated-write limiters: ONE BUCKET PER ACCOUNT.
 *
 * `req.userId` cannot be read here — userExtractor runs inside the routers,
 * which these limiters are mounted AHEAD of — so the key peeks at the session
 * token itself (signature check only, synchronous; see peekUserId).
 *
 * WHY THIS IS NEEDED. All four keyed on `req.ip` alone, and behind the
 * frontend's /api/backend proxy every request arrives from Vercel's egress IP.
 * So each was ONE bucket for the whole site: 10 comments a minute, 30 likes,
 * 10 follows and 10 poems shared by every reader at once — a handful of
 * comments anywhere stopped everybody commenting. That is the same failure
 * that broke login (see loginLimiter above), on four more routes.
 *
 * Per-account is also the truer model for what these limiters exist to stop —
 * one account working the social graph at machine speed — since a per-IP limit
 * is exactly what a botnet spreads across anyway.
 *
 * Falls back to the client address when there is no usable session, which is
 * the bucket these limiters used before: a request that names no account can
 * only be judged by where it came from. It also keeps the unauthenticated path
 * behaving exactly as it did, so socialRateLimiters.test.js still pins it.
 */
const writeLimitKey = req =>
  userExtractor.peekUserId(req) ?? ipKeyGenerator(req.ip)

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many comments, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: writeLimitKey,
  skip: req =>
    process.env.NODE_ENV === 'test' ||
    req.method !== 'POST' ||
    hasSimulationSecret(req)
})

// Likes are the highest-frequency social write, and the route TOGGLES, so a
// script can flip one poem forever — each turn raising a notification on its
// author. 30/min per IP: a human reader never approaches it, and the
// simulation's API-likes mode (which PUTs in bulk) carries the secret above.
const likeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many likes, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: writeLimitKey,
  skip: req =>
    process.env.NODE_ENV === 'test' ||
    req.method !== 'PUT' ||
    hasSimulationSecret(req)
})

// Follow and unfollow are the same spam class: each can raise a notification on
// the target, and the pair shares one quota because together they are "how fast
// can this IP work the social graph". Mounted on /api/v1/authors ahead of BOTH
// routers there — but only POST/DELETE count, and authorsRouter has none, so
// the public author reads and the followers/following lists never touch it.
const followLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many follow requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: writeLimitKey,
  skip: req =>
    process.env.NODE_ENV === 'test' ||
    (req.method !== 'POST' && req.method !== 'DELETE') ||
    hasSimulationSecret(req)
})

// The last unthrottled write. Creation is already gated on verification when
// the flag is on, but with it off — or for a verified spam account — register
// (3/h per IP) was the only brake on how fast one IP could fill the site.
const createPoemLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many poems, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: writeLimitKey,
  skip: req =>
    process.env.NODE_ENV === 'test' ||
    req.method !== 'POST' ||
    hasSimulationSecret(req)
})

app.use('/api/v1/login', loginLimiter, loginRouter)
app.use('/api/v1/register/availability', availabilityLimiter)
app.use('/api/v1/register', registerLimiter, registerRouter)
app.use('/api/v1/password', passwordLimiter, passwordRouter)
app.use('/api/v1/verify', verifyLimiter, verifyRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/poems', createPoemLimiter, poemsRouter)
app.use('/api/v1/poem', likeLimiter, poemRouter)
// The follow routes share the /authors namespace because they are all "things
// about this author". Mounted FIRST so `/:idOrSlug/follow` and the two list
// paths are matched here before the authors router gets a chance at them.
// followLimiter goes ahead of everything on this path — it only counts
// POST/DELETE, which only the follow routes are.

app.use('/api/v1/authors', followLimiter)
app.use('/api/v1/authors', followsRouter)
app.use('/api/v1/authors', authorsRouter)
app.use('/api/v1/comments', commentLimiter, commentsRouter)
app.use('/api/v1/notifications', notificationsRouter)

app.get('/', (req, res) => {
  res.send('Server is ok')
})

/**
 * robots.txt for THIS origin.
 *
 * `poemunity-backend.vercel.app` is a different host from `poemunity.com`, and
 * robots.txt is per-host — the file in `frontend/public/` can never reach here.
 * Nor could a static copy: `backend/vercel.json` routes `/(.*)` into this
 * function, so anything not matched by a route below 404s instead of being
 * served from disk. A route is the only shape that works.
 *
 * Disallow everything. The API returns JSON whose HTML already exists on the
 * frontend, so a crawler gains nothing from indexing it and the frontend loses
 * nothing by it going. This host is the majority of the site's edge traffic
 * (804,966 of 1,310,510 requests in the 30 days to 2026-11-20) and had NO
 * robots.txt before this line — a missing file means "assume everything is
 * allowed" under RFC 9309, which is the open door a scraper walks through to
 * page through all 16,087 poems as JSON with no limiter standing in the way.
 *
 * It cannot throttle our own traffic: robots.txt is read only by crawlers.
 * The frontend's server-side fetches and the `/api/backend` proxy ignore it
 * entirely, so this cannot self-DoS the way an IP-keyed rate limit would.
 */
const API_ROBOTS_TXT = [
  '# Poemunity API — JSON, not pages.',
  '# Every poem is served as HTML at https://poemunity.com, which is what',
  '# should be crawled. There is nothing here worth indexing.',
  'User-agent: *',
  'Disallow: /',
  ''
].join('\n')

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(API_ROBOTS_TXT)
})

// The limiters are exported alongside the app so the wiring tests can exercise
// THE instances that are mounted, not a copy of their options re-declared in the
// test — a re-declared limiter passes happily while app.js is edited (max
// raised, limiter unmounted), which is the hollow-test shape AGENTS.md warns
// about. See commentLimiter.test.js, socialRateLimiters.test.js,
// perAccountWriteLimiters.test.js and gateRateLimiters.test.js.
module.exports = {
  app,
  commentLimiter,
  likeLimiter,
  followLimiter,
  createPoemLimiter,
  loginLimiter,
  registerLimiter,
  availabilityLimiter,
  passwordLimiter,
  verifyLimiter
}
