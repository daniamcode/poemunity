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

    // Wait for backend to be ready (in-memory DB + test user creation)
    console.log('⏳ Waiting for backend to start...')
    await new Promise(resolve => setTimeout(resolve, 6000))
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
