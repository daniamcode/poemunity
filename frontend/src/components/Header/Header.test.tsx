import { render, screen } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import Header from './Header'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { AppContext } from '../../App'

const mockStore = configureStore([])

// Mock child components
jest.mock('../SimpleAccordion', () => {
    return function MockAccordion() {
        return <div data-testid='mock-accordion'>Accordion</div>
    }
})

jest.mock('./LoginButton', () => {
    return function MockLoginButton() {
        return <button data-testid='login-button'>Login</button>
    }
})

jest.mock('./Logout', () => {
    return function MockLogoutButton() {
        return <button data-testid='logout-button'>Logout</button>
    }
})

// The bell dispatches a THUNK on mount to fetch its unread count, and
// redux-mock-store carries no thunk middleware. Mocked down to plain actions so
// these tests stay about the header; the bell's own dispatching is covered in
// Notifications/NotificationBell.test.tsx.
jest.mock('../../redux/actions/notificationsActions', () => ({
    fetchUnreadCountAction: jest.fn(() => ({ type: 'FETCH_UNREAD_COUNT' })),
    getNotificationsAction: jest.fn(() => ({ type: 'GET_NOTIFICATIONS' })),
    markNotificationsReadAction: jest.fn(() => ({ type: 'MARK_READ' }))
}))

describe('Header', () => {
    const mockSetState = jest.fn()

    const mockContextLoggedOut = {
        user: '',
        userId: '',
        username: '',
        picture: '',
        isAdmin: false,
        setState: mockSetState,
        config: {}
    }

    const mockContextLoggedIn = {
        user: 'token123',
        userId: 'user-123',
        username: 'johndoe',
        picture: 'https://example.com/pic.jpg',
        isAdmin: false,
        setState: mockSetState,
        config: {
            headers: {
                Authorization: 'Bearer token123'
            }
        }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockRouter.setCurrentUrl('/')
        global.fetch = jest.fn().mockResolvedValue({ ok: false, json: () => Promise.resolve(null) })
    })

    afterEach(() => {
        delete (global as any).fetch
    })

    // The Provider is required because the header now carries the notification
    // bell, which reads the unread count from the store. The bell's own
    // behaviour is tested in Notifications/NotificationBell.test.tsx — here it
    // is only a dependency the harness has to satisfy.
    const renderWithContext = (contextValue: any) => {
        return render(
            <Provider store={mockStore({ unreadCount: { count: 0 }, notificationsQuery: {} })}>
                <AppContext.Provider value={contextValue}>
                    <Header />
                </AppContext.Provider>
            </Provider>
        )
    }

    test('should render header component', () => {
        renderWithContext(mockContextLoggedOut)
        // The brand is a single logo image linking home
        const logoLink = screen.getByRole('link', { name: 'Poemunity home' })
        expect(logoLink).toHaveAttribute('href', '/')
        expect(screen.getByRole('img', { name: 'Poemunity' })).toBeInTheDocument()
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
        const profileLink = container.querySelector('.header__profile-picture')
        expect(profileLink).not.toBeInTheDocument()
    })

    test('should render profile link when user is logged in', () => {
        const { container } = renderWithContext(mockContextLoggedIn)
        const profileLink = container.querySelector('.header__profile-picture')
        expect(profileLink).toBeInTheDocument()
        expect(profileLink).toHaveAttribute('href', '/profile')
    })

    test('should display default subtitle on home page', () => {
        mockRouter.setCurrentUrl('/')
        renderWithContext(mockContextLoggedOut)
        expect(screen.getByText('Your poem community!')).toBeInTheDocument()
    })

    test('should display username subtitle on profile page', () => {
        mockRouter.setCurrentUrl('/profile')
        renderWithContext(mockContextLoggedIn)
        expect(screen.getByText("johndoe's private profile")).toBeInTheDocument()
    })

    test('should display default subtitle on non-profile pages', () => {
        mockRouter.setCurrentUrl('/detail/123')
        renderWithContext(mockContextLoggedOut)
        expect(screen.getByText('Your poem community!')).toBeInTheDocument()
    })

    // These links live in the footer only. In the header they were hidden below
    // 900px, so they duplicated the footer on desktop while leaving mobile with
    // no route to them at all. AI content now carries its own badge, which is
    // what actually needed to survive infinite scroll.
    test('should not duplicate the footer legal links', () => {
        renderWithContext(mockContextLoggedOut)

        expect(screen.queryByRole('link', { name: 'Privacy' })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Terms' })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'AI' })).not.toBeInTheDocument()
    })

    test('should render the logo as a single home link wrapping the wordmark image', () => {
        renderWithContext(mockContextLoggedOut)
        const logoLink = screen.getByRole('link', { name: 'Poemunity home' })
        expect(logoLink).toHaveAttribute('href', '/')

        const logoImg = screen.getByRole('img', { name: 'Poemunity' })
        // Optimised, not the raw PNG: the source is 547x120 and the header
        // draws it at 91x20, so shipping the file whole cost 37 KiB on every
        // page. The old assertion would have forbidden the fix.
        const logoSrc = logoImg.getAttribute('src') || ''
        expect(logoSrc).toContain('/_next/image')
        expect(logoSrc).toContain(encodeURIComponent('/poemunity-logo.png'))
        expect(logoImg).toHaveClass('header__logo-img')
        // The image lives inside the single home link
        expect(logoLink).toContainElement(logoImg)
    })

    test('should offer the logo at the small widths the header actually draws', () => {
        renderWithContext(mockContextLoggedOut)
        const logoImg = screen.getByRole('img', { name: 'Poemunity' })

        // `sizes` is what turns the srcset into width descriptors. Without it
        // next/image derives candidates from the `width` prop alone (1x and 2x),
        // which upscaled the 547px source to 640px and shipped 17 KiB to fill a
        // 91px box on a phone.
        expect(logoImg).toHaveAttribute('sizes')

        const candidates = (logoImg.getAttribute('srcset') || '')
            .split(',')
            .map((entry) => entry.trim())
            .filter(Boolean)
        expect(candidates.length).toBeGreaterThan(0)

        const widths = candidates.map((entry) => {
            const descriptor = entry.split(/\s+/)[1] || ''
            // Density descriptors ("2x") are the failure mode, not a unit we
            // accept: they mean the browser cannot pick by box size.
            expect(descriptor).toMatch(/^\d+w$/)
            return Number.parseInt(descriptor, 10)
        })

        // The narrowest box is 20px tall at 547/120, i.e. 91px wide — 182px on a
        // 2x phone. A srcset whose smallest candidate is bigger than that cannot
        // serve it without waste.
        expect(Math.min(...widths)).toBeLessThanOrEqual(182)
        // And nothing should be upscaled past the source's own 547px.
        expect(widths.some((width) => width <= 547)).toBe(true)
    })

    test('should have correct CSS classes', () => {
        const { container } = renderWithContext(mockContextLoggedOut)

        expect(container.querySelector('.header')).toBeInTheDocument()
        expect(container.querySelector('.header__dropdown')).toBeInTheDocument()
        expect(container.querySelector('.header__logo')).toBeInTheDocument()
        expect(container.querySelector('.header__logo-img')).toBeInTheDocument()
        expect(container.querySelector('.list__presentation')).toBeInTheDocument()
        expect(container.querySelector('.separator')).toBeInTheDocument()
    })

    test('should handle profile page with logged in user', () => {
        mockRouter.setCurrentUrl('/profile')
        const { container } = renderWithContext(mockContextLoggedIn)

        expect(screen.getByText("johndoe's private profile")).toBeInTheDocument()
        expect(screen.getByTestId('logout-button')).toBeInTheDocument()
        const profileLink = container.querySelector('.header__profile-picture')
        expect(profileLink).toBeInTheDocument()
        expect(profileLink).toHaveAttribute('href', '/profile')
    })

    test('should handle profile page with logged out user', () => {
        mockRouter.setCurrentUrl('/profile')
        renderWithContext(mockContextLoggedOut)

        // Username is empty, so should show 's private profile
        expect(screen.getByText("'s private profile")).toBeInTheDocument()
        expect(screen.getByTestId('login-button')).toBeInTheDocument()
    })
})
