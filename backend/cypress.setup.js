const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

let mongoServer

// Set environment variable for JWT secret
process.env.SECRET = '1234'

// PIN the verification gate rather than inheriting it.
//
// app.js loads backend/.env, so without this the E2E suite runs under whatever
// the developer happens to have locally — and it is 'true' locally but unset on
// a fresh CI runner with no .env. That is the worst possible combination: the
// specs would fail on the machine of whoever has to fix them and pass on CI,
// where nobody would ever see the gate. Pin it ON, matching production, so the
// suite exercises the configuration real users meet.
process.env.REQUIRE_EMAIL_VERIFICATION = 'true'

// Same reason: .env carries the production FRONTEND_URL, which would make the
// CORS allowlist reject the local frontend outright.
process.env.FRONTEND_URLS = 'http://localhost:3000'

// Suppress strictQuery warning
mongoose.set('strictQuery', false)

async function createTestUsers () {
  const Author = require('./src/models/Author')

  const users = [
    { username: 'test', name: 'Test User', email: 'test@example.com', slug: 'test-user' },
    { username: 'test2', name: 'Test User Two', email: 'test2@example.com', slug: 'test-user-two' }
  ]

  for (const u of users) {
    const exists = await Author.findOne({ username: u.username })
    if (exists) {
      console.log(`ℹ️  Author "${u.username}" already exists`)
      continue
    }
    const passwordHash = await bcrypt.hash('1234', 10)
    // emailVerified: publishing and commenting are gated on it (requireVerified),
    // so an unverified fixture user cannot reach any of the flows these specs
    // exist to test — every write answered 403 and five `before` hooks died.
    // A user who has poems and comments in production is, by construction, a
    // verified one.
    await Author.create({ ...u, passwordHash, type: 'user', fake: false, emailVerified: true })
    console.log(`👤 Created Author "${u.username}" (password: 1234)`)
  }
}

async function setupInMemoryDatabase () {
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

  await createTestUsers()
}

// Cleanup function for graceful shutdown
async function cleanupInMemoryDatabase () {
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
