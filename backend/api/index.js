const connectMongo = require('../mongo')
const app = require('../app')

let isConnected = false

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectMongo()
    isConnected = true
  }
  return app(req, res)
}
