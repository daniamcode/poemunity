/**
 * E2E: Registration flow
 *
 * Covers the happy path (create account -> redirect to /login -> the new
 * credentials actually authenticate) and the error cases the form must reject:
 * duplicate username, duplicate email (anti-enumeration), and invalid email
 * format (blocked client-side before any request).
 *
 * Backend runs on port 4201 (in-memory DB) seeded by backend/cypress.setup.js
 * with users `test` / `test2` (password 1234, emails test@example.com /
 * test2@example.com). NODE_ENV=test there, so the register rate limiter is
 * skipped. Registration now also issues an email-verification token, but with
 * no RESEND_API_KEY the send is a no-op — signup still succeeds and can log in
 * immediately.
 */

const API_URL = 'http://localhost:4201'

function fillForm(username: string, email: string, password: string) {
    cy.get('input[name="Username"]').clear().type(username)
    cy.get('input[name="Email"]').clear().type(email)
    cy.get('input[name="Password"]').clear().type(password)
}

describe('Registration flow', () => {
    beforeEach(() => {
        cy.clearCookie('token')
        cy.visit('/register')
    })

    it('registers a new user, redirects to /login, and the new credentials authenticate', () => {
        // Unique per run so repeated runs (in-memory DB persists for the backend
        // process) never collide on the unique username/email indexes.
        const unique = Date.now()
        const username = `newuser${unique}`
        const email = `newuser${unique}@example.com`

        fillForm(username, email, 'password123')
        cy.get('button').contains('Register').should('be.enabled').click()

        // Success sends the user to the login page (no auto-login).
        cy.location('pathname').should('eq', '/login')

        // Proof the account was really created: the chosen credentials log in.
        cy.request({
            method: 'POST',
            url: `${API_URL}/api/v1/login`,
            body: { username, password: 'password123' }
        })
            .its('status')
            .should('eq', 200)
    })

    it('rejects a duplicate username and stays on /register', () => {
        // `test` is seeded, so it always collides.
        fillForm('test', `fresh${Date.now()}@example.com`, 'password123')
        cy.get('button').contains('Register').should('be.enabled').click()

        cy.get('.register__error').should('be.visible').and('contain', 'already exists')
        cy.location('pathname').should('eq', '/register')
    })

    it('rejects a duplicate email WITHOUT confirming the account exists (anti-enumeration)', () => {
        // test@example.com is seeded. The server must reply with a neutral
        // message that never reveals the email is registered.
        fillForm(`freshname${Date.now()}`, 'test@example.com', 'password123')
        cy.get('button').contains('Register').should('be.enabled').click()

        cy.get('.register__error')
            .should('be.visible')
            .and('contain', 'could not complete registration')
            .and('not.contain', 'already exists')
            .and('not.contain', 'already registered')
        cy.location('pathname').should('eq', '/register')
    })

    it('blocks submission for an invalid email format (no request is sent)', () => {
        fillForm('someuser', 'not-an-email', 'password123')

        // Client-side validation surfaces the message and disables the button, so
        // the form is never submitted and the user never leaves /register.
        cy.get('.register__error').should('be.visible').and('contain', 'valid email')
        cy.get('button').contains('Register').should('be.disabled')
        cy.location('pathname').should('eq', '/register')
    })
})
