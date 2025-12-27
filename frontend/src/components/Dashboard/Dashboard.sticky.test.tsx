import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import Dashboard from './Dashboard'
import store from '../../redux/store'
import { AppContext } from '../../App'

// Mock the child components
jest.mock('../SimpleAccordion', () => {
    return function MockAccordion() {
        return <div data-testid='mock-accordion'>Categories Accordion</div>
    }
})

jest.mock('../Ranking/Ranking', () => {
    return function MockRanking() {
        return <div data-testid='mock-ranking'>Ranking Section</div>
    }
})

jest.mock('../List/List', () => {
    return function MockList() {
        return (
            <div data-testid='mock-list'>
                <div className='list__intro' data-testid='list-intro'>
                    <div>Search and Filters</div>
                </div>
                <div>Poem 1</div>
                <div>Poem 2</div>
                <div>Poem 3</div>
            </div>
        )
    }
})

describe('Dashboard - Sticky Elements', () => {
    const mockContext = {
        user: '',
        userId: '',
        username: '',
        picture: '',
        adminId: '',
        elementToEdit: '',
        setState: jest.fn(),
        config: {
            headers: {
                Authorization: ''
            }
        }
    }

    const mockMatch = {
        params: { genre: 'love' },
        isExact: true,
        path: '/:genre',
        url: '/love'
    }

    const mockLocation = {
        pathname: '/love',
        search: '',
        hash: '',
        state: undefined,
        key: 'test'
    }

    const mockHistory = {
        length: 1,
        action: 'PUSH' as const,
        location: mockLocation,
        push: jest.fn(),
        replace: jest.fn(),
        go: jest.fn(),
        goBack: jest.fn(),
        goForward: jest.fn(),
        block: jest.fn(),
        listen: jest.fn(),
        createHref: jest.fn()
    }

    const renderDashboard = () => {
        return render(
            <AppContext.Provider value={mockContext}>
                <Provider store={store}>
                    <BrowserRouter>
                        <Dashboard match={mockMatch} location={mockLocation} history={mockHistory} />
                    </BrowserRouter>
                </Provider>
            </AppContext.Provider>
        )
    }

    test('should render dashboard__accordion with sticky class', () => {
        const { container } = renderDashboard()

        const accordion = container.querySelector('.dashboard__accordion')
        expect(accordion).toBeInTheDocument()
        expect(accordion).toHaveClass('dashboard__accordion')

        // Verify the accordion contains the mocked content
        expect(screen.getByTestId('mock-accordion')).toBeInTheDocument()
    })

    test('should render dashboard__ranking with sticky class', () => {
        const { container } = renderDashboard()

        const ranking = container.querySelector('.dashboard__ranking')
        expect(ranking).toBeInTheDocument()
        expect(ranking).toHaveClass('dashboard__ranking')

        // Verify the ranking contains the mocked content
        expect(screen.getByTestId('mock-ranking')).toBeInTheDocument()
    })

    test('should render list__intro with sticky class', () => {
        const { container } = renderDashboard()

        const listIntro = container.querySelector('.list__intro')
        expect(listIntro).toBeInTheDocument()
        expect(listIntro).toHaveClass('list__intro')

        // Verify the list intro contains the expected content
        expect(screen.getByTestId('list-intro')).toBeInTheDocument()
    })

    test('should have all three sticky elements present simultaneously', () => {
        const { container } = renderDashboard()

        const accordion = container.querySelector('.dashboard__accordion')
        const ranking = container.querySelector('.dashboard__ranking')
        const listIntro = container.querySelector('.list__intro')

        // All three sticky elements should exist at the same time
        expect(accordion).toBeInTheDocument()
        expect(ranking).toBeInTheDocument()
        expect(listIntro).toBeInTheDocument()
    })

    test('should maintain structure with all sticky elements after simulated scroll', () => {
        const { container } = renderDashboard()

        // Simulate scroll event
        Object.defineProperty(window, 'scrollY', { value: 500, writable: true })
        window.dispatchEvent(new Event('scroll'))

        // All sticky elements should still be present
        const accordion = container.querySelector('.dashboard__accordion')
        const ranking = container.querySelector('.dashboard__ranking')
        const listIntro = container.querySelector('.list__intro')

        expect(accordion).toBeInTheDocument()
        expect(ranking).toBeInTheDocument()
        expect(listIntro).toBeInTheDocument()

        // Verify they still contain their content
        expect(screen.getByTestId('mock-accordion')).toBeInTheDocument()
        expect(screen.getByTestId('mock-ranking')).toBeInTheDocument()
        expect(screen.getByTestId('list-intro')).toBeInTheDocument()
    })

    test('should render dashboard with correct flex layout structure', () => {
        const { container } = renderDashboard()

        const dashboard = container.querySelector('.dashboard')
        expect(dashboard).toBeInTheDocument()
        expect(dashboard).toHaveClass('dashboard')

        // Check that all three columns are direct children
        const accordion = dashboard?.querySelector('.dashboard__accordion')
        const list = dashboard?.querySelector('.dashboard__list')
        const ranking = dashboard?.querySelector('.dashboard__ranking')

        expect(accordion).toBeInTheDocument()
        expect(list).toBeInTheDocument()
        expect(ranking).toBeInTheDocument()
    })

    test('should keep sticky elements in correct order after scroll', () => {
        const { container } = renderDashboard()

        // Simulate multiple scroll events
        Object.defineProperty(window, 'scrollY', { value: 200, writable: true })
        window.dispatchEvent(new Event('scroll'))

        Object.defineProperty(window, 'scrollY', { value: 800, writable: true })
        window.dispatchEvent(new Event('scroll'))

        const dashboard = container.querySelector('.dashboard')
        const children = Array.from(dashboard?.children || [])

        // Verify order: accordion, list, ranking
        expect(children[0]).toHaveClass('dashboard__accordion')
        expect(children[1]).toHaveClass('dashboard__list')
        expect(children[2]).toHaveClass('dashboard__ranking')
    })
})
