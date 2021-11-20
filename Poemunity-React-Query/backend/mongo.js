const mongoose = require('mongoose')

const { MONGODB, MONGODB_PRE, NODE_ENV } = process.env

const connectionString = NODE_ENV === 'development'
? MONGODB_PRE
: MONGODB

mongoose.connect(connectionString, {
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