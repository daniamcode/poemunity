require('./bin/dev')

const connectMongo = require('./mongo')
const app = require('./app')
const debug = require('debug')('app')

const port = process.env.PORT || 4200

const start = async () => {
  await connectMongo()
  app.listen(port, () => debug(`running on port ${port}`))
}

start()
