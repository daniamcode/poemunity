require('./mongo')

const express = require('express')
const app = express()
const cors = require('cors')
const debug = require('debug')('app')
const path = require('path')
const port = process.env.PORT || 8080

const loginRouter = require('./src/controllers/login')
const registerRouter = require('./src/controllers/register')
const usersRouter = require('./src/controllers/users')
const poemsRouter = require('./src/controllers/poems')
const poemRouter = require('./src/controllers/poem')

app.use(express.json())
app.use(
  cors({
    origin: 'http://localhost:3000', // or the origin of your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })
)

console.log(process.env.NODE_ENV)
console.log(process.env)

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'))
}

app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)
app.use('/api/users', usersRouter)
app.use('/api/poems', poemsRouter)
app.use('/api/poems', poemRouter)

// Only start server if not in test mode
const server = process.env.NODE_ENV !== 'test' ? app.listen(port, () => debug(`running on port ${port}`)) : null

if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'))
  })
} else {
  app.get('/', (req, res) => {
    res.send('Server is ok')
  })
}

module.exports = { app, server }
