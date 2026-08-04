import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import MyPoems from './MyPoems'
import MyFavouritePoems from '../MyFavouritePoems/MyFavouritePoems'
import { AppContext } from '../../App'
import { SEARCH_DEBOUNCE_MS } from '../../hooks/useDebouncedValue'
import {
    SEARCH_PLACEHOLDER,
    SEARCH_NO_RESULTS,
    MY_POEMS_EMPTY,
    MY_FAVOURITE_POEMS_EMPTY
} from '../../data/constants'

jest.mock('../../utils/notifications')
jest.mock('../../redux/actions/poemsActions', () => ({
    ...jest.requireActual('../../redux/actions/poemsActions'),
    getMyPoemsAction: jest.fn(() => ({ type: 'GET_MY_POEMS' })),
    getMyFavouritePoemsAction: jest.fn(() => ({ type: 'GET_MY_FAVOURITE_POEMS' }))
}))
jest.mock('../ListItem/ListItem', () => function MockListItem() { return null })
jest.mock('../../hooks/useInfiniteScroll', () => ({
    useInfiniteScroll: jest.fn(() => ({ current: null }))
}))

const mockStore = configureStore([])

// Both profile tabs rendered a search box above a blank space when the user had
// nothing yet — no explanation, just emptiness, which reads as a page that
// failed to load.
describe('profile tabs — empty states', () => {
    const context = {
        user: 'token',
        userId: 'user-1',
        username: 'testuser',
        picture: '',
        isAdmin: false,
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    const renderTab = (Component: React.ComponentType, queryKey: string) =>
        render(
            <Provider
                store={mockStore({
                    [queryKey]: { item: [], isFetching: false, hasMore: false, page: 1, error: null },
                    poemEntities: { ids: [], entities: {} },
                    authorEntities: { ids: [], entities: {} }
                })}
            >
                <AppContext.Provider value={context as never}>
                    <Component />
                </AppContext.Provider>
            </Provider>
        )

    const searchFor = (text: string) => {
        fireEvent.change(screen.getByLabelText(SEARCH_PLACEHOLDER), { target: { value: text } })
        act(() => {
            jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS)
        })
    }

    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    describe.each([
        ['My poems', MyPoems, 'myPoemsQuery', MY_POEMS_EMPTY],
        ['My favourite poems', MyFavouritePoems, 'myFavouritePoemsQuery', MY_FAVOURITE_POEMS_EMPTY]
    ])('%s', (_label, Component, queryKey, emptyMessage) => {
        test('explains the blank tab instead of showing nothing at all', () => {
            renderTab(Component as React.ComponentType, queryKey)

            expect(screen.getByText(emptyMessage)).toBeInTheDocument()
        })

        // Different situations, different messages: an empty tab has no query to
        // relax, so telling the user their search matched nothing would be a lie.
        test('switches to the search message once a query is active', () => {
            renderTab(Component as React.ComponentType, queryKey)
            searchFor('shelley')

            expect(screen.getByText(SEARCH_NO_RESULTS)).toBeInTheDocument()
            expect(screen.queryByText(emptyMessage)).not.toBeInTheDocument()
        })

        test('goes back to the empty-tab message when the search is cleared', () => {
            renderTab(Component as React.ComponentType, queryKey)
            searchFor('shelley')
            searchFor('')

            expect(screen.getByText(emptyMessage)).toBeInTheDocument()
        })

        test('keeps the search box available so the user is not stuck', () => {
            renderTab(Component as React.ComponentType, queryKey)

            expect(screen.getByLabelText(SEARCH_PLACEHOLDER)).toBeInTheDocument()
        })
    })
})
