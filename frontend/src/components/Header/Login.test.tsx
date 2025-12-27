import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Login from './Login'
import store from '../../redux/store'
import * as loginActions from '../../redux/actions/loginActions'

jest.mock('../../redux/actions/loginActions')

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}))

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <Provider store={store}>{component}</Provider>
        </BrowserRouter>
    )
}

describe('Login', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        Storage.prototype.setItem = jest.fn()
        ;(loginActions.loginAction as jest.Mock).mockReturnValue({ type: 'LOGIN' })
    })

    test('should render login form', () => {
        renderWithProviders(<Login />)
        expect(screen.getByTestId('login')).toBeInTheDocument()
    })

    test('should render username input', () => {
        renderWithProviders(<Login />)
        const usernameInput = screen.getByPlaceholderText('Username')
        expect(usernameInput).toBeInTheDocument()
        expect(usernameInput).toHaveAttribute('type', 'text')
    })

    test('should render password input', () => {
        renderWithProviders(<Login />)
        const passwordInput = screen.getByPlaceholderText('Password')
        expect(passwordInput).toBeInTheDocument()
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    test('should render login button', () => {
        renderWithProviders(<Login />)
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    })

    test('should render register link', () => {
        renderWithProviders(<Login />)
        const registerLink = screen.getByText('Register')
        expect(registerLink).toBeInTheDocument()
        expect(registerLink.closest('a')).toHaveAttribute('href', '/register')
    })

    test('should render instruction label', () => {
        renderWithProviders(<Login />)
        expect(
            screen.getByText(/Introduce your login credentials or click "Register" if you don't have them/i)
        ).toBeInTheDocument()
    })

    test('should update username input value when typing', () => {
        renderWithProviders(<Login />)
        const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement
        fireEvent.change(usernameInput, { target: { value: 'testuser' } })
        expect(usernameInput.value).toBe('testuser')
    })

    test('should update password input value when typing', () => {
        renderWithProviders(<Login />)
        const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        expect(passwordInput.value).toBe('password123')
    })

    test('should handle form submit', () => {
        renderWithProviders(<Login />)
        const form = screen.getByTestId('login')
        fireEvent.submit(form)
        // Form submission is handled and loginAction is dispatched
        expect(loginActions.loginAction).toHaveBeenCalled()
    })

    test('should dispatch loginAction with username and password', () => {
        renderWithProviders(<Login />)
        const usernameInput = screen.getByPlaceholderText('Username')
        const passwordInput = screen.getByPlaceholderText('Password')
        const form = screen.getByTestId('login')

        fireEvent.change(usernameInput, { target: { value: 'john' } })
        fireEvent.change(passwordInput, { target: { value: 'secret' } })
        fireEvent.submit(form)

        expect(loginActions.loginAction).toHaveBeenCalledWith({
            data: {
                username: 'john',
                password: 'secret'
            },
            callbacks: expect.objectContaining({
                success: expect.any(Function),
                error: expect.any(Function)
            })
        })
    })

    test('should clear username and password after submit', () => {
        renderWithProviders(<Login />)
        const usernameInput = screen.getByPlaceholderText('Username') as HTMLInputElement
        const passwordInput = screen.getByPlaceholderText('Password') as HTMLInputElement
        const form = screen.getByTestId('login')

        fireEvent.change(usernameInput, { target: { value: 'john' } })
        fireEvent.change(passwordInput, { target: { value: 'secret' } })
        fireEvent.submit(form)

        expect(usernameInput.value).toBe('')
        expect(passwordInput.value).toBe('')
    })

    test('should store user data in localStorage on successful login', () => {
        const mockUserData = {
            id: 'user-123',
            username: 'john',
            token: 'abc123'
        }

        ;(loginActions.loginAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success(mockUserData)
                }
                return Promise.resolve()
            }
        })

        renderWithProviders(<Login />)
        const usernameInput = screen.getByPlaceholderText('Username')
        const passwordInput = screen.getByPlaceholderText('Password')
        const form = screen.getByTestId('login')

        fireEvent.change(usernameInput, { target: { value: 'john' } })
        fireEvent.change(passwordInput, { target: { value: 'secret' } })
        fireEvent.submit(form)

        expect(window.localStorage.setItem).toHaveBeenCalledWith('loggedUser', JSON.stringify(mockUserData))
    })

    test('should navigate to profile on successful login', () => {
        const mockUserData = { id: 'user-123', username: 'john' }

        ;(loginActions.loginAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success(mockUserData)
                }
                return Promise.resolve()
            }
        })

        renderWithProviders(<Login />)
        const form = screen.getByTestId('login')
        fireEvent.submit(form)

        expect(mockHistoryPush).toHaveBeenCalledWith('profile')
    })

    test('should log error on failed login', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

        ;(loginActions.loginAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.error) {
                    callbacks.error()
                }
                return Promise.resolve()
            }
        })

        renderWithProviders(<Login />)
        const form = screen.getByTestId('login')
        fireEvent.submit(form)

        expect(consoleErrorSpy).toHaveBeenCalledWith('something went wrong in login!')
        consoleErrorSpy.mockRestore()
    })

    test('should NOT navigate to profile on failed login', () => {
        ;(loginActions.loginAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.error) {
                    callbacks.error()
                }
                return Promise.resolve()
            }
        })

        renderWithProviders(<Login />)
        const form = screen.getByTestId('login')
        fireEvent.submit(form)

        expect(mockHistoryPush).not.toHaveBeenCalled()
    })

    test('should apply correct CSS classes', () => {
        const { container } = renderWithProviders(<Login />)
        expect(container.querySelector('.login-container')).toBeInTheDocument()
        expect(container.querySelector('.login-card')).toBeInTheDocument()
        expect(container.querySelector('.login')).toBeInTheDocument()
        expect(container.querySelector('.login__username')).toBeInTheDocument()
        expect(container.querySelector('.login__password')).toBeInTheDocument()
    })
})
