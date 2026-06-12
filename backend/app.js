const express = require('express')
const app = express()
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const loginRouter = require('./src/controllers/login')
const registerRouter = require('./src/controllers/register')
const usersRouter = require('./src/controllers/users')
const poemsRouter = require('./src/controllers/poems')
const poemRouter = require('./src/controllers/poem')
const authorsRouter = require('./src/controllers/authors')
const commentsRouter = require('./src/controllers/comments')

if (process.env.NODE_ENV === 'production' && !process.env.FRONTEND_URL) {
  throw new Error('FRONTEND_URL env var must be set in production')
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
  skip: () => process.env.NODE_ENV === 'test'
})

app.use('/api/v1/login', loginLimiter, loginRouter)
app.use('/api/v1/register', registerLimiter, registerRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/poems', poemsRouter)
app.use('/api/v1/poem', poemRouter)
app.use('/api/v1/authors', authorsRouter)
app.use('/api/v1/comments', commentsRouter)

app.get('/', (req, res) => {
  res.send('Server is ok')
})

module.exports = { app }
