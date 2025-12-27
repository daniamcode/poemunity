const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongoServer

// Set environment variable for JWT secret, this is just for test
process.env.SECRET = '1234'

// Suppress strictQuery warning
mongoose.set('strictQuery', false)

// Increase timeout for MongoDB setup
jest.setTimeout(30000)

beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  // Disconnect any existing connections
  await mongoose.disconnect()

  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
})

afterAll(async () => {
  // Disconnect from in-memory database
  await mongoose.disconnect()

  // Stop in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop()
  }
})

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})
