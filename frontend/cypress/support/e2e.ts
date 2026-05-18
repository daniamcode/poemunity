// Import Cypress Testing Library commands
import '@testing-library/cypress/add-commands'

// Fail the test with a readable message when an uncaught JS exception occurs.
// Without this Cypress swallows the error text and the assertion failure is cryptic.
Cypress.on('uncaughtException', (err) => {
    throw new Error(`Uncaught exception in app: ${err.message}`)
})

// Default test credentials (seeded by cypress.setup.js in backend)
// test  / 1234  — primary user
// test2 / 1234  — secondary user for cross-user tests

// Programmatic login: bypass the UI form entirely.
// The UI form goes through Next.js /api/auth/login which proxies to port 4200
// (dev backend). Cypress tests use port 4201, so the UI route always 401s.
// Instead: call the test backend directly, then seed localStorage via
// onBeforeLoad so the token is present before the app's JS hydrates.
Cypress.Commands.add('login', (username = 'test', password = '1234') => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:4201/api/v1/login',
        body: { username, password }
    }).then(res => {
        const token = res.body
        // Set the HttpOnly-equivalent cookie so Next.js middleware allows /profile.
        // cy.setCookie bypasses HttpOnly — it runs in Cypress's privileged context.
        cy.setCookie('token', token, { path: '/' })
        // Seed localStorage before React hydrates so the Header reads the token
        // immediately on first render without waiting for the /users/me refresh.
        cy.visit('/', {
            onBeforeLoad(win) {
                win.localStorage.setItem('loggedUser', JSON.stringify(token))
            }
        })
    })
})

Cypress.Commands.add('logout', () => {
    cy.clearLocalStorage('loggedUser')
    cy.visit('/')
})

// Seed a comment via the API directly (faster than UI interaction for setup)
Cypress.Commands.add('seedComment', (poemId: string, body: string, token: string) => {
    cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl') ?? 'http://localhost:4201'}/api/v1/comments`,
        headers: { Authorization: `Bearer ${token}` },
        body: { targetType: 'poem', targetId: poemId, body }
    })
})

// Get the JWT token from localStorage
Cypress.Commands.add('getToken', () => {
    return cy.window().then(win => win.localStorage.getItem('loggedUser'))
})

declare global {
    namespace Cypress {
        interface Chainable {
            login(username?: string, password?: string): Chainable<void>
            logout(): Chainable<void>
            seedComment(poemId: string, body: string, token: string): Chainable<void>
            getToken(): Chainable<string | null>
        }
    }
}

export {}
