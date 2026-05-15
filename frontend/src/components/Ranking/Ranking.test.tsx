import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'
import Ranking from './Ranking'
import * as poemsActions from '../../redux/actions/poemsActions'

jest.mock('../../redux/actions/poemsActions')

const mockStore = configureStore([])

const renderRanking = (store: ReturnType<typeof mockStore>) =>
    render(
        <Provider store={store}>
            <MemoryRouter>
                <Ranking />
            </MemoryRouter>
        </Provider>
    )

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

        renderRanking(store)

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('should NOT dispatch getRankingAction on mount (fetch is owned by App)', () => {
        renderRanking(store)

        expect(poemsActions.getRankingAction).not.toHaveBeenCalled()
        expect(store.getActions()).toHaveLength(0)
    })

    test('should not trigger any fetch — ranking data is fetched by App on startup', () => {
        renderRanking(store)

        expect(store.getActions()).toHaveLength(0)
    })

    test('should display only top 10 users in ranking', () => {
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

        renderRanking(store)

        const rankingItems = screen.getAllByRole('link')
        expect(rankingItems.length).toBeLessThanOrEqual(10)
    })

    test('should render author name in ranking list', () => {
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

        renderRanking(store)

        expect(screen.getByText('Author 1')).toBeInTheDocument()
    })

    test('should display only top 10 even with 100 poems', () => {
        const mockPoems = Array.from({ length: 100 }, (_, i) => ({
            id: `${i + 1}`,
            title: `Poem ${i + 1}`,
            author: `Author ${i + 1}`,
            userId: `user-${i + 1}`,
            picture: `pic-${i + 1}.jpg`,
            likes: Array(i % 10).fill('like'),
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
                page: undefined,
                hasMore: undefined,
                total: undefined
            }
        })

        renderRanking(store)

        const rankingItems = screen.getAllByRole('link')
        expect(rankingItems.length).toBeLessThanOrEqual(10)
    })
})
