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

// Programmatic login: bypass the UI form entirely and seed the auth cookie.
// Cypress tests use the test backend on port 4201, while the app reads the same
// cookie through Next.js middleware/session hydration.
Cypress.Commands.add('login', (username = 'test', password = '1234') => {
    cy.request({
        method: 'POST',
        url: 'http://localhost:4201/api/v1/login',
        body: { username, password }
    }).then(res => {
        const token = res.body
        // cy.setCookie bypasses HttpOnly because it runs in Cypress's privileged context.
        cy.setCookie('token', token, { path: '/' })
        cy.visit('/')
    })
})

Cypress.Commands.add('logout', () => {
    cy.clearCookie('token')
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

// Get the JWT token from the Cypress-managed cookie for direct API setup calls.
Cypress.Commands.add('getToken', () => {
    return cy.getCookie('token').then(cookie => cookie?.value ?? null)
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
