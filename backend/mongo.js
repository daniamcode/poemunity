const mongoose = require('mongoose')

// Suppress strictQuery warning (will be false by default in Mongoose 7)
mongoose.set('strictQuery', false)

const { MONGODB, MONGODB_PRE, MONGODB_TEST, NODE_ENV } = process.env

// Don't auto-connect in test environment (jest.setup.js will handle it)
if (NODE_ENV !== 'test') {
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
      console.log('Database connected')
    }).catch(err => {
      console.error(err)
    })

  process.on('uncaughtException', error => {
    console.error(error)
    mongoose.disconnect()
  })
}

module.exports = mongoose