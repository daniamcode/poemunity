import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AppContext } from '../../App'
import { Context } from '../../typescript/interfaces'
import VerifyBanner from './VerifyBanner'
import API from '../../redux/actions/axiosInstance'

jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

const baseContext: Context = {
    user: '',
    userId: '',
    username: '',
    picture: '',
    config: {},
    isAdmin: false,
    setState: () => {}
}

function renderWithContext(overrides: Partial<Context>) {
    const value = { ...baseContext, ...overrides }
    return render(
        <AppContext.Provider value={value}>
            <VerifyBanner />
        </AppContext.Provider>
    )
}

describe('VerifyBanner', () => {
    let mockPost: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockPost = jest.fn().mockResolvedValue({ data: {} })
        ;(API as jest.Mock).mockReturnValue({ post: mockPost })
    })

    test('renders nothing for a logged-out visitor', () => {
        const { container } = renderWithContext({ userId: '', emailVerified: false })
        expect(container).toBeEmptyDOMElement()
    })

    test('renders nothing when the user is already verified', () => {
        const { container } = renderWithContext({ userId: 'u1', emailVerified: true })
        expect(container).toBeEmptyDOMElement()
    })

    test('renders nothing when verification state is unknown (undefined)', () => {
        // Avoids nagging users on deploys where the profile predates the field.
        const { container } = renderWithContext({ userId: 'u1', emailVerified: undefined })
        expect(container).toBeEmptyDOMElement()
    })

    test('shows the banner for a signed-in, unverified user and resends on click', async () => {
        renderWithContext({ userId: 'u1', emailVerified: false })
        expect(screen.getByText(/please verify your email/i)).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /resend link/i }))

        await waitFor(() =>
            expect(mockPost).toHaveBeenCalledWith('/api/v1/verify/resend')
        )
        expect(await screen.findByText(/verification email sent/i)).toBeInTheDocument()
    })
})
