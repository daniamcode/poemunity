const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

let cached = global.mongoose || { conn: null, promise: null }
global.mongoose = cached

const connectMongo = async () => {
  if (cached.conn) return cached.conn

  const isTestMode = process.env.NODE_ENV === 'test'
  if (isTestMode) return null

  const uri = process.env.NODE_ENV === 'development'
    ? process.env.MONGODB_PRE
    : process.env.MONGODB

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
  }

  cached.conn = await cached.promise
  console.log(`Database connected (${process.env.NODE_ENV} mode)`)
  return cached.conn
}

module.exports = connectMongo
