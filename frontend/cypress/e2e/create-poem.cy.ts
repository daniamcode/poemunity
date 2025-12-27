describe('Create Poem Flow', () => {
    beforeEach(() => {
        // Clear cookies and local storage before each test
        cy.clearCookies()
        cy.clearLocalStorage()
    })

    describe('Bug Fix: Create poem and verify My Poems tab updates', () => {
        it('should create a poem and immediately show it in My Poems tab', () => {
            // Login first
            cy.login()

            // Navigate to profile page (wait for it to load)
            cy.visit('/profile')
            cy.wait(1000) // Wait for page to fully load

            // Fill out the form
            cy.get('input[name="title"]').should('be.visible').clear().type('Test Poem Title')
            cy.get('select[name="category"]').should('be.visible').select('Love')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type(
                'This is a beautiful test poem\nWith multiple lines\nTo verify the create flow'
            )

            // Submit the form (button text is "Send")
            cy.get('button').contains('Send').should('be.visible').click()

            // Verify success toast appears (wait for API response)
            cy.contains(/poem created successfully/i, { timeout: 15000 }).should('be.visible')

            // Wait for toast to disappear and cache to update
            cy.wait(2000)

            // Click on "My poems" tab (lowercase 'p')
            cy.contains('My poems').should('be.visible').click()

            // Wait for tab content to load
            cy.wait(1000)

            // CRITICAL TEST: Verify the new poem appears in the list
            cy.contains('Test Poem Title', { timeout: 10000 }).should('be.visible')

            // Verify the poem content is visible
            cy.contains('This is a beautiful test poem').should('be.visible')
        })

        it('should handle creating multiple poems sequentially', () => {
            cy.login()
            cy.visit('/profile')
            cy.wait(1000)

            // Create first poem
            cy.get('input[name="title"]').should('be.visible').clear().type('First Poem')
            cy.get('select[name="category"]').should('be.visible').select('Hope')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type('First poem content')
            cy.get('button').contains('Send').should('be.visible').click()
            cy.contains(/poem created successfully/i, { timeout: 15000 }).should('be.visible')

            // Wait for cache to update and toast to disappear
            cy.wait(2000)

            // Clear form and create second poem
            cy.visit('/profile')
            cy.wait(1000)
            cy.get('input[name="title"]').should('be.visible').clear().type('Second Poem')
            cy.get('select[name="category"]').should('be.visible').select('Love')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type('Second poem content')
            cy.get('button').contains('Send').should('be.visible').click()
            cy.contains(/poem created successfully/i, { timeout: 15000 }).should('be.visible')

            // Wait for cache to update
            cy.wait(2000)

            // Go to My poems tab
            cy.contains('My poems').should('be.visible').click()
            cy.wait(1000)

            // Both poems should be visible, with "Second Poem" first (most recent)
            cy.contains('Second Poem', { timeout: 10000 }).should('be.visible')
            cy.contains('First Poem', { timeout: 10000 }).should('be.visible')
        })
    })

    describe('Bug Fix: Create poem when cache is not loaded', () => {
        it('should not crash when creating a poem on fresh page load', () => {
            // This test simulates Bug #1: creating a poem when cache isn't loaded
            // Before the fix, this would crash with "Cannot read properties of undefined reading push"

            cy.login()

            // Navigate DIRECTLY to profile (simulating fresh load, no cache)
            cy.visit('/profile')
            cy.wait(1000)

            // Immediately create a poem without navigating elsewhere first
            cy.get('input[name="title"]').should('be.visible').clear().type('Fresh Load Poem')
            cy.get('select[name="category"]').should('be.visible').select('Love')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type('Testing fresh load scenario')

            // This should NOT crash the app
            cy.get('button').contains('Send').should('be.visible').click()

            // Should show success (not error toast)
            cy.contains(/poem created successfully/i, { timeout: 15000 }).should('be.visible')

            // Should NOT show error toast
            cy.contains(/error creating/i).should('not.exist')

            // Wait for cache to update
            cy.wait(2000)

            // Verify the poem was actually created by checking My poems tab
            cy.contains('My poems').should('be.visible').click()
            cy.wait(1000)
            cy.contains('Fresh Load Poem', { timeout: 10000 }).should('be.visible')
        })

        it('should handle creating poem when localStorage is empty', () => {
            // Clear all storage to ensure no cached data
            cy.clearLocalStorage()
            cy.clearCookies()

            cy.login()
            cy.visit('/profile')
            cy.wait(1000)

            // Create poem with completely fresh state
            cy.get('input[name="title"]').should('be.visible').clear().type('No Cache Poem')
            cy.get('select[name="category"]').should('be.visible').select('Sad')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type('Testing with no cache')
            cy.get('button').contains('Send').should('be.visible').click()

            // Should succeed without errors
            cy.contains(/poem created successfully/i, { timeout: 15000 }).should('be.visible')

            // Wait for cache to update
            cy.wait(2000)

            // Verify in My poems
            cy.contains('My poems').should('be.visible').click()
            cy.wait(1000)
            cy.contains('No Cache Poem', { timeout: 10000 }).should('be.visible')
        })
    })

    describe('Regression test: Verify all caches are updated', () => {
        it('should update dashboard list after creating poem', () => {
            cy.login()
            cy.visit('/profile')
            cy.wait(1000)

            // Create a poem with unique identifier
            const uniqueTitle = `Dashboard Test ${Date.now()}`
            cy.get('input[name="title"]').should('be.visible').clear().type(uniqueTitle)
            cy.get('select[name="category"]').should('be.visible').select('Love')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type('Testing dashboard update')
            cy.get('button').contains('Send').should('be.visible').click()

            cy.contains(/poem created successfully/i, { timeout: 15000 }).should('be.visible')

            // Wait for cache to update
            cy.wait(2000)

            // Navigate to dashboard
            cy.visit('/')
            cy.wait(1000)

            // The new poem should appear in the dashboard
            cy.contains(uniqueTitle, { timeout: 10000 }).should('be.visible')
        })
    })

    describe('Form validation', () => {
        beforeEach(() => {
            cy.login()
            cy.visit('/profile')
            cy.wait(1000)
        })

        it('should prevent submission with empty title', () => {
            // Fill only category and content, leave title empty
            cy.get('select[name="category"]').should('be.visible').select('Love')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type('Content without title')

            // The Send button should be disabled or clicking it should not submit
            cy.get('button').contains('Send').should('be.disabled')
        })

        it('should prevent submission with empty content', () => {
            // Fill only title and category, leave content empty
            cy.get('input[name="title"]').should('be.visible').clear().type('Title without content')
            cy.get('select[name="category"]').should('be.visible').select('Love')

            // The Send button should be disabled or clicking it should not submit
            cy.get('button').contains('Send').should('be.disabled')
        })
    })

    describe('Console error checking', () => {
        it('should not log console errors when creating poem', () => {
            cy.login()
            cy.visit('/profile', {
                onBeforeLoad(win) {
                    // Spy on console.error
                    cy.spy(win.console, 'error').as('consoleError')
                }
            })

            cy.wait(1000)

            cy.get('input[name="title"]').should('be.visible').clear().type('Error Check Poem')
            cy.get('select[name="category"]').should('be.visible').select('Love')
            cy.get('textarea[name="poem"]').should('be.visible').clear().type('Checking for errors')
            cy.get('button').contains('Send').should('be.visible').click()

            cy.contains(/poem created successfully/i, { timeout: 15000 }).should('be.visible')

            // Check that console.error was not called with crash errors
            cy.get('@consoleError').should(consoleError => {
                const calls = (consoleError as any).getCalls()
                const hasCrashError = calls.some((call: any) =>
                    call.args.some((arg: any) => String(arg).includes('Cannot read properties of undefined'))
                )
                expect(hasCrashError).to.be.false
            })
        })
    })
})
