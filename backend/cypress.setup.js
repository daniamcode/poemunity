const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

let mongoServer

// Set environment variable for JWT secret
process.env.SECRET = '1234'

// Suppress strictQuery warning
mongoose.set('strictQuery', false)

async function createTestUser() {
  // Import User model after mongoose connection is established
  const User = require('./src/models/User')

  // Check if test user already exists
  const existingUser = await User.findOne({ username: 'test' })
  if (existingUser) {
    console.log('ℹ️  Test user already exists')
    return
  }

  // Create test user
  const hashedPassword = await bcrypt.hash('1234', 10)
  const testUser = new User({
    username: 'test',
    passwordHash: hashedPassword,
    picture: 'default.jpg'
  })

  await testUser.save()
  console.log('👤 Created test user (username: test, password: 1234)')
}

async function setupInMemoryDatabase() {
  console.log('🔧 Setting up in-memory MongoDB for Cypress tests...')

  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()

  console.log(`📦 In-memory MongoDB URI: ${mongoUri}`)

  // Disconnect any existing connections
  await mongoose.disconnect()

  // Connect to in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })

  console.log('✅ Connected to in-memory MongoDB')

  // Create test user
  await createTestUser()
}

// Cleanup function for graceful shutdown
async function cleanupInMemoryDatabase() {
  console.log('🧹 Cleaning up in-memory MongoDB...')

  // Disconnect from in-memory database
  await mongoose.disconnect()

  // Stop in-memory MongoDB instance
  if (mongoServer) {
    await mongoServer.stop()
  }

  console.log('✅ In-memory MongoDB stopped')
}

// Handle process termination
process.on('SIGTERM', async () => {
  await cleanupInMemoryDatabase()
  process.exit(0)
})

process.on('SIGINT', async () => {
  await cleanupInMemoryDatabase()
  process.exit(0)
})

// Initialize the in-memory database
setupInMemoryDatabase().catch(err => {
  console.error('❌ Failed to setup in-memory MongoDB:', err)
  process.exit(1)
})
