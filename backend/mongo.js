const mongoose = require('mongoose')

// Suppress strictQuery warning (will be false by default in Mongoose 7)
mongoose.set('strictQuery', false)

const { MONGODB, MONGODB_PRE, NODE_ENV } = process.env

// Don't auto-connect when running tests
// - Jest tests: jest.setup.js will handle in-memory DB
// - Cypress tests: cypress.setup.js will handle in-memory DB
const isTestMode = NODE_ENV === 'test'

if (!isTestMode) {
  let connectionString
  if (NODE_ENV === 'development') {
    connectionString = MONGODB_PRE
  } else {
    connectionString = MONGODB
  }

  mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log(`Database connected (${NODE_ENV} mode)`)
    }).catch(err => {
      console.error(err)
    })

  process.on('uncaughtException', error => {
    console.error(error)
    mongoose.disconnect()
  })
}

module.exports = mongoose