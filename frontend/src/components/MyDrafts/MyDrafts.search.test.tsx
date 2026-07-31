import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import MyDrafts from './MyDrafts'
import { AppContext } from '../../App'
import * as poemsActions from '../../redux/actions/poemsActions'
import { SEARCH_DEBOUNCE_MS } from '../../hooks/useDebouncedValue'
import {
    SEARCH_PLACEHOLDER,
    SEARCH_MIN_LENGTH,
    SEARCH_NO_RESULTS,
    MY_DRAFTS_EMPTY,
    PAGINATION_LIMIT
} from '../../data/constants'

jest.mock('../../utils/notifications')
jest.mock('../../redux/actions/poemsActions', () => ({
    ...jest.requireActual('../../redux/actions/poemsActions'),
    getMyDraftsAction: jest.fn(() => ({ type: 'GET_MY_DRAFTS' }))
}))

const mockGetMyDrafts = poemsActions.getMyDraftsAction as jest.Mock
const mockStore = configureStore([])

// Drafts search is the same policy as My poems (useSearchQuery owns the
// debounce, the minimum length and the AbortController), so these tests focus
// on what is specific here rather than re-proving the hook:
//
//   * the request must NOT carry a `userId` param. Draft scoping comes from the
//     session on the server — `GET /poems?status=draft` sets `authorId` from
//     `req.userId` last, overriding anything a query param asked for. A test
//     copied from MyPoems that asserted `userId: 'user-1'` would be asserting a
//     param this component must never send.
//   * `status: 'draft'` is added by the action, not the component, so searching
//     can never widen the list to published poems.
//   * an empty result during a search says "no results", not "you have no
//     drafts" — the second is a lie that would send someone looking for work
//     they still have.
describe('MyDrafts - server-backed search', () => {
    const context = {
        user: 'token',
        userId: 'user-1',
        username: 'testuser',
        picture: '',
        isAdmin: false,
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    const tree = (isFetching: boolean) => (
        <Provider
            store={mockStore({
                myDraftsQuery: { item: [], isFetching, hasMore: false, page: 1, error: null },
                poemEntities: { ids: [], entities: {} },
                authorEntities: { ids: [], entities: {} }
            })}
        >
            <AppContext.Provider value={context as any}>
                <MyDrafts />
            </AppContext.Provider>
        </Provider>
    )

    const renderMyDrafts = (isFetching = false) => render(tree(isFetching))

    const type = (value: string) => {
        fireEvent.change(screen.getByLabelText(SEARCH_PLACEHOLDER), { target: { value } })
    }

    const settle = () => {
        act(() => {
            jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
        })
    }

    const lastCall = () => mockGetMyDrafts.mock.calls[mockGetMyDrafts.mock.calls.length - 1][0]

    beforeEach(() => {
        jest.useFakeTimers()
        mockGetMyDrafts.mockClear()
    })
    afterEach(() => jest.useRealTimers())

    test('renders a search box', () => {
        renderMyDrafts()

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
    })

    test('the initial load carries no search query and no userId', () => {
        renderMyDrafts()

        expect(lastCall().params).toEqual({ page: 1, limit: PAGINATION_LIMIT })
    })

    test('sends the query to the server, still without a userId', () => {
        renderMyDrafts()
        mockGetMyDrafts.mockClear()

        type('aubade')
        expect(mockGetMyDrafts).not.toHaveBeenCalled()

        settle()

        // Exhaustive on purpose: `userId` here would be a client-supplied scope
        // for a private list, which is exactly what the server refuses to honour.
        expect(lastCall().params).toEqual({ page: 1, limit: PAGINATION_LIMIT, q: 'aubade' })
    })

    test('resets to page 1 on a new query', () => {
        renderMyDrafts()
        mockGetMyDrafts.mockClear()

        type('aubade')
        settle()

        expect(lastCall().params.page).toBe(1)
        expect(lastCall().options).toEqual({ reset: true, fetch: true })
    })

    test('does not query below the minimum length', () => {
        renderMyDrafts()
        mockGetMyDrafts.mockClear()

        type('a'.repeat(SEARCH_MIN_LENGTH - 1))
        settle()

        expect(mockGetMyDrafts).not.toHaveBeenCalled()
    })

    test('every fetch carries an abort signal', () => {
        renderMyDrafts()

        type('aubade')
        settle()

        expect(lastCall().signal).toBeInstanceOf(AbortSignal)
    })

    test('a superseded request is aborted before the next one starts', () => {
        renderMyDrafts()

        type('aub')
        settle()
        const stale = lastCall().signal

        type('aubade')
        settle()

        expect(stale.aborted).toBe(true)
    })

    test('the search box stays mounted while a search is running', () => {
        // The state that matters is "fetching, nothing loaded, AND a query
        // active" — which is why the store has to FLIP rather than start
        // fetching: an initial load with no query should still show the
        // full-page spinner, and rendering straight into `isFetching` would test
        // that instead. The `!q` guard is what separates the two; without it the
        // spinner replaces the input and steals focus on every keystroke.
        const { rerender } = renderMyDrafts(false)

        type('aubade')
        settle()
        rerender(tree(true))

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    })

    test('still shows the full-page spinner on the initial load', () => {
        // The other side of that guard — it must not have been removed outright.
        renderMyDrafts(true)

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
        expect(screen.queryByLabelText(SEARCH_PLACEHOLDER)).not.toBeInTheDocument()
    })

    test('an empty search result does not claim you have no drafts', () => {
        renderMyDrafts()

        expect(screen.getByText(MY_DRAFTS_EMPTY)).toBeInTheDocument()

        type('aubade')
        settle()

        expect(screen.getByText(SEARCH_NO_RESULTS)).toBeInTheDocument()
        expect(screen.queryByText(MY_DRAFTS_EMPTY)).not.toBeInTheDocument()
    })
})
