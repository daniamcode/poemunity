const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req =>
    process.env.NODE_ENV === 'test' ||
    hasSimulationSecret(req)
})

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
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
  skip: req => process.env.NODE_ENV === 'test'
})

const availabilityLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many availability checks, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test'
})

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many comments, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
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

// The limiters are exported alongside the app so the wiring tests can exercise
// THE instances that are mounted, not a copy of their options re-declared in the
// test — a re-declared limiter passes happily while app.js is edited (max
// raised, limiter unmounted), which is the hollow-test shape AGENTS.md warns
// about. See commentLimiter.test.js and socialRateLimiters.test.js.
module.exports = { app, commentLimiter, likeLimiter, followLimiter, createPoemLimiter }
