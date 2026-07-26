import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ForgotPassword from './ForgotPassword'
import API from '../../redux/actions/axiosInstance'

jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

const GENERIC_MESSAGE = 'If an account exists for that email, a reset link has been sent.'

describe('ForgotPassword', () => {
    let mockPost: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockPost = jest.fn().mockResolvedValue({ data: {} })
        ;(API as jest.Mock).mockReturnValue({ post: mockPost })
    })

    test('submits the email to the forgot endpoint and shows the generic message', async () => {
        render(<ForgotPassword />)
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.submit(screen.getByTestId('forgot-password'))

        await waitFor(() => {
            expect(screen.getByText(GENERIC_MESSAGE)).toBeInTheDocument()
        })
        expect(mockPost).toHaveBeenCalledWith('/api/v1/password/forgot', { email: 'test@example.com' })
    })

    test('still shows the same generic message when the request fails (no enumeration)', async () => {
        mockPost.mockRejectedValue(new Error('network down'))
        render(<ForgotPassword />)
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.submit(screen.getByTestId('forgot-password'))

        await waitFor(() => {
            expect(screen.getByText(GENERIC_MESSAGE)).toBeInTheDocument()
        })
    })
})
