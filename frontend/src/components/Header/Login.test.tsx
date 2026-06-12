import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import mockRouter from 'next-router-mock'
import Login from './Login'
import store from '../../redux/store'

const renderLogin = () =>
    render(
        <Provider store={store}>
            <Login />
        </Provider>
    )

describe('Login', () => {
    let storageSetItemSpy: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        storageSetItemSpy = jest.fn()
        Storage.prototype.setItem = storageSetItemSpy
        mockRouter.setCurrentUrl('/login')
        global.fetch = jest.fn()
    })

    afterEach(() => {
        delete (global as any).fetch
    })

    test('should render login form', () => {
        renderLogin()
        expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    test('should render username input', () => {
        renderLogin()
        const usernameInput = screen.getByPlaceholderText('Username')
        expect(usernameInput).toBeInTheDocument()
        expect(usernameInput).toHaveAttribute('type', 'text')
    })

    test('should render password input', () => {
        renderLogin()
        const passwordInput = screen.getByPlaceholderText('Password')
        expect(passwordInput).toBeInTheDocument()
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should render login button', () => {
        renderLogin()
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    test('should render register link', () => {
        renderLogin()
        const registerLink = screen.getByText('Register')
        expect(registerLink).toBeInTheDocument()
        expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
    })

    test('should render instruction label', () => {
        renderLogin()
        expect(
            screen.getByText(/Introduce your login credentials or click "Register" if you don't have them/i)
        ).toBeInTheDocument()
    })

    test('should update username input value when typing', () => {
        renderLogin()
        const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement
        fireEvent.change(usernameInput, { target: { value: 'testuser' } })
        expect(usernameInput.value).toBe('testuser')
    })

    test('should update password input value when typing', () => {
        renderLogin()
        const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        expect(passwordInput.value).toBe('password123')
    })

    test('should navigate to profile on successful login', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true
        })

        renderLogin()
        const usernameInput = screen.getByPlaceholderText('Username')
        const passwordInput = screen.getByPlaceholderText('Password')
        const form = screen.getByTestId('login')

        fireEvent.change(usernameInput, { target: { value: 'john' } })
        fireEvent.change(passwordInput, { target: { value: 'secret' } })
        fireEvent.submit(form)

        await waitFor(() => expect(mockRouter.pathname).toBe('/profile'))
        expect(storageSetItemSpy).not.toHaveBeenCalled()
    })

    test('should preserve safe internal redirect after login', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true
        })
        mockRouter.setCurrentUrl('/login?from=/profile')

        renderLogin()
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'john' } })
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } })
        fireEvent.submit(screen.getByTestId('login'))

        await waitFor(() => expect(mockRouter.pathname).toBe('/profile'))
    })

    test('should ignore external redirect after login', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: true
        })
        mockRouter.setCurrentUrl('/login?from=https://example.com')

        renderLogin()
        fireEvent.change(screen.getByPlaceholderText('Username'), { target: { value: 'john' } })
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } })
        fireEvent.submit(screen.getByTestId('login'))

        await waitFor(() => expect(mockRouter.pathname).toBe('/profile'))
    })

    test('should show error message on failed login', async () => {
        ;(global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: () => Promise.resolve({ message: 'Invalid credentials' })
        })

        renderLogin()
        const usernameInput = screen.getByPlaceholderText('Username')
        const passwordInput = screen.getByPlaceholderText('Password')
        const form = screen.getByTestId('login')

        fireEvent.change(usernameInput, { target: { value: 'john' } })
        fireEvent.change(passwordInput, { target: { value: 'wrong' } })
        fireEvent.submit(form)

        await waitFor(() => {
            expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument()
        })
        expect(mockRouter.pathname).toBe('/login')
    })

    test('should apply correct CSS classes', () => {
        const { container } = renderLogin()
        expect(container.querySelector('.login-container')).toBeInTheDocument()
        expect(container.querySelector('.login-card')).toBeInTheDocument()
        expect(container.querySelector('.login')).toBeInTheDocument()
        expect(container.querySelector('.login__username')).toBeInTheDocument()
        expect(container.querySelector('.login__password')).toBeInTheDocument()
    })
})
