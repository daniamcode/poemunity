const express = require('express')
const app = express()
const cors = require('cors')

const loginRouter = require('./src/controllers/login')
const registerRouter = require('./src/controllers/register')
const usersRouter = require('./src/controllers/users')
const poemsRouter = require('./src/controllers/poems')
const poemRouter = require('./src/controllers/poem')
const authorsRouter = require('./src/controllers/authors')

app.use(express.json({ limit: '2mb' }))
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })
)

app.use('/api/v1/login', loginRouter)
app.use('/api/v1/register', registerRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/poems', poemsRouter)
app.use('/api/v1/poem', poemRouter)
app.use('/api/v1/authors', authorsRouter)

app.get('/', (req, res) => {
  res.send('Server is ok')
})

module.exports = { app }
