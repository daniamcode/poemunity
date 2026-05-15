describe('Ranking', () => {
    describe('No re-fetch on category navigation', () => {
        beforeEach(() => {
            // Stub all API calls so the test doesn't depend on backend data
            cy.intercept('GET', '**/api/authors*', { body: [] }).as('authorsRequest')
            cy.intercept('GET', '**/api/poems*page*', { body: { items: [], total: 0 } }).as('poemsListRequest')
            cy.intercept(
                { method: 'GET', url: '**/api/poems*', query: { origin: 'user' } },
                { body: [] }
            ).as('rankingRequest')
        })

        it('does not call the ranking API again when switching categories', () => {
            cy.visit('/')
            cy.wait('@rankingRequest')

            // The Header also renders the categories accordion inside a hidden dropdown.
            // Target the one in .dashboard__accordion to avoid the hidden header version.
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
