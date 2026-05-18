/**
 * E2E: Comments feature
 *
 * Strategy: create poems via the API (using test users), store their IDs from
 * the response, then navigate to /detail/:id to exercise the comment flows.
 * A second user ("test2") is used for cross-user scenarios.
 *
 * Backend: in-memory MongoMemoryServer started by cypress.setup.js on port 4201.
 * Users seeded: test/1234 and test2/1234.
 *
 * Intercept strategy:
 *   - GET  /api/v1/comments  — intercepted + awaited before reading any comment state
 *   - POST /api/v1/comments  — intercepted + awaited; body verified where parentId matters
 *   - DELETE /api/v1/comments/:id — intercepted + awaited to prove the API call was made
 */

const API = 'http://localhost:4201'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createPoem(token: string, title: string) {
    return cy.request({
        method: 'POST',
        url: `${API}/api/v1/poems`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
            title,
            poem: 'A test poem body for comment flows.',
            genre: 'love',
            author: 'test',
            date: new Date().toISOString()
        }
    })
}

function loginViaApi(username: string, password = '1234') {
    return cy.request({
        method: 'POST',
        url: `${API}/api/v1/login`,
        body: { username, password }
    }).its('body')
}

function postComment(token: string, poemId: string, body: string, parentId?: string) {
    return cy.request({
        method: 'POST',
        url: `${API}/api/v1/comments`,
        headers: { Authorization: `Bearer ${token}` },
        body: { targetType: 'poem', targetId: poemId, body, parentId: parentId ?? null }
    }).its('body')
}

/** Register GET + POST + DELETE intercepts and return their aliases */
function interceptComments() {
    cy.intercept('GET', '**/api/v1/comments*').as('getComments')
    cy.intercept('POST', '**/api/v1/comments').as('postComment')
    cy.intercept('DELETE', '**/api/v1/comments/**').as('deleteComment')
}

// ─── Auth gate ────────────────────────────────────────────────────────────────

describe('Comments — auth gate', () => {
    let poemId: string

    before(() => {
        loginViaApi('test').then(token => {
            createPoem(token, 'Auth Gate Poem').then(res => {
                poemId = res.body.id
            })
        })
    })

    it('logged-out user sees login link instead of comment form', () => {
        interceptComments()
        cy.clearLocalStorage()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.contains('Log in').should('be.visible')
        cy.get('textarea').should('not.exist')
    })

    it('login link points to /login', () => {
        cy.clearLocalStorage()
        cy.visit(`/detail/${poemId}`)
        cy.get('a[href="/login"]').should('exist')
    })

    it('logged-in user sees comment textarea', () => {
        interceptComments()
        cy.login()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.get('textarea').should('be.visible')
    })
})

// ─── Post a comment ───────────────────────────────────────────────────────────

describe('Comments — posting', () => {
    let poemId: string
    let token: string

    before(() => {
        loginViaApi('test').then(t => {
            token = t
            createPoem(token, 'Comment Post Poem').then(res => {
                poemId = res.body.id
            })
        })
    })

    beforeEach(() => cy.login())

    it('types and submits a comment, which appears in the list', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')

        cy.get('textarea').type('This is my comment')
        cy.get('button').contains('Post').click()
        cy.wait('@postComment').its('request.body').should('deep.include', {
            targetType: 'poem',
            targetId: poemId,
            body: 'This is my comment'
        })
        cy.contains('This is my comment', { timeout: 8000 }).should('be.visible')
    })

    it('comment count increments after posting', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)

        cy.wait('@getComments').then(interception => {
            const initialCount = (interception.response?.body as unknown[]).length

            cy.contains(/\d+ Comment/).invoke('text').should(text => {
                expect(parseInt(text as string)).to.equal(initialCount)
            })

            cy.get('textarea').type('One more comment')
            cy.get('button').contains('Post').click()
            cy.wait('@postComment')
            cy.contains('One more comment', { timeout: 8000 }).should('be.visible')

            cy.contains(/\d+ Comment/).invoke('text').should(after => {
                expect(parseInt(after as string)).to.equal(initialCount + 1)
            })
        })
    })

    it('textarea is cleared after posting', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')

        cy.get('textarea').type('Will be cleared')
        cy.get('button').contains('Post').click()
        cy.wait('@postComment')
        cy.contains('Will be cleared', { timeout: 8000 }).should('be.visible')
        cy.get('textarea').should('have.value', '')
    })

    it('submit button is disabled when textarea is empty', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.get('button').contains('Post').should('be.disabled')
    })

    it('submit button is disabled for whitespace-only input', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.get('textarea').type('   ')
        cy.get('button').contains('Post').should('be.disabled')
    })
})

// ─── Delete own comment ───────────────────────────────────────────────────────

describe('Comments — delete own comment', () => {
    let poemId: string

    before(() => {
        loginViaApi('test').then(t => {
            createPoem(t, 'Delete Flow Poem').then(res => {
                poemId = res.body.id
            })
        })
    })

    it('Delete button is visible on own comment', () => {
        loginViaApi('test').then(t => {
            postComment(t, poemId, 'My deletable comment').then(() => {
                interceptComments()
                cy.login()
                cy.visit(`/detail/${poemId}`)
                cy.wait('@getComments')
                cy.get('textarea').should('be.visible')
                cy.contains('My deletable comment', { timeout: 8000 })
                    .closest('li')
                    .find('button[aria-label="Delete comment"]')
                    .should('be.visible')
            })
        })
    })

    it('clicking delete opens the confirmation modal', () => {
        loginViaApi('test').then(t => {
            postComment(t, poemId, 'Modal check comment').then(() => {
                interceptComments()
                cy.login()
                cy.visit(`/detail/${poemId}`)
                cy.wait('@getComments')
                cy.contains('Modal check comment', { timeout: 8000 }).should('be.visible')

                cy.contains('Modal check comment')
                    .closest('li')
                    .find('button[aria-label="Delete comment"]')
                    .click()

                cy.get('[role="dialog"]').should('be.visible')
                cy.contains('Delete comment').should('be.visible')
                cy.contains('This action cannot be undone.').should('be.visible')
                cy.contains('button', 'Cancel').click()
                cy.get('[role="dialog"]').should('not.exist')
            })
        })
    })

    it('confirms and removes comment from list — DELETE request verified', () => {
        loginViaApi('test').then(t => {
            postComment(t, poemId, 'Comment to delete').then(created => {
                interceptComments()
                cy.login()
                cy.visit(`/detail/${poemId}`)
                cy.wait('@getComments')
                cy.contains('Comment to delete', { timeout: 8000 }).should('be.visible')

                cy.contains('Comment to delete')
                    .closest('li')
                    .find('button[aria-label="Delete comment"]')
                    .click()
                cy.get('[role="dialog"]').should('be.visible')
                cy.contains('button', 'Delete').click()

                // Verify the DELETE request was made to the correct endpoint
                cy.wait('@deleteComment').then(interception => {
                    expect(interception.request.url).to.include(created.id)
                    expect(interception.response?.statusCode).to.equal(204)
                })

                cy.contains('Comment to delete', { timeout: 8000 }).should('not.exist')
            })
        })
    })

    it('cancelling modal keeps the comment — no DELETE request made', () => {
        loginViaApi('test').then(t => {
            postComment(t, poemId, 'Kept comment').then(() => {
                interceptComments()
                cy.login()
                cy.visit(`/detail/${poemId}`)
                cy.wait('@getComments')
                cy.contains('Kept comment', { timeout: 8000 }).should('be.visible')

                cy.contains('Kept comment')
                    .closest('li')
                    .find('button[aria-label="Delete comment"]')
                    .click()
                cy.get('[role="dialog"]').should('be.visible')
                cy.contains('button', 'Cancel').click()

                cy.get('[role="dialog"]').should('not.exist')
                cy.contains('Kept comment').should('be.visible')
                // Confirm no DELETE was fired
                cy.get('@deleteComment.all').should('have.length', 0)
            })
        })
    })
})

// ─── Reply flow ───────────────────────────────────────────────────────────────

describe('Comments — reply flow', () => {
    let poemId: string
    let parentCommentId: string
    let token: string

    before(() => {
        loginViaApi('test').then(t => {
            token = t
            createPoem(token, 'Reply Flow Poem').then(res => {
                poemId = res.body.id
                postComment(token, poemId, 'Parent comment here').then(comment => {
                    parentCommentId = comment.id
                })
            })
        })
    })

    beforeEach(() => cy.login())

    it('clicking Reply shows a reply textarea', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.contains('Parent comment here', { timeout: 8000 }).should('be.visible')
        cy.get('button').contains('Reply').first().click()
        cy.get('textarea[placeholder="Write a reply…"]').should('be.visible')
    })

    it('Cancel hides the reply form without posting', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.contains('Parent comment here', { timeout: 8000 }).should('be.visible')
        cy.get('button').contains('Reply').first().click()
        cy.get('textarea[placeholder="Write a reply…"]').should('be.visible')
        cy.get('button').contains('Cancel').click()
        cy.get('textarea[placeholder="Write a reply…"]').should('not.exist')
        cy.get('@postComment.all').should('have.length', 0)
    })

    it('submits a reply with the correct parentId in the POST body', () => {
        interceptComments()
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.contains('Parent comment here', { timeout: 8000 }).should('be.visible')

        cy.get('button').contains('Reply').first().click()
        cy.get('textarea[placeholder="Write a reply…"]').type('My nested reply')
        cy.get('button[type="submit"]').contains('Reply').click()

        // Verify the POST included the correct parentId
        cy.wait('@postComment').its('request.body').should('deep.include', {
            targetType: 'poem',
            targetId: poemId,
            parentId: parentCommentId
        })

        cy.contains('My nested reply', { timeout: 8000 }).should('be.visible')
        cy.get('textarea[placeholder="Write a reply…"]').should('not.exist')
    })
})

// ─── Cross-user interactions ──────────────────────────────────────────────────

describe('Comments — cross-user interactions', () => {
    let poemId: string
    let tokenA: string
    let tokenB: string

    before(() => {
        loginViaApi('test').then(t => {
            tokenA = t
            createPoem(tokenA, 'Cross-User Poem').then(res => {
                poemId = res.body.id
            })
        })
        loginViaApi('test2').then(t => { tokenB = t })
    })

    it('User B sees User A comment on User A poem', () => {
        postComment(tokenA, poemId, 'Alice was here').then(() => {
            interceptComments()
            cy.login('test2')
            cy.visit(`/detail/${poemId}`)
            cy.wait('@getComments')
            cy.contains('Alice was here', { timeout: 8000 }).should('be.visible')
        })
    })

    it('User B does not see Delete button on User A comment', () => {
        postComment(tokenA, poemId, 'Only Alice can delete this').then(() => {
            interceptComments()
            cy.login('test2')
            cy.visit(`/detail/${poemId}`)
            cy.wait('@getComments')
            cy.get('textarea').should('be.visible')
            cy.contains('Only Alice can delete this', { timeout: 8000 })
                .closest('li')
                .find('button[aria-label="Delete comment"]')
                .should('not.exist')
        })
    })

    it('User B can post their own comment on User A poem', () => {
        interceptComments()
        cy.login('test2')
        cy.visit(`/detail/${poemId}`)
        cy.wait('@getComments')
        cy.get('textarea').type('Bob was also here')
        cy.get('button').contains('Post').click()
        cy.wait('@postComment').its('request.body').should('deep.include', {
            targetType: 'poem',
            targetId: poemId
        })
        cy.contains('Bob was also here', { timeout: 8000 }).should('be.visible')
    })

    it('User A sees User B reply nested under User A comment', () => {
        postComment(tokenA, poemId, 'Alice top-level').then(parent => {
            postComment(tokenB, poemId, 'Bob replies to Alice', parent.id).then(() => {
                interceptComments()
                cy.login('test')
                cy.visit(`/detail/${poemId}`)
                cy.wait('@getComments')
                cy.contains('Alice top-level', { timeout: 8000 }).should('be.visible')
                cy.contains('Bob replies to Alice', { timeout: 8000 }).should('be.visible')
                // Verify nesting: Bob's reply is inside Alice's list item
                cy.contains('Alice top-level')
                    .closest('li')
                    .contains('Bob replies to Alice')
                    .should('exist')
            })
        })
    })

    it('User A can delete their own comment; DELETE request verified', () => {
        postComment(tokenA, poemId, 'Delete this reply A').then(created => {
            postComment(tokenB, poemId, 'Bob also commented B')
            interceptComments()
            cy.login('test')
            cy.visit(`/detail/${poemId}`)
            cy.wait('@getComments')
            cy.get('textarea').should('be.visible')
            cy.contains('Delete this reply A', { timeout: 8000 }).should('be.visible')

            cy.contains('Delete this reply A')
                .closest('li')
                .find('button[aria-label="Delete comment"]')
                .click()

            cy.get('[role="dialog"]').should('be.visible')
            cy.contains('button', 'Delete').click()

            cy.wait('@deleteComment').then(interception => {
                expect(interception.request.url).to.include(created.id)
                expect(interception.response?.statusCode).to.equal(204)
            })

            cy.contains('Delete this reply A', { timeout: 8000 }).should('not.exist')
            cy.contains('Bob also commented B').should('be.visible')
        })
    })

    it('User B cannot delete User A comment — no Delete button visible', () => {
        postComment(tokenA, poemId, 'Protected comment C').then(() => {
            interceptComments()
            cy.login('test2')
            cy.visit(`/detail/${poemId}`)
            cy.wait('@getComments')
            cy.get('textarea').should('be.visible')
            cy.contains('Protected comment C', { timeout: 8000 }).should('be.visible')
            cy.contains('Protected comment C')
                .closest('li')
                .find('button[aria-label="Delete comment"]')
                .should('not.exist')
        })
    })
})
