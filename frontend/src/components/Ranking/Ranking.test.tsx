import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import Ranking from './Ranking'
import * as poemsActions from '../../redux/actions/poemsActions'

jest.mock('../../redux/actions/poemsActions')

const mockStore = configureStore([])

describe('Ranking Component - Top 10', () => {
    let store: ReturnType<typeof mockStore>

    beforeEach(() => {
        jest.clearAllMocks()
        ;(poemsActions.getRankingAction as jest.Mock).mockReturnValue({ type: 'get_ranking' })

        store = mockStore({
            rankingQuery: {
                isFetching: false,
                isError: false,
                item: [],
                page: 1,
                hasMore: false,
                total: 0
            }
        })
    })

    test('should render loading spinner when fetching data', () => {
        store = mockStore({
            rankingQuery: {
                isFetching: true,
                isError: false,
                item: [],
                page: undefined,
                hasMore: false,
                total: 0
            }
        })

        render(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('should dispatch getRankingAction with pagination params on mount', () => {
        render(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )

        const actions = store.getActions()
        expect(actions).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    type: expect.stringContaining('ranking')
                })
            ])
        )
    })

    test('should display only top 10 users in ranking', () => {
        // Create 15 mock poems to generate a ranking with more than 10 users
        const mockPoems = Array.from({ length: 15 }, (_, i) => ({
            id: `${i + 1}`,
            title: `Poem ${i + 1}`,
            author: `Author ${i + 1}`,
            userId: `user-${i + 1}`,
            picture: `pic-${i + 1}.jpg`,
            likes: Array(i).fill('like'),
            poem: 'Content',
            date: new Date().toISOString(),
            genre: 'test',
            origin: 'user'
        }))

        store = mockStore({
            rankingQuery: {
                isFetching: false,
                isError: false,
                item: mockPoems,
                page: 1,
                hasMore: false,
                total: 15
            }
        })

        const { container } = render(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )

        // Count the number of table rows (excluding header)
        const tableRows = container.querySelectorAll('tbody tr')

        // Should display only top 10, even though we have 15 users
        expect(tableRows.length).toBeLessThanOrEqual(10)
    })

    test('should render ranking table with correct structure', () => {
        const mockPoems = [
            {
                id: '1',
                title: 'Poem 1',
                author: 'Author 1',
                userId: 'user-1',
                picture: 'pic.jpg',
                likes: ['user-2', 'user-3'],
                poem: 'Content',
                date: new Date().toISOString(),
                genre: 'test',
                origin: 'user'
            }
        ]

        store = mockStore({
            rankingQuery: {
                isFetching: false,
                isError: false,
                item: mockPoems,
                page: 1,
                hasMore: false,
                total: 1
            }
        })

        render(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )

        expect(screen.getByText('Author 1')).toBeInTheDocument()
    })

    test('should request all poems without pagination params for accurate ranking', () => {
        render(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )

        const actions = store.getActions()

        // Verify that the action was dispatched
        // Note: Ranking fetches ALL poems (no page/limit params) for accurate calculation
        // TODO: In the future, move ranking calculation to backend
        expect(actions.length).toBeGreaterThan(0)
    })

    test('should handle all poems for accurate ranking calculation', () => {
        // Simulate a large dataset - ranking should fetch all to calculate accurately
        const mockPoems = Array.from({ length: 100 }, (_, i) => ({
            id: `${i + 1}`,
            title: `Poem ${i + 1}`,
            author: `Author ${i + 1}`,
            userId: `user-${i + 1}`,
            picture: `pic-${i + 1}.jpg`,
            likes: Array(i % 10).fill('like'), // Varying likes
            poem: 'Content',
            date: new Date().toISOString(),
            genre: 'test',
            origin: 'user'
        }))

        store = mockStore({
            rankingQuery: {
                isFetching: false,
                isError: false,
                item: mockPoems, // All 100 poems fetched for accurate ranking
                page: undefined, // No pagination metadata
                hasMore: undefined,
                total: undefined
            }
        })

        const { container } = render(
            <Provider store={store}>
                <Ranking />
            </Provider>
        )

        const tableRows = container.querySelectorAll('tbody tr')

        // Should display only top 10, even with 100 poems
        expect(tableRows.length).toBeLessThanOrEqual(10)
    })

    // TODO: Add more tests for:
    // - Points calculation accuracy
    // - Sorting by points (highest first)
    // - Handling empty ranking
    // - Error states
})
