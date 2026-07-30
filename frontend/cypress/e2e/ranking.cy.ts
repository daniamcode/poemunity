/**
 * E2E: Ranking component behaviour
 *
 * The ranking data is fetched once on app mount (AppProvider useEffect) with
 * a Redux cache guard: only fetches if rankingQuery.item is not already set.
 * Switching genre categories must NOT trigger a second fetch.
 *
 * Actual endpoints (port 4201 in Cypress):
 *   GET /api/v1/poems/ranking?origin=user  ← ranking (server-computed)
 *   GET /api/v1/poems?page=1&limit=...     ← poem list
 *   GET /api/v1/poems/poem-of-the-week     ← weekly pick
 *   GET /api/v1/authors?limit=10           ← authors accordion
 *
 * NOTE ON GLOBS: `*` does not match `/`. `**\/api/v1/poems*` therefore does NOT
 * match /api/v1/poems/ranking — which is why this spec timed out waiting for a
 * request that was being made all along. Ranking used to be a filter on the list
 * endpoint (`/poems?origin=user`); it is its own route now.
 */

describe('Ranking', () => {
    describe('No re-fetch on category navigation', () => {
        beforeEach(() => {
            // Stub authors accordion so it resolves immediately
            cy.intercept('GET', '**/api/v1/authors*', { body: [] }).as('authorsRequest')

            // Stub the poem list (has `page` query param, no `origin`)
            cy.intercept('GET', '**/api/v1/poems*page*', { body: [] }).as('poemsListRequest')

            // Ranking is its own server-computed endpoint now.
            cy.intercept('GET', '**/api/v1/poems/ranking*', { body: [] }).as('rankingRequest')

            // Poem of the week shares the /poems/ prefix — stub it so it cannot
            // be mistaken for the ranking call.
            cy.intercept('GET', '**/api/v1/poems/poem-of-the-week*', { body: { poem: null } })
                .as('poemOfTheWeekRequest')
        })

        it('does not call the ranking API again when switching categories', () => {
            cy.visit('/')
            cy.wait('@rankingRequest')

            // Target the genre links in the dashboard accordion (not the hidden header version)
            cy.get('.dashboard__accordion')
                .contains('a', 'Love')
                .click({ force: true })

            cy.wait(2000)

            // Ranking endpoint must have been called exactly once
            cy.get('@rankingRequest.all').should('have.length', 1)
        })

        it('does not show the ranking loading spinner when switching categories', () => {
            cy.visit('/')
            cy.wait('@rankingRequest')

            cy.get('[data-test="ranking__loading"]').should('not.exist')
            cy.get('.ranking').should('be.visible')

            cy.get('.dashboard__accordion')
                .contains('a', 'Love')
                .click({ force: true })

            cy.get('[data-test="ranking__loading"]').should('not.exist')
            cy.get('.ranking').should('be.visible')
        })
    })
})
