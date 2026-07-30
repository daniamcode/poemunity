import { defineConfig } from 'cypress'
import { spawn, ChildProcess } from 'child_process'
import path from 'path'

let backendProcess: ChildProcess | null = null

const TEST_BACKEND_PORT = 4201

async function startBackend() {
    console.log(`🚀 Starting test backend on port ${TEST_BACKEND_PORT}...`)

    const backendDir = path.join(__dirname, '..', 'backend')

    backendProcess = spawn('pnpm', ['test:cypress'], {
        cwd: backendDir,
        stdio: 'inherit',
        shell: true
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
        try {
            // Any route that proves Express AND Mongo are up. /poems/ranking
            // aggregates, so a 200 means the database is genuinely connected —
            // a route that never touches Mongo would answer too early.
            const res = await fetch(`http://localhost:${TEST_BACKEND_PORT}/api/v1/poems/ranking?limit=1`)
            if (res.ok) { ready = true; break }
        } catch {
            // Not listening yet.
        }
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
