const mongoose = require('mongoose')

const { MONGODB } = process.env
// const { MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV } = process.env

// const connectionString = NODE_ENV === 'test'
// ? MONGO_DB_URI_TEST
// : MONGO_DB_URI

mongoose.connect(MONGODB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
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