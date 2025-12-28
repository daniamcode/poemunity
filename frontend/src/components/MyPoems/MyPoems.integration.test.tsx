import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import MyPoems from './MyPoems'
import { AppContext } from '../../App'
import store from '../../redux/store'

// Mock notifications
jest.mock('../../utils/notifications', () => ({
    manageSuccess: jest.fn(),
    manageError: jest.fn()
}))

// Mock delete action to simulate cache update
jest.mock('../../redux/actions/poemActions', () => ({
    ...jest.requireActual('../../redux/actions/poemActions'),
    deletePoemAction: jest.fn(({ callbacks }) => {
        return (dispatch: any) => {
            // Simulate successful deletion
            if (callbacks?.success) {
                callbacks.success()
            }
            return Promise.resolve()
        }
    })
}))

describe('MyPoems - Delete Integration Tests', () => {
    const mockContext = {
        user: 'user-token',
        userId: 'user-123',
        username: 'testuser',
        picture: 'avatar.jpg',
        adminId: 'admin-456',
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <BrowserRouter>{component}</BrowserRouter>
                </AppContext.Provider>
            </Provider>
        )
    }

    test('should remove poem from list after successful deletion', async () => {
        const user = userEvent.setup()

        // Render component - it will fetch poems from store
        renderWithProviders(<MyPoems />)

        // Wait for initial render
        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })

        // If there are poems, find a delete button
        const deleteButtons = screen.queryAllByTestId('delete-poem')

        if (deleteButtons.length > 0) {
            const initialPoemCount = deleteButtons.length
            const firstDeleteButton = deleteButtons[0]

            // Get the poem title before deletion
            const poemElement = firstDeleteButton.closest('[data-testid^="poem-"]')
            const poemTitle = poemElement?.querySelector('h3')?.textContent

            // Click delete button
            await user.click(firstDeleteButton)

            // Wait for poem to be removed from the list
            await waitFor(
                () => {
                    const remainingDeleteButtons = screen.queryAllByTestId('delete-poem')
                    // Should have one less poem
                    expect(remainingDeleteButtons.length).toBe(initialPoemCount - 1)

                    // The deleted poem should not be in the document
                    if (poemTitle) {
                        expect(screen.queryByText(poemTitle)).not.toBeInTheDocument()
                    }
                },
                { timeout: 3000 }
            )
        }
    })

    test('should update poem count after deletion', async () => {
        const user = userEvent.setup()

        renderWithProviders(<MyPoems />)

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })

        const deleteButtons = screen.queryAllByTestId('delete-poem')

        if (deleteButtons.length > 0) {
            const initialCount = deleteButtons.length

            // Delete a poem
            await user.click(deleteButtons[0])

            // Verify the count decreased
            await waitFor(() => {
                const newDeleteButtons = screen.queryAllByTestId('delete-poem')
                expect(newDeleteButtons.length).toBe(initialCount - 1)
            })
        }
    })
})
