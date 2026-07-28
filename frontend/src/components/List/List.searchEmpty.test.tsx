import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import * as Redux from 'react-redux'
import mockRouter from 'next-router-mock'
import List from './List'
import store from '../../redux/store'
import * as poemsActions from '../../redux/actions/poemsActions'
import * as urlUtils from '../../utils/urlUtils'
import { SEARCH_PLACEHOLDER } from '../../data/constants'

jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn()
}))
jest.mock('../../redux/actions/poemsActions')
jest.mock('../../utils/urlUtils', () => ({
    ...jest.requireActual('../../utils/urlUtils'),
    addQueryParam: jest.fn(),
    useFiltersFromQuery: jest.fn()
}))
jest.mock('../ListItem/ListItem', () => function MockListItem() { return null })
jest.mock('../../hooks/useInfiniteScroll', () => ({
    useInfiniteScroll: jest.fn(() => ({ current: null }))
}))
jest.mock('../../App', () => ({
    AppContext: React.createContext({ user: '', userId: '', isAdmin: false, setState: jest.fn() })
}))

// A search only looks inside the filters that are already active, so on a genre
// page "no results" is easy to misread as "search is broken" — which is exactly
// what happened: searching "Shake" on /silence returned nothing while the same
// search on the dashboard returned 97 poems. The empty state has to say WHY.
describe('List — empty search results name their scope', () => {
    const setFilters = (origin: string) => {
        ;(urlUtils.useFiltersFromQuery as jest.Mock).mockReturnValue([
            { orderBy: '', origin },
            jest.fn()
        ])
    }

    const renderList = (props: { genre?: string } = {}) =>
        render(
            <Provider store={store}>
                <List {...props} />
            </Provider>
        )

    beforeEach(() => {
        jest.clearAllMocks()
        mockRouter.setCurrentUrl('/')
        setFilters('all')
        ;(poemsActions.getPoemsListAction as jest.Mock).mockReturnValue({ type: 'GET_POEMS_LIST' })
        // Empty result set, not loading — the state that renders the empty branch.
        ;(Redux.useSelector as jest.Mock).mockImplementation(cb =>
            cb({
                poemsListQuery: { isFetching: false, item: [], hasMore: false, page: 1 },
                poemEntities: { ids: [], entities: {} },
                authorEntities: { ids: [], entities: {} }
            })
        )
    })

    describe('with a query active', () => {
        beforeEach(() => mockRouter.setCurrentUrl('/?q=Shake'))

        test('names the genre that is scoping the search', () => {
            renderList({ genre: 'silence' })

            expect(screen.getByText(/No poems match “Shake” in Silence\./)).toBeInTheDocument()
        })

        test('names the author filter that is scoping the search', () => {
            setFilters('user')
            renderList()

            expect(screen.getByText(/No poems match “Shake” in Users\./)).toBeInTheDocument()
        })

        test('names both when genre and author filter are active together', () => {
            setFilters('famous')
            renderList({ genre: 'silence' })

            expect(screen.getByText(/No poems match “Shake” in Silence · Famous\./)).toBeInTheDocument()
        })

        test('says nothing about scope when the search is genuinely unfiltered', () => {
            renderList()

            expect(screen.getByText('No poems match “Shake”.')).toBeInTheDocument()
            expect(screen.queryByRole('link', { name: /Search all poems/ })).not.toBeInTheDocument()
        })

        // The whole point: one tap out of the filter WITHOUT retyping.
        test('offers a way out that carries the query', () => {
            renderList({ genre: 'silence' })

            expect(screen.getByRole('link', { name: /Search all poems for “Shake”/ }))
                .toHaveAttribute('href', '/?q=Shake')
        })

        test('url-encodes the query in the escape link', () => {
            mockRouter.setCurrentUrl('/?q=' + encodeURIComponent('a b&c'))
            renderList({ genre: 'silence' })

            expect(screen.getByRole('link', { name: /Search all poems/ }))
                .toHaveAttribute('href', '/?q=a%20b%26c')
        })

        test('seeds the search box from the url so the query survives the jump', () => {
            renderList()

            expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toHaveValue('Shake')
        })
    })

    describe('with no query', () => {
        test('keeps the plain filters message and offers no escape link', () => {
            renderList({ genre: 'silence' })

            expect(screen.getByText(/No poems found\. Try adjusting your filters\./)).toBeInTheDocument()
            expect(screen.queryByRole('link', { name: /Search all poems/ })).not.toBeInTheDocument()
        })

        test('a below-threshold query does not count as a search', () => {
            mockRouter.setCurrentUrl('/?q=S')
            renderList({ genre: 'silence' })

            expect(screen.getByText(/No poems found\. Try adjusting your filters\./)).toBeInTheDocument()
        })
    })

    test('an unknown genre slug still reads sensibly rather than blank', () => {
        mockRouter.setCurrentUrl('/?q=Shake')
        renderList({ genre: 'retired-category' })

        expect(screen.getByText(/No poems match “Shake” in retired-category\./)).toBeInTheDocument()
    })
})
