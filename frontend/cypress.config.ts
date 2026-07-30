import { defineConfig } from 'cypress'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'

let backendProcess: ChildProcess | null = null

const TEST_BACKEND_PORT = 4201

/** Is something already serving the test API on this port? */
async function backendIsUp() {
    try {
        const res = await fetch(`http://localhost:${TEST_BACKEND_PORT}/api/v1/poems/ranking?limit=1`)
        return res.ok
    } catch {
        return false
    }
}

async function startBackend() {
    // Cypress can evaluate this config more than once in a single run, and each
    // pass used to spawn its own backend. The extra process could not bind the
    // port, but it DID start its own MongoMemoryServer — and on a cold machine
    // two of those race to download the same ~120MB binary into the same temp
    // file, which is how CI died with `ENOENT: rename ...downloading`. Reusing a
    // backend that already answers makes the spawn idempotent, and lets you keep
    // one running by hand while iterating on specs.
    if (await backendIsUp()) {
        console.log(`♻️  Reusing the test backend already answering on port ${TEST_BACKEND_PORT}`)
        return
    }

    console.log(`🚀 Starting test backend on port ${TEST_BACKEND_PORT}...`)

    const backendDir = path.join(__dirname, '..', 'backend')

    backendProcess = spawn('pnpm', ['test:cypress'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: true,
        // Clear NODE_OPTIONS. Cypress sets it to `--import <tsx loader>` so it
        // can read THIS TypeScript config, and the child inherited it. Node runs
        // module-customization hooks on a worker thread, so the backend's
        // CommonJS entry point got evaluated twice — once normally, once through
        // the loader — starting two MongoMemoryServers in one process. On a cold
        // CI runner those two raced to download the same ~120MB binary and the
        // run died on `ENOENT: rename ...tgz.downloading`. The backend is plain
        // CommonJS; it has no use for a TypeScript loader.
        env: { ...process.env, NODE_OPTIONS: '' }
    })

    backendProcess.on('error', err => {
        console.error('❌ Failed to start backend:', err)
    })

    // POLL for readiness — do not sleep a fixed interval.
    //
    // This used to wait exactly 6 seconds and assume the backend was up. The
    // backend has to download/boot an in-memory MongoDB and seed test users
    // first, which takes wildly different times on a warm laptop and a cold CI
    // runner. Too short and the first spec races an unavailable API; too long
    // and every run pays for the worst case. Polling is both correct and faster.
    console.log('⏳ Waiting for backend to answer...')
    const deadline = Date.now() + 90_000
    let ready = false
    while (Date.now() < deadline) {
        // backendIsUp hits /poems/ranking, which aggregates — a 200 proves
        // Express AND Mongo are up. A route that never touches the database
        // would answer too early.
        if (await backendIsUp()) { ready = true; break }
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    if (!ready) {
        throw new Error(
            `Test backend did not answer on port ${TEST_BACKEND_PORT} within 90s. ` +
            'Running the specs against a dead API would produce a wall of ' +
            'meaningless failures, so stop here instead.'
        )
    }
    console.log(`✅ Test backend ready on port ${TEST_BACKEND_PORT}!`)
    console.log('ℹ️  Your dev backend on port 4200 is unaffected')
}

function stopBackend() {
    console.log('🛑 Stopping test backend...')
    if (backendProcess) {
        backendProcess.kill('SIGTERM')
        backendProcess = null
    }
}

// Cleanup handlers for Cypress process termination
process.on('SIGINT', () => {
    console.log('\n⚠️  Received SIGINT, cleaning up...')
    stopBackend()
    process.exit(0)
})

process.on('SIGTERM', () => {
    console.log('\n⚠️  Received SIGTERM, cleaning up...')
    stopBackend()
    process.exit(0)
})

process.on('exit', () => {
    stopBackend()
})

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:3000',
        supportFile: 'cypress/support/e2e.ts',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        video: false,
        screenshotOnRunFailure: true,
        viewportWidth: 1280,
        viewportHeight: 720,
        defaultCommandTimeout: 10000,
        async setupNodeEvents(on, config) {
            // Start backend immediately when Cypress is opened or run
            await startBackend()

            // For headless mode: stop backend after all tests finish
            on('after:run', () => {
                stopBackend()
            })

            return config
        }
    },
    env: {
        apiUrl: `http://localhost:${TEST_BACKEND_PORT}`
    }
})
