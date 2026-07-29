const http = require('http')
const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

// ── Test-suite flakiness fix: one loopback-bound server per test file ───────
// supertest opens a NEW http.Server for EVERY request via `app.listen(0)` —
// with no host, so it binds the WILDCARD address (0.0.0.0). Node sets
// SO_REUSEADDR, so macOS/BSD will hand out an ephemeral port for 0.0.0.0 even
// while another local process already listens on 127.0.0.1 at that exact port:
// different bind address, so the allocator sees no conflict. supertest then
// points its client at 127.0.0.1:<port> and the kernel routes the request to
// the MORE SPECIFIC binding — the other process, not us.
//
// So the suite silently talked to whatever else was running on the machine
// (observed: a stray Cypress runner answering `302 -> /__/`, Chrome answering
// `404`), which surfaced as ~25% of runs failing on a random test with a bogus
// status or a bare `socket hang up`.
//
// We can't just bind loopback inside supertest: `listen(0, host)` resolves the
// host asynchronously, and supertest reads `.address()` synchronously right
// after, so it would read null. Instead we listen ONCE per test file, on
// loopback, and hand supertest that already-listening server. Because
// `app.address()` is then non-null, supertest skips its own `listen(0)`
// entirely (and correspondingly never closes it — see supertest lib/test.js).
// This also removes thousands of listen/close cycles per run.
let sharedServer
let expressApp
const _createServer = http.createServer
http.createServer = function (...args) {
  if (sharedServer && args[args.length - 1] === expressApp) return sharedServer
  return _createServer.apply(this, args)
}

beforeAll(async () => {
  // Required HERE, not at module scope: setup files are evaluated before the
  // test file, so a top-level require would load the app (and its controllers)
  // before the test file's hoisted jest.mock() calls are registered — the
  // controllers would then capture the real module instead of the mock.
  // beforeAll runs after test-file evaluation, so the mocks are already in place
  // and this just picks up the same cached instance the test file got.
  expressApp = require('./app').app
  sharedServer = await new Promise((resolve, reject) => {
    const server = _createServer(expressApp)
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => resolve(server))
  })
})

afterAll(async () => {
  if (sharedServer) await new Promise((resolve) => sharedServer.close(resolve))
})

let mongoServer

// Set environment variable for JWT secret, this is just for test
process.env.SECRET = '1234'

// Suppress strictQuery warning
mongoose.set('strictQuery', false)

// Increase timeout for MongoDB setup
jest.setTimeout(30000)

beforeAll(async () => {
  // Create in-memory MongoDB instance.
  //
  // This runs once PER TEST FILE, so on a cold cache every Jest worker races to
  // download the same mongod binary and fight over its lockfile; the loser dies
  // with "Cannot unlock file .../mongodb-binaries/<v>.lock" and takes its whole
  // suite with it. CI fetches the binary once before Jest starts (see the
  // "Pre-fetch mongod binary" step in .github/workflows/backend.yml) — do not
  // drop that step. Locally the binary is cached after the first run.
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
