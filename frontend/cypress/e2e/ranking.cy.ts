/**
 * E2E: Ranking component behaviour
 *
 * The ranking data is fetched once on app mount (AppProvider useEffect) with
 * a Redux cache guard: only fetches if rankingQuery.item is not already set.
 * Switching genre categories must NOT trigger a second fetch.
 *
 * Actual endpoints (port 4201 in Cypress):
 *   GET /api/v1/poems?origin=user          ← ranking
 *   GET /api/v1/poems?page=1&limit=...     ← poem list
 *   GET /api/v1/authors?limit=10           ← authors accordion
 */

describe('Ranking', () => {
    describe('No re-fetch on category navigation', () => {
        beforeEach(() => {
            // Stub authors accordion so it resolves immediately
            cy.intercept('GET', '**/api/v1/authors*', { body: [] }).as('authorsRequest')

            // Stub the poem list (has `page` query param, no `origin`)
            cy.intercept('GET', '**/api/v1/poems*page*', { body: [] }).as('poemsListRequest')

            // Stub the ranking fetch (has `origin=user`, no `page`)
            cy.intercept(
                { method: 'GET', url: '**/api/v1/poems*', query: { origin: 'user' } },
                { body: [] }
            ).as('rankingRequest')
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
