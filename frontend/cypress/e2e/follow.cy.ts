/**
 * E2E: Follow / followers
 *
 * The feature was fully unit-tested and had never run in a browser. The one bug
 * that reached the screen — the follow row sitting hard left under a centred
 * name — was invisible to 1079 passing tests, because `text-align` does not
 * reach a flex container's items. Layout needs a browser; that is the standing
 * lesson in AGENTS.md and the reason this file exists.
 *
 * So this spec deliberately asserts two kinds of thing:
 *   - the round trip (follow, count changes, appears in the tab, unfollow), and
 *   - that the controls are actually USABLE — visible, and reachable by a real
 *     click rather than a forced one. `cy.click()` fails on its own when
 *     something covers the target, which is exactly how comments.cy.ts caught
 *     the delete "×" sliding under a pseudo-element.
 *
 * Backend: in-memory MongoMemoryServer on 4201, seeding test/1234
 * (slug `test-user`) and test2/1234 (slug `test-user-two`).
 */

const API = 'http://localhost:4201'

const OTHER_SLUG = 'test-user-two'
const OTHER_NAME = 'Test User Two'

function loginViaApi(username: string, password = '1234') {
    return cy.request({
        method: 'POST',
        url: `${API}/api/v1/login`,
        body: { username, password }
    }).its('body')
}

/** The other poet needs a poem, or their author page has nothing to render. */
function createPoem(token: string, title: string) {
    return cy.request({
        method: 'POST',
        url: `${API}/api/v1/poems`,
        headers: { Authorization: `Bearer ${token}` },
        body: {
            title,
            poem: 'A poem so this author page has something on it.',
            genre: 'love',
            date: new Date().toISOString()
        }
    })
}

function unfollowViaApi(token: string, slug: string) {
    // Cleanup between tests. Ignores the status: DELETE on an edge that is not
    // there is not an error worth failing a fixture over.
    return cy.request({
        method: 'DELETE',
        url: `${API}/api/v1/authors/${slug}/follow`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false
    })
}

function interceptFollow() {
    cy.intercept('POST', '**/api/v1/authors/*/follow').as('follow')
    cy.intercept('DELETE', '**/api/v1/authors/*/follow').as('unfollow')
    cy.intercept('GET', '**/api/v1/authors/*/following*').as('getFollowing')
    cy.intercept('GET', '**/api/v1/authors/*/followers*').as('getFollowers')
}

/** The follower count as a number, read from the author page. */
function followerCount() {
    return cy.get('.author-detail__follow-count').first().find('strong').invoke('text')
        .then(text => Number(text))
}

describe('Follow / followers', () => {
    let token: string

    before(() => {
        loginViaApi('test2').then(t => {
            createPoem(t as unknown as string, 'A poem by the other poet')
        })
    })

    beforeEach(() => {
        interceptFollow()
        loginViaApi('test').then(t => {
            token = t as unknown as string
            unfollowViaApi(token, OTHER_SLUG)
            cy.setCookie('token', token, { path: '/' })
        })
    })

    describe('from the author page', () => {
        it('follows a poet and the follower count goes up', () => {
            cy.visit(`/authors/${OTHER_SLUG}`)

            followerCount().then(before => {
                cy.contains('button', 'Follow').click()
                cy.wait('@follow').its('response.statusCode').should('eq', 200)

                // The count must move on screen, not just in the response.
                followerCount().should('eq', before + 1)
            })
        })

        it('the button states that you are now following', () => {
            cy.visit(`/authors/${OTHER_SLUG}`)

            cy.contains('button', 'Follow').click()
            cy.wait('@follow')

            // The resting label states the CURRENT state, which is what a
            // reader needs; "Unfollow" is the hover label.
            cy.get('.follow-button').should('have.class', 'follow-button--following')
            cy.get('.follow-button').should('have.attr', 'aria-label', 'Unfollow')
        })

        it('survives a reload — it was really persisted', () => {
            cy.visit(`/authors/${OTHER_SLUG}`)
            cy.contains('button', 'Follow').click()
            cy.wait('@follow')

            cy.reload()

            // SSR carries `isFollowing`, so this must be right on FIRST paint
            // rather than flipping after a client fetch.
            cy.get('.follow-button').should('have.class', 'follow-button--following')
        })

        it('unfollows again, and the count comes back down', () => {
            cy.visit(`/authors/${OTHER_SLUG}`)

            followerCount().then(before => {
                cy.contains('button', 'Follow').click()
                cy.wait('@follow')
                followerCount().should('eq', before + 1)

                cy.get('.follow-button').click()
                cy.wait('@unfollow').its('response.statusCode').should('eq', 200)
                followerCount().should('eq', before)
            })
        })

        it('the button is clickable without force — nothing covers it', () => {
            // The regression this spec exists for is a LAYOUT one. A forced
            // click would pass over a control buried under a pseudo-element,
            // which is exactly how the comment delete "×" bug hid.
            cy.visit(`/authors/${OTHER_SLUG}`)

            cy.get('.follow-button').should('be.visible').click()
            cy.wait('@follow')
        })

        it('the follow row sits under the name, not off to one side', () => {
            // THE bug that reached the screen: the row was hard left under a
            // centred name, because `text-align` does not reach a flex
            // container's items. Asserted as geometry — the row's centre must
            // line up with its container's, which is the thing 1079 unit tests
            // could not see.
            cy.visit(`/authors/${OTHER_SLUG}`)

            // Measured on the row's CONTENTS, not on the row itself. The row is
            // a block-level flex container, so it spans the full width whatever
            // `justify-content` says — comparing its own box to its parent's is
            // an identity that holds under the exact bug this test exists for.
            // A red-check caught that: with `justify-content: flex-start` put
            // back, the box-vs-parent version still passed.
            // Wait for both children to be laid out before measuring. Without
            // this the row is matched while it still has ZERO width, and every
            // geometry assertion compares 0 to 0 and passes — the second half of
            // why the original version of this test had no teeth.
            cy.get('.author-detail__follow-counts').should('be.visible')
            cy.get('.follow-button').should('be.visible')

            cy.get('.author-detail__follow').then($row => {
                const container = $row[0].getBoundingClientRect()
                expect(container.width).to.be.greaterThan(0)
                const children = Array.from($row[0].children)
                    .map(child => child.getBoundingClientRect())
                expect(children.length).to.be.greaterThan(0)

                const contentLeft = Math.min(...children.map(r => r.left))
                const contentRight = Math.max(...children.map(r => r.right))

                const contentCentre = (contentLeft + contentRight) / 2
                const containerCentre = container.left + container.width / 2

                expect(Math.abs(contentCentre - containerCentre)).to.be.lessThan(2)
            })
        })
    })

    describe('the profile tabs', () => {
        it('a poet you follow appears in Following', () => {
            cy.visit(`/authors/${OTHER_SLUG}`)
            cy.contains('button', 'Follow').click()
            cy.wait('@follow')

            cy.visit('/profile')
            cy.contains('[role="tab"]', 'Following').click()
            cy.wait('@getFollowing')

            cy.contains(OTHER_NAME).should('be.visible')
        })

        it('and is gone from Following after unfollowing', () => {
            cy.visit(`/authors/${OTHER_SLUG}`)
            cy.contains('button', 'Follow').click()
            cy.wait('@follow')
            cy.get('.follow-button').click()
            cy.wait('@unfollow')

            cy.visit('/profile')
            cy.contains('[role="tab"]', 'Following').click()
            cy.wait('@getFollowing')

            cy.contains(OTHER_NAME).should('not.exist')
        })

        it('Followers is a different list from Following', () => {
            // The likeliest mistake in this feature is swapping the two
            // directions: `test` follows `test2`, so `test` has one Following
            // and zero Followers. A swap makes both tabs show the same name.
            cy.visit(`/authors/${OTHER_SLUG}`)
            cy.contains('button', 'Follow').click()
            cy.wait('@follow')

            cy.visit('/profile')
            cy.contains('[role="tab"]', 'Followers').click()
            cy.wait('@getFollowers')

            cy.contains(OTHER_NAME).should('not.exist')
        })
    })

    describe('logged out', () => {
        it('shows a link to /login rather than hiding the control', () => {
            // Hiding it hides the affordance entirely, so a visitor never
            // learns the site has following at all and the counts beside it
            // read as decoration.
            cy.clearCookie('token')
            cy.visit(`/authors/${OTHER_SLUG}`)

            cy.get('a.follow-button--guest')
                .should('be.visible')
                .and('have.attr', 'href')
                .and('include', '/login')
        })
    })
})
