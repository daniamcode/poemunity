import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Header from './Header'
import { AppContext } from '../../App'
import * as parseJWTModule from '../../utils/parseJWT'

// Mock child components
jest.mock('../SimpleAccordion', () => {
    return function MockAccordion() {
        return <div data-testid="mock-accordion">Accordion</div>
    }
})

jest.mock('./LoginButton', () => {
    return function MockLoginButton() {
        return <button data-testid="login-button">Login</button>
    }
})

jest.mock('./Logout', () => {
    return function MockLogoutButton() {
        return <button data-testid="logout-button">Logout</button>
    }
})

// Mock useLocation
const mockLocation = {
    pathname: '/',
    search: '',
    hash: '',
    state: null
}

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: () => mockLocation
}))

// Mock parseJWT
jest.mock('../../utils/parseJWT')

describe('Header', () => {
    const mockSetState = jest.fn()

    const mockContextLoggedOut = {
        user: '',
        userId: '',
        username: '',
        picture: '',
        adminId: '',
        setState: mockSetState,
        config: {}
    }

    const mockContextLoggedIn = {
        user: 'token123',
        userId: 'user-123',
        username: 'johndoe',
        picture: 'https://example.com/pic.jpg',
        adminId: 'admin-456',
        setState: mockSetState,
        config: {
            headers: {
                Authorization: 'Bearer token123'
            }
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        Storage.prototype.getItem = jest.fn()
        Storage.prototype.setItem = jest.fn()
        ;(parseJWTModule.default as jest.Mock).mockReturnValue({
            id: 'user-123',
            username: 'johndoe',
            picture: 'https://example.com/pic.jpg'
        })
        mockLocation.pathname = '/'
    })

    const renderWithContext = (contextValue: any) => {
        return render(
            <BrowserRouter>
                <AppContext.Provider value={contextValue}>
                    <Header />
                </AppContext.Provider>
            </BrowserRouter>
        )
    }

    test('should render header component', () => {
        renderWithContext(mockContextLoggedOut)
        expect(screen.getByRole('link', { name: /P/ })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /emunity/ })).toBeInTheDocument()
    })

    test('should render Accordion component', () => {
        renderWithContext(mockContextLoggedOut)
        expect(screen.getByTestId('mock-accordion')).toBeInTheDocument()
    })

    test('should render LoginButton when user is not logged in', () => {
        renderWithContext(mockContextLoggedOut)
        expect(screen.getByTestId('login-button')).toBeInTheDocument()
        expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument()
    })

    test('should render LogoutButton when user is logged in', () => {
        renderWithContext(mockContextLoggedIn)
        expect(screen.getByTestId('logout-button')).toBeInTheDocument()
        expect(screen.queryByTestId('login-button')).not.toBeInTheDocument()
    })

    test('should NOT render profile link when user is not logged in', () => {
        const { container } = renderWithContext(mockContextLoggedOut)
        const profileLink = container.querySelector('.header__profile')
        expect(profileLink).not.toBeInTheDocument()
    })

    test('should render profile link when user is logged in', () => {
        const { container } = renderWithContext(mockContextLoggedIn)
        const profileLink = container.querySelector('.header__profile')
        expect(profileLink).toBeInTheDocument()
        expect(profileLink).toHaveAttribute('href', '/profile')
    })

    test('should display default subtitle on home page', () => {
        mockLocation.pathname = '/'
        renderWithContext(mockContextLoggedOut)
        expect(screen.getByText('Your poem community!')).toBeInTheDocument()
    })

    test('should display username subtitle on profile page', () => {
        mockLocation.pathname = '/profile'
        renderWithContext(mockContextLoggedIn)
        expect(screen.getByText("johndoe's Profile")).toBeInTheDocument()
    })

    test('should display default subtitle on non-profile pages', () => {
        mockLocation.pathname = '/detail/123'
        renderWithContext(mockContextLoggedOut)
        expect(screen.getByText('Your poem community!')).toBeInTheDocument()
    })

    test('should initialize user from localStorage when loggedUser exists', () => {
        const mockToken = 'mock-jwt-token'
        ;(Storage.prototype.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockToken))

        renderWithContext(mockContextLoggedOut)

        expect(window.localStorage.getItem).toHaveBeenCalledWith('loggedUser')
        expect(parseJWTModule.default).toHaveBeenCalledWith(mockToken)
        expect(mockSetState).toHaveBeenCalledWith({
            user: mockToken,
            userId: 'user-123',
            username: 'johndoe',
            picture: 'https://example.com/pic.jpg',
            config: {
                headers: {
                    Authorization: `Bearer ${mockToken}`
                }
            }
        })
    })

    test('should NOT call setState when loggedUser is not in localStorage', () => {
        ;(Storage.prototype.getItem as jest.Mock).mockReturnValue(null)

        renderWithContext(mockContextLoggedOut)

        expect(window.localStorage.getItem).toHaveBeenCalledWith('loggedUser')
        expect(mockSetState).not.toHaveBeenCalled()
    })

    test('should NOT call setState when localStorage returns empty string', () => {
        ;(Storage.prototype.getItem as jest.Mock).mockReturnValue('')

        renderWithContext(mockContextLoggedOut)

        expect(window.localStorage.getItem).toHaveBeenCalledWith('loggedUser')
        expect(mockSetState).not.toHaveBeenCalled()
    })

    test('should render all logo parts with correct links', () => {
        renderWithContext(mockContextLoggedOut)
        const links = screen.getAllByRole('link')
        const homeLinks = links.filter(link => link.getAttribute('href') === '/')

        // Should have 3 links to home: P, logo icon, and "emunity"
        expect(homeLinks.length).toBeGreaterThanOrEqual(3)
    })

    test('should have correct CSS classes', () => {
        const { container } = renderWithContext(mockContextLoggedOut)

        expect(container.querySelector('.header')).toBeInTheDocument()
        expect(container.querySelector('.header__dropdown')).toBeInTheDocument()
        expect(container.querySelector('.header__logo')).toBeInTheDocument()
        expect(container.querySelector('.header__text-logo-first')).toBeInTheDocument()
        expect(container.querySelector('.header__logo-icon')).toBeInTheDocument()
        expect(container.querySelector('.header__text-logo-second')).toBeInTheDocument()
        expect(container.querySelector('.list__presentation')).toBeInTheDocument()
        expect(container.querySelector('.separator')).toBeInTheDocument()
    })

    test('should parse JWT and extract user data correctly', () => {
        const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItMTIzIn0.test'
        ;(Storage.prototype.getItem as jest.Mock).mockReturnValue(JSON.stringify(mockToken))
        ;(parseJWTModule.default as jest.Mock).mockReturnValue({
            id: 'user-789',
            username: 'testuser',
            picture: 'test.jpg'
        })

        renderWithContext(mockContextLoggedOut)

        expect(mockSetState).toHaveBeenCalledWith(
            expect.objectContaining({
                userId: 'user-789',
                username: 'testuser',
                picture: 'test.jpg'
            })
        )
    })

    test('should handle profile page with logged in user', () => {
        mockLocation.pathname = '/profile'
        const { container } = renderWithContext(mockContextLoggedIn)

        expect(screen.getByText("johndoe's Profile")).toBeInTheDocument()
        expect(screen.getByTestId('logout-button')).toBeInTheDocument()
        const profileLink = container.querySelector('.header__profile')
        expect(profileLink).toBeInTheDocument()
        expect(profileLink).toHaveAttribute('href', '/profile')
    })

    test('should handle profile page with logged out user', () => {
        mockLocation.pathname = '/profile'
        renderWithContext(mockContextLoggedOut)

        // Username is empty, so should show 's Profile
        expect(screen.getByText("'s Profile")).toBeInTheDocument()
        expect(screen.getByTestId('login-button')).toBeInTheDocument()
    })
})
