import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import ResetPassword from './ResetPassword'
import API from '../../redux/actions/axiosInstance'

jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

describe('ResetPassword', () => {
    let mockPost: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockPost = jest.fn().mockResolvedValue({ data: {} })
        ;(API as jest.Mock).mockReturnValue({ post: mockPost })
        mockRouter.setCurrentUrl('/reset-password?token=valid-token')
    })

    test('posts { token, password } and routes to /login on success', async () => {
        render(<ResetPassword />)
        fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } })
        fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } })
        fireEvent.submit(screen.getByTestId('reset-password'))

        await waitFor(() => expect(mockRouter.pathname).toBe('/login'))
        expect(mockPost).toHaveBeenCalledWith('/api/v1/password/reset', {
            token: 'valid-token',
            password: 'newpass123'
        })
    })

    test('shows the inline error when the token is invalid/expired', async () => {
        mockPost.mockRejectedValue({ response: { data: { error: 'This reset link is invalid or has expired.' } } })
        render(<ResetPassword />)
        fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } })
        fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'newpass123' } })
        fireEvent.submit(screen.getByTestId('reset-password'))

        await waitFor(() => {
            expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument()
        })
        expect(mockRouter.pathname).toBe('/reset-password')
    })

    test('a mismatched confirm-password blocks submission', async () => {
        render(<ResetPassword />)
        fireEvent.change(screen.getByPlaceholderText('New password'), { target: { value: 'newpass123' } })
        fireEvent.change(screen.getByPlaceholderText('Confirm new password'), { target: { value: 'different123' } })
        fireEvent.submit(screen.getByTestId('reset-password'))

        // Nothing is posted and we stay on the page.
        await waitFor(() => {
            expect(screen.getAllByText('Passwords do not match.').length).toBeGreaterThan(0)
        })
        expect(mockPost).not.toHaveBeenCalled()
        expect(mockRouter.pathname).toBe('/reset-password')
    })

    test('shows an invalid-link message when no token is present', () => {
        mockRouter.setCurrentUrl('/reset-password')
        render(<ResetPassword />)
        expect(screen.getByText(/invalid or has expired/i)).toBeInTheDocument()
        expect(screen.queryByTestId('reset-password')).not.toBeInTheDocument()
    })
})
