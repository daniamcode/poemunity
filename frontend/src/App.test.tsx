import { render, screen, cleanup } from '@testing-library/react'
import App, { AppContext } from './App'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import store from './redux/store'
import '@testing-library/jest-dom'
import React, { useContext } from 'react'

// Mock child components to isolate routing tests
jest.mock('./components/Dashboard/Dashboard', () => {
    return function Dashboard() {
        return <div data-testid='dashboard-component'>Dashboard</div>
    }
})

jest.mock('./components/Detail/Detail', () => {
    return function Detail() {
        return <div data-testid='detail-component'>Detail</div>
    }
})

jest.mock('./components/Profile/Profile', () => {
    return function Profile() {
        return <div data-testid='profile-component'>Profile</div>
    }
})

jest.mock('./components/Header/Login', () => {
    return function Login() {
        return <div data-testid='login-component'>Login</div>
    }
})

jest.mock('./components/Register/Register', () => {
    return function Register() {
        return <div data-testid='register-component'>Register</div>
    }
})

jest.mock('./components/PageNotFound/PageNotFound', () => {
    return function PageNotFound() {
        return <div data-testid='page-not-found-component'>Page Not Found</div>
    }
})

jest.mock('./components/Header/Header', () => {
    return function Header() {
        return <div data-testid='header-component'>Header</div>
    }
})

// Need to test the routing by mocking the Router in App
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

describe('App', () => {
    afterEach(() => {
        cleanup()
    })

    const renderAppWithRoute = (route: string) => {
        return render(
            <Provider store={store}>
                <MemoryRouter initialEntries={[route]}>
                    <App />
                </MemoryRouter>
            </Provider>
        )
    }

    describe('Route matching', () => {
        test('renders Dashboard component on root path', () => {
            renderAppWithRoute('/')
            expect(screen.getByTestId('dashboard-component')).toBeInTheDocument()
        })

        test('renders Detail component on /detail/:poemId path', () => {
            renderAppWithRoute('/detail/123')
            expect(screen.getByTestId('detail-component')).toBeInTheDocument()
        })

        test('renders Detail component on /detail/:poemId path with different ID', () => {
            renderAppWithRoute('/detail/abc-def-456')
            expect(screen.getByTestId('detail-component')).toBeInTheDocument()
        })

        test('renders Dashboard component on /:genre path', () => {
            renderAppWithRoute('/love')
            expect(screen.getByTestId('dashboard-component')).toBeInTheDocument()
        })

        test('renders Profile component on /profile path', () => {
            renderAppWithRoute('/profile')
            expect(screen.getByTestId('profile-component')).toBeInTheDocument()
        })

        test('renders Login component on /login path', () => {
            renderAppWithRoute('/login')
            expect(screen.getByTestId('login-component')).toBeInTheDocument()
        })

        test('renders Register component on /register path', () => {
            renderAppWithRoute('/register')
            expect(screen.getByTestId('register-component')).toBeInTheDocument()
        })
    })

    describe('Route ordering bug prevention', () => {
        test('/detail/:poemId route should NOT be matched by /:genre route', () => {
            renderAppWithRoute('/detail/test-poem-123')

            // Should render Detail component, not Dashboard (genre) component
            expect(screen.getByTestId('detail-component')).toBeInTheDocument()
            expect(screen.queryByTestId('dashboard-component')).not.toBeInTheDocument()
        })

        test('detail route should take precedence over genre route', () => {
            // Test that "detail" is not interpreted as a genre
            renderAppWithRoute('/detail/some-poem-id')

            expect(screen.getByTestId('detail-component')).toBeInTheDocument()
            expect(screen.queryByTestId('dashboard-component')).not.toBeInTheDocument()
        })

        test('various poem IDs navigate to Detail component', () => {
            const poemIds = ['poem-123', 'abc-def-456', 'test-id-789']

            poemIds.forEach(poemId => {
                cleanup()
                renderAppWithRoute(`/detail/${poemId}`)
                expect(screen.getByTestId('detail-component')).toBeInTheDocument()
                expect(screen.queryByTestId('dashboard-component')).not.toBeInTheDocument()
            })
        })

        test('genre routes still work correctly', () => {
            const genres = ['love', 'nature', 'sadness', 'humor']

            genres.forEach(genre => {
                cleanup()
                renderAppWithRoute(`/${genre}`)
                expect(screen.getByTestId('dashboard-component')).toBeInTheDocument()
                expect(screen.queryByTestId('detail-component')).not.toBeInTheDocument()
            })
        })
    })

    describe('Context setState - Race condition bug prevention', () => {
        test('setState should use functional update pattern to avoid stale closures', () => {
            // This test ensures App.tsx uses setContextState(prevState => ...)
            // rather than setContextState({ ...contextState, ...res })
            // This prevents the bug where rapid setState calls lose previous state

            const AppSource = require('fs').readFileSync(require('path').join(__dirname, 'App.tsx'), 'utf8')

            // Check that functional setState is used (CRITICAL for preventing context loss)
            expect(AppSource).toMatch(/setContextState\s*\(\s*prevState\s*=>/)
            expect(AppSource).toMatch(/\.\.\.prevState/)

            // Ensure we're NOT using the buggy pattern that caused context loss
            expect(AppSource).not.toMatch(/setContextState\s*\(\s*{\s*\.\.\.contextState/)
        })

        test('App component renders with context provider', () => {
            const { container } = render(
                <Provider store={store}>
                    <MemoryRouter>
                        <App />
                    </MemoryRouter>
                </Provider>
            )

            // Verify the app structure is rendered
            const appContainer = container.querySelector('.container')
            expect(appContainer).toBeInTheDocument()
        })

        test('Context is available to child components', () => {
            let contextWasCaptured = false

            const TestComponent = () => {
                const ctx = useContext(AppContext)
                contextWasCaptured = ctx !== null && ctx !== undefined
                return null
            }

            render(
                <Provider store={store}>
                    <MemoryRouter>
                        <App />
                        <TestComponent />
                    </MemoryRouter>
                </Provider>
            )

            expect(contextWasCaptured).toBe(true)
        })
    })
})
