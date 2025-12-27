// Import Cypress Testing Library commands
import '@testing-library/cypress/add-commands'

// Custom command to login
// Default credentials: username='test', password='1234' (existing test user)
Cypress.Commands.add('login', (username = 'test', password = '1234') => {
    cy.visit('/login')

    // The login form doesn't use proper labels, so we use name/placeholder selectors
    cy.get('input[name="Username"]').clear().type(username)
    cy.get('input[name="Password"]').clear().type(password)
    cy.get('button').contains('Login').click()

    // Wait for redirect to profile page
    cy.url().should('include', '/profile', { timeout: 10000 })

    // Verify authentication token is stored
    cy.window().then(win => {
        const loggedUser = win.localStorage.getItem('loggedUser')
        expect(loggedUser).to.not.be.null
    })
})

// Custom command to create test user (if backend supports it)
Cypress.Commands.add('createTestUser', () => {
    return cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/api/register`,
        body: {
            username: 'test',
            password: '1234',
            picture: 'default.jpg'
        },
        failOnStatusCode: false
    })
})

// Extend Cypress namespace for TypeScript
declare global {
    namespace Cypress {
        interface Chainable {
            login(username?: string, password?: string): Chainable<void>
            createTestUser(): Chainable<Response<any>>
        }
    }
}

export {}
