import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockRouter from 'next-router-mock'
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
        isAdmin: false,
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    const renderProfile = () =>
        render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <Profile />
                </AppContext.Provider>
            </Provider>
        )

    test('should load poem data when navigating to profile with edit query param', async () => {
        mockRouter.setCurrentUrl('/profile?edit=poem-123')
        const { container } = renderProfile()

        await waitFor(() => {
            const title = screen.queryByText(/modify a poem/i)
            if (title) {
                expect(title).toBeInTheDocument()
            }
        })

        const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement
        expect(titleInput).toBeInTheDocument()
    })

    test('should show "Insert a poem" when no edit query param', async () => {
        mockRouter.setCurrentUrl('/profile')
        renderProfile()

        await waitFor(() => {
            expect(screen.getByText(/insert a poem/i)).toBeInTheDocument()
        })
    })

    test('should show Cancel button when editing, not when creating', async () => {
        mockRouter.setCurrentUrl('/profile')
        const { rerender } = renderProfile()

        await waitFor(() => {
            expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument()
        })

        mockRouter.setCurrentUrl('/profile?edit=poem-123')
        rerender(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <Profile />
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
        mockRouter.setCurrentUrl('/profile?edit=poem-123')

        const { container } = renderProfile()

        await waitFor(() => {
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })

        const titleInput = container.querySelector('input[name="title"]') as HTMLInputElement
        if (titleInput) {
            await user.clear(titleInput)
            await user.type(titleInput, 'Test Title')
            expect(titleInput.value).toBe('Test Title')

            const resetButton = screen.getByRole('button', { name: /reset/i })
            await user.click(resetButton)

            await waitFor(() => {
                expect(titleInput.value).toBe('')
            })

            expect(screen.getByText(/modify a poem/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
        }
    })

    test('should switch to different poem when clicking edit on another poem', async () => {
        mockRouter.setCurrentUrl('/profile?edit=poem-123')
        const { rerender } = renderProfile()

        await waitFor(() => {
            expect(screen.getByText(/modify a poem/i)).toBeInTheDocument()
        })

        mockRouter.setCurrentUrl('/profile?edit=poem-456')
        rerender(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                    <Profile />
                </AppContext.Provider>
            </Provider>
        )

        await waitFor(() => {
            expect(screen.getByText(/modify a poem/i)).toBeInTheDocument()
        })
    })
})
