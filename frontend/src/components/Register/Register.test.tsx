import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import mockRouter from 'next-router-mock'
import Register from './Register'
import store from '../../redux/store'
import API from '../../redux/actions/axiosInstance'

jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

const PASSWORD_HELP = 'At least 8 characters, including a letter and a number.'

const renderRegister = () =>
    render(
        <Provider store={store}>
            <Register />
        </Provider>
    )

describe('Register', () => {
    let mockGet: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockGet = jest.fn().mockResolvedValue({ data: {} })
        ;(API as jest.Mock).mockReturnValue({ get: mockGet })
        mockRouter.setCurrentUrl('/register')
    })

    test('shows the password requirements up-front on initial render', () => {
        renderRegister()
        const help = screen.getByText(PASSWORD_HELP)
        expect(help).toBeInTheDocument()
        expect(help).not.toHaveClass('register__help--error')
    })

    test('keeps the button disabled and flags an error for a letters-only password', () => {
        renderRegister()
        fireEvent.change(screen.getByPlaceholderText('Username (3–30 characters)'), { target: { value: 'validuser' } })
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText(/Password/), { target: { value: 'abcdefgh' } })

        expect(screen.getByRole('button', { name: /register/i })).toBeDisabled()
        expect(screen.getByText(PASSWORD_HELP)).toHaveClass('register__help--error')
    })

    test('keeps the button disabled and flags an error for a numbers-only password', () => {
        renderRegister()
        fireEvent.change(screen.getByPlaceholderText('Username (3–30 characters)'), { target: { value: 'validuser' } })
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText(/Password/), { target: { value: '12345678' } })

        expect(screen.getByRole('button', { name: /register/i })).toBeDisabled()
        expect(screen.getByText(PASSWORD_HELP)).toHaveClass('register__help--error')
    })

    test('enables the button for a valid password with letters and numbers', () => {
        renderRegister()
        fireEvent.change(screen.getByPlaceholderText('Username (3–30 characters)'), { target: { value: 'validuser' } })
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } })
        fireEvent.change(screen.getByPlaceholderText(/Password/), { target: { value: 'abc12345' } })

        expect(screen.getByRole('button', { name: /register/i })).toBeEnabled()
        expect(screen.getByText(PASSWORD_HELP)).not.toHaveClass('register__help--error')
    })

    test('shows an availability hint after debounce when the username is taken', async () => {
        mockGet.mockResolvedValue({ data: { usernameAvailable: false } })
        renderRegister()
        fireEvent.change(screen.getByPlaceholderText('Username (3–30 characters)'), { target: { value: 'takenname' } })

        await waitFor(() => {
            expect(screen.getByText('This username is already taken.')).toBeInTheDocument()
        })
    })

    test('does not surface a blocking error when the availability check fails', async () => {
        mockGet.mockRejectedValue(new Error('network down'))
        renderRegister()
        fireEvent.change(screen.getByPlaceholderText('Username (3–30 characters)'), { target: { value: 'somename' } })

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 500))
        })

        expect(screen.queryByText('This username is already taken.')).not.toBeInTheDocument()
        expect(screen.queryByText(/already exist/i)).not.toBeInTheDocument()
    })
})
