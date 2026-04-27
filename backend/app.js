const express = require('express')
const app = express()
const cors = require('cors')

const loginRouter = require('./src/controllers/login')
const registerRouter = require('./src/controllers/register')
const usersRouter = require('./src/controllers/users')
const poemsRouter = require('./src/controllers/poems')
const poemRouter = require('./src/controllers/poem')

app.use(express.json())
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })
)

app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)
app.use('/api/users', usersRouter)
app.use('/api/poems', poemsRouter)
app.use('/api/poem', poemRouter)

app.get('/', (req, res) => {
  res.send('Server is ok')
})

module.exports = app
