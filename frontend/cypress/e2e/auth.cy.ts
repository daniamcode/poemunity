/**
 * E2E: login, logout, and the session cookie.
 *
 * The cookie-to-Bearer proxy path is exercised incidentally by every other
 * spec, because they all call `cy.login()` — which sets the cookie by hand and
 * never touches the form. So the things nobody tested are exactly the ones a
 * real person does first: typing credentials, pressing Logout, and arriving
 * with a cookie that is no longer any good.
 *
 * The session lives in an httpOnly cookie that the browser cannot read; the
 * Next proxy turns it into a Bearer token for the backend. That means the only
 * honest way to test "am I logged in" from here is what the PAGE does — which
 * route it lands on, and whether it renders content only a session can reach.
 *
 * Backend: in-memory MongoMemoryServer on 4201, seeding test/1234 and
 * test2/1234.
 */

const API = 'http://localhost:4201'

/** base64url — the encoding JWT segments use (no padding, `-_` for `+/`). */
function b64url(value: Record<string, unknown>) {
    return btoa(JSON.stringify(value)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function fillLogin(username: string, password: string) {
    cy.get('[data-testid="login"]').within(() => {
        cy.get('input[name="Username"]').clear().type(username)
        cy.get('input[name="Password"]').clear().type(password)
        cy.get('button').contains('Login').click()
    })
}

describe('Login through the form', () => {
    beforeEach(() => {
        cy.clearCookie('token')
        // The form posts to the NEXT route, not to the backend. `/api/auth/login`
        // proxies to `POST /api/v1/login`, and it is the only leg the browser
        // makes — the backend call happens server-side and is invisible here.
        // Intercepting the backend path would wait forever.
        cy.intercept('POST', '**/api/auth/login').as('login')
    })

    it('signs in and leaves the login page', () => {
        cy.visit('/login')

        fillLogin('test', '1234')

        // 204, not the backend's 200: the Next route swallows the raw JWT into a
        // Set-Cookie header and returns no body, so there is nothing to send.
        cy.wait('@login').its('response.statusCode').should('eq', 204)
        // Landing anywhere but /login is the observable success — the cookie is
        // httpOnly, so the browser cannot be asked whether it has one.
        cy.location('pathname').should('not.eq', '/login')
    })

    it('sets a session the SERVER can see, not just the client', () => {
        // /profile is behind middleware that redirects without a cookie. Being
        // allowed to stay there is the proof the cookie was really set and is
        // really being sent.
        cy.visit('/login')
        fillLogin('test', '1234')
        cy.wait('@login')

        cy.visit('/profile')

        cy.location('pathname').should('eq', '/profile')
    })

    it('rejects a wrong password without saying which field was wrong', () => {
        // Login is deliberately non-enumerating: a message naming the username
        // as valid would confirm the account exists to anyone guessing.
        cy.visit('/login')

        fillLogin('test', 'not-the-password')

        cy.wait('@login').its('response.statusCode').should('eq', 401)
        cy.location('pathname').should('eq', '/login')
        // Scoped to the error element on purpose: an unscoped `cy.contains(/password/i)`
        // matches the "Forgot your password?" link, which is on the page whether
        // or not anything failed — a hollow assertion.
        cy.get('.login__error').should('have.text', 'Invalid username or password.')
    })

    it('rejects an unknown user the same way', () => {
        cy.visit('/login')

        fillLogin('nobody-with-this-name', '1234')

        cy.wait('@login').its('response.statusCode').should('eq', 401)
        cy.location('pathname').should('eq', '/login')
        // Byte-identical to the wrong-password message. A different string here
        // — even a nicer one — tells a guesser which usernames exist.
        cy.get('.login__error').should('have.text', 'Invalid username or password.')
    })

    it('accepts the email as well as the username', () => {
        // The backend matches either with a case-insensitive collation.
        cy.visit('/login')

        fillLogin('test@example.com', '1234')

        cy.wait('@login').its('response.statusCode').should('eq', 204)
        cy.location('pathname').should('not.eq', '/login')
    })

    it('will not submit an empty form', () => {
        // The button is disabled until both fields have something, so no
        // pointless round trip is made.
        cy.visit('/login')

        cy.get('[data-testid="login"]').find('button').contains('Login').should('be.disabled')
    })
})

describe('Logout', () => {
    beforeEach(() => {
        cy.clearCookie('token')
        // Logout is a DELETE to the Next route, which is what expires the
        // cookie; the backend is not involved at all.
        cy.intercept('DELETE', '**/api/auth/logout').as('logout')
        cy.login()
    })

    it('clears the session so protected routes are protected again', () => {
        cy.visit('/profile')
        cy.location('pathname').should('eq', '/profile')

        cy.get('.header__logout').click()
        cy.wait('@logout').its('response.statusCode').should('eq', 200)

        // Back to a public page, and /profile now bounces to /login. The second
        // half is the real assertion: a logout that only cleared client state
        // would still let the cookie through.
        cy.location('pathname').should('eq', '/')
        cy.visit('/profile')
        cy.location('pathname').should('eq', '/login')
    })

    it('swaps the logout control back for the login one', () => {
        cy.get('.header__logout').should('exist')

        cy.get('.header__logout').click()
        cy.wait('@logout')

        cy.get('.header__logout').should('not.exist')
        cy.get('.header__login').should('exist')
    })
})

describe('A session that is no longer any good', () => {
    it('a MALFORMED token does not pass as a session', () => {
        // The middleware only checks that a cookie EXISTS, so this gets past it
        // — and then the server-side profile fetch fails and the page must not
        // render as though somebody were signed in. Asserting on the rendered
        // page rather than the redirect is deliberate: the guard is at two
        // layers and only one of them can see that the token is nonsense.
        cy.setCookie('token', 'not-a-real-jwt', { path: '/' })

        cy.visit('/profile', { failOnStatusCode: false })

        cy.get('.profile__intro').should('not.exist')
        cy.get('.header__logout').should('not.exist')
    })

    it('a token signed with the WRONG SECRET is refused by the API', () => {
        // Shape alone is not enough — this one is a structurally valid JWT
        // carrying a REAL author id, so the signature is the only thing wrong
        // with it. That matters: an earlier version forged an id that was not a
        // valid ObjectId, and the lookup blew up before the signature was ever
        // the reason for the 401 — the test passed even with `jwt.verify`
        // swapped for `jwt.decode`, which is the exact hole it exists to guard.
        cy.request(`${API}/api/v1/authors/test-user`).its('body.id').then(realId => {
            const forged = [
                b64url({ alg: 'HS256', typ: 'JWT' }),
                b64url({ id: realId, username: 'test', isAdmin: false }),
                'ZmFrZS1zaWduYXR1cmU'
            ].join('.')

            cy.request({
                method: 'GET',
                url: `${API}/api/v1/users/profile`,
                headers: { Authorization: `Bearer ${forged}` },
                failOnStatusCode: false
            }).its('status').should('eq', 401)
        })
    })

    it('no cookie at all bounces you off /profile', () => {
        cy.clearCookie('token')

        cy.visit('/profile')

        cy.location('pathname').should('eq', '/login')
    })
})
