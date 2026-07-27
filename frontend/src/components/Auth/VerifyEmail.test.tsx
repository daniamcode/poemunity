import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import VerifyEmail from './VerifyEmail'
import API from '../../redux/actions/axiosInstance'

jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

describe('VerifyEmail', () => {
    let mockPost: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockPost = jest.fn().mockResolvedValue({ data: {} })
        ;(API as jest.Mock).mockReturnValue({ post: mockPost })
    })

    test('posts the token from the URL and shows a success message', async () => {
        mockRouter.setCurrentUrl('/verify-email?token=valid-token')
        render(<VerifyEmail />)

        await waitFor(() =>
            expect(mockPost).toHaveBeenCalledWith('/api/v1/verify/confirm', { token: 'valid-token' })
        )
        expect(await screen.findByText(/your email has been verified/i)).toBeInTheDocument()
    })

    test('shows an invalid/expired message when the backend rejects the token', async () => {
        mockPost.mockRejectedValue({ response: { data: { error: 'This verification link is invalid or has expired.' } } })
        mockRouter.setCurrentUrl('/verify-email?token=bad-token')
        render(<VerifyEmail />)

        expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument()
    })

    test('shows an error and never calls the API when no token is present', async () => {
        mockRouter.setCurrentUrl('/verify-email')
        render(<VerifyEmail />)

        expect(await screen.findByText(/invalid or has expired/i)).toBeInTheDocument()
        expect(mockPost).not.toHaveBeenCalled()
    })
})
