require('./mongo')

const express = require('express')
const app = express()
const debug = require('debug')('app')
const path = require('path')
const port = process.env.PORT || 8080

const loginRouter = require('./src/controllers/login')
const registerRouter = require('./src/controllers/register')
const usersRouter = require('./src/controllers/users')
const poemsRouter = require('./src/controllers/poems')
const poemRouter = require('./src/controllers/poem')

app.use(express.json())

console.log(process.env.NODE_ENV)
console.log(process.env)
// console.log('test3')

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'))
}

app.use('/api/login', loginRouter)
app.use('/api/register', registerRouter)
app.use('/api/users', usersRouter)
app.use('/api/poems', poemsRouter)
app.use('/api/poems', poemRouter)

const server = app.listen(port, () => debug(`running on port ${port}`))

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