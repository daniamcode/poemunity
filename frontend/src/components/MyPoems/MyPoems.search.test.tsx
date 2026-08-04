import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import MyPoems from './MyPoems'
import { AppContext } from '../../App'
import * as poemsActions from '../../redux/actions/poemsActions'
import { SEARCH_DEBOUNCE_MS } from '../../hooks/useDebouncedValue'
import { SEARCH_PLACEHOLDER, SEARCH_MIN_LENGTH, PAGINATION_LIMIT } from '../../data/constants'

jest.mock('../../utils/notifications')
jest.mock('../../redux/actions/poemsActions', () => ({
    ...jest.requireActual('../../redux/actions/poemsActions'),
    getMyPoemsAction: jest.fn(() => ({ type: 'GET_MY_POEMS' }))
}))

const mockGetMyPoems = poemsActions.getMyPoemsAction as jest.Mock
const mockStore = configureStore([])

// The profile search used to filter only the poems already on screen, by author
// name — useless on your own profile, where every poem has the same author.
// These tests pin the replacement: typing sends `q` to the server so the whole
// collection is searched.
describe('MyPoems - server-backed search', () => {
    const context = {
        user: 'token',
        userId: 'user-1',
        username: 'testuser',
        picture: '',
        isAdmin: false,
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    const renderMyPoems = () =>
        render(
            <Provider
                store={mockStore({
                    myPoemsQuery: { item: [], isFetching: false, hasMore: false, page: 1, error: null },
                    poemEntities: { ids: [], entities: {} },
                    authorEntities: { ids: [], entities: {} }
                })}
            >
                <AppContext.Provider value={context as any}>
                    <MyPoems />
                </AppContext.Provider>
            </Provider>
        )

    const type = (value: string) => {
        fireEvent.change(screen.getByLabelText(SEARCH_PLACEHOLDER), { target: { value } })
    }

    const settle = () => {
        act(() => {
            jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
        })
    }

    const lastCallParams = () => mockGetMyPoems.mock.calls[mockGetMyPoems.mock.calls.length - 1][0].params

    beforeEach(() => {
        jest.useFakeTimers()
        mockGetMyPoems.mockClear()
    })
    afterEach(() => jest.useRealTimers())

    test('the initial load carries no search query', () => {
        renderMyPoems()

        expect(lastCallParams()).toEqual({
            userId: 'user-1',
            page: 1,
            limit: PAGINATION_LIMIT
        })
    })

    test('sends the query to the server once the debounce elapses', () => {
        renderMyPoems()
        mockGetMyPoems.mockClear()

        type('shelley')
        expect(mockGetMyPoems).not.toHaveBeenCalled()

        settle()

        expect(lastCallParams()).toEqual({
            userId: 'user-1',
            page: 1,
            limit: PAGINATION_LIMIT,
            q: 'shelley'
        })
    })

    test('resets to page 1 on a new query, rather than filtering the loaded page', () => {
        renderMyPoems()
        mockGetMyPoems.mockClear()

        type('shelley')
        settle()

        const call = mockGetMyPoems.mock.calls[mockGetMyPoems.mock.calls.length - 1][0]
        expect(call.params.page).toBe(1)
        expect(call.options).toEqual({ reset: true, fetch: true })
    })

    test('does not query below the minimum length', () => {
        renderMyPoems()
        mockGetMyPoems.mockClear()

        type('a'.repeat(SEARCH_MIN_LENGTH - 1))
        settle()

        expect(mockGetMyPoems).not.toHaveBeenCalled()
    })

    test('typing a word steadily costs one request, not one per keystroke', () => {
        renderMyPoems()
        mockGetMyPoems.mockClear()

        for (const value of ['sh', 'she', 'shel', 'shell', 'shelley']) {
            type(value)
            act(() => {
                jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50)
            })
        }
        settle()

        expect(mockGetMyPoems).toHaveBeenCalledTimes(1)
        expect(lastCallParams().q).toBe('shelley')
    })

    test('clearing the box refetches without a query', () => {
        renderMyPoems()

        type('shelley')
        settle()
        mockGetMyPoems.mockClear()

        type('')
        settle()

        expect(lastCallParams()).toEqual({
            userId: 'user-1',
            page: 1,
            limit: PAGINATION_LIMIT
        })
    })

    // Every request carries a signal so the one it replaces can be aborted;
    // otherwise a slow response for "shel" can land after "shelley" and
    // overwrite the correct results.
    test('every fetch carries an abort signal', () => {
        renderMyPoems()

        type('shelley')
        settle()

        const call = mockGetMyPoems.mock.calls[mockGetMyPoems.mock.calls.length - 1][0]
        expect(call.signal).toBeInstanceOf(AbortSignal)
    })

    test('a superseded request is aborted before the next one starts', () => {
        renderMyPoems()

        type('shel')
        settle()
        const stale = mockGetMyPoems.mock.calls[mockGetMyPoems.mock.calls.length - 1][0].signal

        type('shelley')
        settle()

        expect(stale.aborted).toBe(true)
    })

    // The search box must survive a query that returns nothing, or the user
    // loses focus and their caret the moment results go empty.
    test('the search box stays on screen while a search is running', () => {
        renderMyPoems()

        type('shelley')
        settle()

        expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
    })
})
