import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import Ranking from './Ranking'
import * as poemsActions from '../../redux/actions/poemsActions'

jest.mock('../../redux/actions/poemsActions')

const mockStore = configureStore([])

// The backend now returns a ready-to-render ranking (RankItem[]); the component
// no longer computes anything from poems, it just renders these in order.
const rankItem = (n: number, points: number) => ({
    author: `Author ${n}`,
    picture: `pic-${n}.jpg`,
    authorSlug: `author-${n}`,
    userId: `user-${n}`,
    points
})

const rankingState = (item: any[], overrides: object = {}) => ({
    rankingQuery: { isFetching: false, isError: false, item, ...overrides }
})

const renderRanking = (store: ReturnType<typeof mockStore>) =>
    render(
        <Provider store={store}>
                <Ranking />
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

    test('should display only top 10 entries from the ranking', () => {
        const ranking = Array.from({ length: 15 }, (_, i) => rankItem(i + 1, 100 - i))

        store = mockStore(rankingState(ranking))

        renderRanking(store)

        const rankingItems = screen.getAllByRole('link')
        expect(rankingItems.length).toBeLessThanOrEqual(10)
        expect(screen.getByRole('list')).toBeInTheDocument()
        expect(screen.getAllByRole('listitem')).toHaveLength(rankingItems.length)
    })

    test('renders the server-computed author name and points', () => {
        store = mockStore(rankingState([rankItem(1, 42)]))

        renderRanking(store)

        expect(screen.getByText('Author 1')).toBeInTheDocument()
        // Points come straight from the backend — the component does not recompute.
        expect(screen.getByText('42 pts')).toBeInTheDocument()
    })

    test('resolves an updated avatar/name from authorEntities (no refetch, no stale copy)', () => {
        // The cached ranking row carries the OLD picture/name the server baked in.
        store = mockStore({
            ...rankingState([rankItem(1, 42)]),
            // The user has since changed their avatar and display name; the entity
            // store is the single source of truth and must win over the baked copy.
            authorEntities: {
                ids: ['user-1'],
                entities: {
                    'user-1': { id: 'user-1', name: 'Renamed Poet', picture: 'new-avatar.jpg', slug: 'renamed-poet' }
                }
            }
        })

        renderRanking(store)

        const avatar = screen.getByAltText('Renamed Poet') as HTMLImageElement
        expect(avatar.src).toContain('new-avatar.jpg')
        expect(avatar.src).not.toContain('pic-1.jpg')
        expect(screen.getByText('Renamed Poet')).toBeInTheDocument()
        expect(screen.queryByText('Author 1')).not.toBeInTheDocument()
    })

    test('preserves the backend ordering (does not re-sort)', () => {
        // Deliberately NOT in points order: the component must render as given.
        const ranking = [rankItem(1, 10), rankItem(2, 99), rankItem(3, 50)]

        store = mockStore(rankingState(ranking))

        renderRanking(store)

        const names = screen.getAllByText(/^Author \d+$/).map(el => el.textContent)
        expect(names).toEqual(['Author 1', 'Author 2', 'Author 3'])
    })

    test('renders the retry button and refetches on error', () => {
        store = mockStore(rankingState([], { isError: true }))

        renderRanking(store)

        const retry = screen.getByRole('button', { name: /try again/i })
        retry.click()
        expect(poemsActions.getRankingAction).toHaveBeenCalledWith({
            params: { origin: 'user', poemPoints: 3, likePoints: 1, limit: 10 }
        })
    })
})
