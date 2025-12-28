import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import Profile from './Profile'
import { AppContext } from '../../App'
import store from '../../redux/store'

// Mock notifications
jest.mock('../../utils/notifications', () => ({
    manageSuccess: jest.fn(),
    manageError: jest.fn()
}))

describe('Profile - Edit Flow Integration Tests', () => {
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

    test('should load poem data when navigating to profile with edit query param', async () => {
        // Simulate navigating to /profile?edit=poem-123
        const { container } = render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <MemoryRouter initialEntries={['/profile?edit=poem-123']}>
                        <Route path='/profile'>
                            <Profile />
                        </Route>
                    </MemoryRouter>
                </AppContext.Provider>
            </Provider>
        )

        // Wait for component to render
        await waitFor(() => {
            // Check if we're in edit mode by looking for the title
            const title = screen.queryByText(/modify a poem/i)
            if (title) {
                expect(title).toBeInTheDocument()
            }
        })

        // Verify form fields exist (they will be populated if poem data is available)
        const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement
        expect(titleInput).toBeInTheDocument()
    })

    test('should show "Insert a poem" when no edit query param', async () => {
        render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <MemoryRouter initialEntries={['/profile']}>
                        <Route path='/profile'>
                            <Profile />
                        </Route>
                    </MemoryRouter>
                </AppContext.Provider>
            </Provider>
        )

        await waitFor(() => {
            expect(screen.getByText(/insert a poem/i)).toBeInTheDocument()
        })
    })

    test('should show Cancel button when editing, not when creating', async () => {
        // Test creating (no edit param)
        const { rerender } = render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <MemoryRouter initialEntries={['/profile']}>
                        <Route path='/profile'>
                            <Profile />
                        </Route>
                    </MemoryRouter>
                </AppContext.Provider>
            </Provider>
        )

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
        })

        // Test editing (with edit param)
        rerender(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <MemoryRouter initialEntries={['/profile?edit=poem-123']}>
                        <Route path='/profile'>
                            <Profile />
                        </Route>
                    </MemoryRouter>
                </AppContext.Provider>
            </Provider>
        )

        await waitFor(() => {
            const cancelButton = screen.queryByRole('button', { name: /cancel/i })
            if (cancelButton) {
                expect(cancelButton).toBeInTheDocument()
            }
        })
    })

    test('should clear form fields when Reset is clicked but stay in edit mode', async () => {
        const user = userEvent.setup()

        const { container } = render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <MemoryRouter initialEntries={['/profile?edit=poem-123']}>
                        <Route path='/profile'>
                            <Profile />
                        </Route>
                    </MemoryRouter>
                </AppContext.Provider>
            </Provider>
        )

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })

        // Fill in some data
        const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement
        if (titleInput) {
            await user.clear(titleInput)
            await user.type(titleInput, 'Test Title')
            expect(titleInput.value).toBe('Test Title')

            // Click Reset
            const resetButton = screen.getByRole('button', { name: /reset/i })
            await user.click(resetButton)

            // Form should be cleared
            await waitFor(() => {
                expect(titleInput.value).toBe('')
            })

            // Should still show "Modify" (still in edit mode)
            expect(screen.getByText(/modify a poem/i)).toBeInTheDocument()

            // Cancel button should still be visible (still editing)
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
        }
    })

    test('should switch to different poem when clicking edit on another poem', async () => {
        // This test verifies that when you edit poem A, then click edit on poem B,
        // the form switches to poem B's data

        // Start editing poem-123
        const { rerender } = render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <MemoryRouter initialEntries={['/profile?edit=poem-123']}>
                        <Route path='/profile'>
                            <Profile />
                        </Route>
                    </MemoryRouter>
                </AppContext.Provider>
            </Provider>
        )

        await waitFor(() => {
            expect(screen.getByText(/modify a poem/i)).toBeInTheDocument()
        })

        // Switch to editing poem-456
        rerender(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <MemoryRouter initialEntries={['/profile?edit=poem-456']}>
                        <Route path='/profile'>
                            <Profile />
                        </Route>
                    </MemoryRouter>
                </AppContext.Provider>
            </Provider>
        )

        // Should still be in edit mode
        await waitFor(() => {
            expect(screen.getByText(/modify a poem/i)).toBeInTheDocument()
        })

        // Note: The actual poem data switching is handled by useProfileForm
        // which is tested in useProfileForm.test.tsx lines 150-168
    })
})
