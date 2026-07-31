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

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: req =>
    process.env.NODE_ENV === 'test' ||
    (
      process.env.SIMULATION_INTERNAL_SECRET &&
      req.get('x-simulation-secret') === process.env.SIMULATION_INTERNAL_SECRET
    )
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

app.use('/api/v1/login', loginLimiter, loginRouter)
app.use('/api/v1/register/availability', availabilityLimiter)
app.use('/api/v1/register', registerLimiter, registerRouter)
app.use('/api/v1/password', passwordLimiter, passwordRouter)
app.use('/api/v1/verify', verifyLimiter, verifyRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/poems', poemsRouter)
app.use('/api/v1/poem', poemRouter)
// The follow routes share the /authors namespace because they are all "things
// about this author". Mounted FIRST so `/:idOrSlug/follow` and the two list
// paths are matched here before the authors router gets a chance at them.
app.use('/api/v1/authors', followsRouter)
app.use('/api/v1/authors', authorsRouter)
app.use('/api/v1/comments', commentsRouter)
app.use('/api/v1/notifications', notificationsRouter)

app.get('/', (req, res) => {
  res.send('Server is ok')
})

module.exports = { app }
