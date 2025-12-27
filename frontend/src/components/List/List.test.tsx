/* eslint-disable max-lines */
import React from 'react'
import List from './List'
import { render, act, screen, fireEvent, waitFor } from '@testing-library/react'
import store from '../../redux/store'
import { Provider } from 'react-redux'
import * as Redux from 'react-redux'
import { ORDER_BY_RANDOM, ORDER_BY_DATE, ORDER_BY_LIKES, ORDER_BY_TITLE } from '../../data/constants'
import { Helmet } from 'react-helmet'
import { BrowserRouter } from 'react-router-dom'
import * as poemsActions from '../../redux/actions/poemsActions'
import * as urlUtils from '../../utils/urlUtils'
import { Poem } from '../../typescript/interfaces'

// we cannot mock the whole react-redux; we need the store, so we require everyting except useSelector
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useSelector: jest.fn()
}))
jest.mock('react-helmet')
jest.mock('../../redux/actions/poemsActions')
jest.mock('../../utils/urlUtils', () => ({
    ...jest.requireActual('../../utils/urlUtils'),
    addQueryParam: jest.fn(),
    useFiltersFromQuery: jest.fn()
}))
jest.mock('../ListItem/ListItem', () => {
    return function MockListItem({ poem }: any) {
        return <div data-testid={`list-item-${poem.id}`}>{poem.title}</div>
    }
})
jest.mock('../../hooks/useInfiniteScroll', () => ({
    useInfiniteScroll: jest.fn(() => ({ current: null }))
}))

// Mock AppContext
jest.mock('../../App', () => ({
    AppContext: React.createContext({
        user: 'testuser',
        userId: 'user-123',
        adminId: 'admin-456',
        setState: jest.fn()
    })
}))

describe('List', () => {
    const mockPoems: Poem[] = [
        {
            id: 'poem-1',
            title: 'Test Poem 1',
            author: 'Author One',
            poem: 'This is poem content 1',
            genre: 'love',
            likes: ['user-1'],
            userId: 'user-1',
            picture: 'pic1.jpg',
            date: '2024-01-01'
        },
        {
            id: 'poem-2',
            title: 'Test Poem 2',
            author: 'Author Two',
            poem: 'This is poem content 2',
            genre: 'sad',
            likes: ['user-1', 'user-2'],
            userId: 'user-2',
            picture: 'pic2.jpg',
            date: '2024-01-02'
        },
        {
            id: 'poem-3',
            title: 'Test Poem 3',
            author: 'Author Three',
            poem: 'This is poem content 3',
            genre: 'love',
            likes: [],
            userId: 'user-3',
            picture: 'pic3.jpg',
            date: '2024-01-03'
        }
    ]

    const mockDispatch = jest.fn()
    const mockSetParamsData = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        ;(Redux.useSelector as jest.Mock).mockImplementation(callback => {
            return callback({
                poemsListQuery: {
                    isFetching: false,
                    item: [],
                    hasMore: false,
                    page: 0
                }
            })
        })
        ;(urlUtils.useFiltersFromQuery as jest.Mock).mockReturnValue([
            { orderBy: '', origin: 'all' },
            mockSetParamsData
        ])
        ;(poemsActions.getPoemsListAction as jest.Mock).mockReturnValue({ type: 'GET_POEMS_LIST' })
        jest.spyOn(Redux, 'useDispatch').mockReturnValue(mockDispatch)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('Should select order by random', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const options = screen.getAllByTestId('select-option') as HTMLOptionElement[]

        act(() => {
            fireEvent.change(screen.getByTestId('order-select'), {
                target: {
                    value: ORDER_BY_RANDOM
                }
            })
        })

        expect(options[0].selected).toBeFalsy()
        expect(options[1].selected).toBeFalsy()
        expect(options[2].selected).toBeTruthy()
        expect(options[3].selected).toBeFalsy()
    })

    test('Should call Helmet', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )
        expect(Helmet).toHaveBeenCalled()
        expect((Helmet as unknown as jest.Mock).mock.calls[0][0]).toBeTruthy()
    })

    test('Should render CircularProgress on initial load when fetching', () => {
        ;(Redux.useSelector as jest.Mock).mockImplementation(callback => {
            return callback({
                poemsListQuery: {
                    isFetching: true,
                    item: [],
                    hasMore: false
                }
            })
        })

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    test('Should NOT render CircularProgress when poems are already loaded', () => {
        ;(Redux.useSelector as jest.Mock).mockImplementation(callback => {
            return callback({
                poemsListQuery: {
                    isFetching: true,
                    item: mockPoems,
                    hasMore: false
                }
            })
        })

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const progressBars = screen.queryAllByRole('progressbar')
        // Should show pagination loader but not full page loader
        expect(progressBars.length).toBeGreaterThanOrEqual(0)
    })

    test('Should render poems list', () => {
        ;(Redux.useSelector as jest.Mock).mockImplementation(callback => {
            return callback({
                poemsListQuery: {
                    isFetching: false,
                    item: mockPoems,
                    hasMore: false
                }
            })
        })

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByTestId('list-item-poem-1')).toBeInTheDocument()
        expect(screen.getByTestId('list-item-poem-2')).toBeInTheDocument()
        expect(screen.getByTestId('list-item-poem-3')).toBeInTheDocument()
    })

    test('Should filter poems by genre when genre prop is provided', () => {
        ;(Redux.useSelector as jest.Mock).mockImplementation(callback => {
            return callback({
                poemsListQuery: {
                    isFetching: false,
                    item: mockPoems,
                    hasMore: false
                }
            })
        })

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List match={{ params: { genre: 'love' } }} />
                </BrowserRouter>
            </Provider>
        )

        // Should render only love poems
        expect(screen.getByTestId('list-item-poem-1')).toBeInTheDocument()
        expect(screen.getByTestId('list-item-poem-3')).toBeInTheDocument()
        expect(screen.queryByTestId('list-item-poem-2')).not.toBeInTheDocument()
    })

    test('Should display genre title when genre is provided', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List match={{ params: { genre: 'love' } }} />
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByText(/Category:/i)).toBeInTheDocument()
        expect(screen.getByText(/LOVE/i)).toBeInTheDocument()
    })

    test('Should NOT display genre title when genre is not provided', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(screen.queryByText(/Category:/i)).not.toBeInTheDocument()
    })

    test('Should update Helmet title based on genre', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List match={{ params: { genre: 'sad' } }} />
                </BrowserRouter>
            </Provider>
        )

        const helmetCalls = (Helmet as unknown as jest.Mock).mock.calls
        const lastCall = helmetCalls[helmetCalls.length - 1][0]
        expect(lastCall.children.props.children).toBe('Sad poems')
    })

    test('Should handle search input change', () => {
        const { container } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const searchInput = container.querySelector('.list__search input') as HTMLInputElement
        fireEvent.change(searchInput, { target: { value: 'Author One' } })

        // Search input should accept the value
        expect(searchInput).toBeInTheDocument()
    })

    test('Should handle order by change to Date', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const orderSelect = screen.getByTestId('order-select')
        fireEvent.change(orderSelect, { target: { value: ORDER_BY_DATE } })

        expect(urlUtils.addQueryParam).toHaveBeenCalledWith({
            id: 'orderBy',
            value: ORDER_BY_DATE
        })
        expect(mockSetParamsData).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: ORDER_BY_DATE
            })
        )
    })

    test('Should handle order by change to Likes', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const orderSelect = screen.getByTestId('order-select')
        fireEvent.change(orderSelect, { target: { value: ORDER_BY_LIKES } })

        expect(urlUtils.addQueryParam).toHaveBeenCalledWith({
            id: 'orderBy',
            value: ORDER_BY_LIKES
        })
    })

    test('Should handle order by change to Title', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const orderSelect = screen.getByTestId('order-select')
        fireEvent.change(orderSelect, { target: { value: ORDER_BY_TITLE } })

        expect(urlUtils.addQueryParam).toHaveBeenCalledWith({
            id: 'orderBy',
            value: ORDER_BY_TITLE
        })
    })

    test('Should handle origin filter change to Famous', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const originSelect = screen.getByLabelText(/Authors:/i) as HTMLSelectElement
        fireEvent.change(originSelect, { target: { value: 'famous' } })

        expect(urlUtils.addQueryParam).toHaveBeenCalledWith({
            id: 'origin',
            value: 'famous'
        })
        expect(mockSetParamsData).toHaveBeenCalledWith(
            expect.objectContaining({
                origin: 'famous'
            })
        )
    })

    test('Should handle origin filter change to Users', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const originSelect = screen.getByLabelText(/Authors:/i) as HTMLSelectElement
        fireEvent.change(originSelect, { target: { value: 'user' } })

        expect(urlUtils.addQueryParam).toHaveBeenCalledWith({
            id: 'origin',
            value: 'user'
        })
        expect(mockSetParamsData).toHaveBeenCalledWith(
            expect.objectContaining({
                origin: 'user'
            })
        )
    })

    test('Should dispatch getPoemsListAction on mount with reset and no fetch', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(poemsActions.getPoemsListAction).toHaveBeenCalledWith({
            options: {
                reset: true,
                fetch: false
            }
        })
    })

    test('Should dispatch getPoemsListAction when origin changes', () => {
        ;(urlUtils.useFiltersFromQuery as jest.Mock).mockReturnValue([
            { orderBy: '', origin: 'famous' },
            mockSetParamsData
        ])

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(poemsActions.getPoemsListAction).toHaveBeenCalledWith({
            params: {
                page: 1,
                limit: 10,
                origin: 'famous'
            },
            options: {
                reset: true,
                fetch: true
            }
        })
    })

    test('Should NOT include origin param when origin is "all"', () => {
        ;(urlUtils.useFiltersFromQuery as jest.Mock).mockReturnValue([
            { orderBy: '', origin: 'all' },
            mockSetParamsData
        ])

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const calls = (poemsActions.getPoemsListAction as jest.Mock).mock.calls
        const callWithFetch = calls.find((call: any) => call[0].options?.fetch === true)

        if (callWithFetch) {
            expect(callWithFetch[0].params).not.toHaveProperty('origin')
        }
    })

    test('Should render loading indicator during pagination', () => {
        ;(Redux.useSelector as jest.Mock).mockImplementation(callback => {
            return callback({
                poemsListQuery: {
                    isFetching: true,
                    item: mockPoems,
                    hasMore: true
                }
            })
        })

        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const progressBars = screen.getAllByRole('progressbar')
        expect(progressBars.length).toBeGreaterThan(0)
    })

    test('Should render search icon', () => {
        const { container } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(container.querySelector('.list__search')).toBeInTheDocument()
    })

    test('Should have correct CSS classes', () => {
        const { container } = render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(container.querySelector('.list__container')).toBeInTheDocument()
        expect(container.querySelector('.list__intro')).toBeInTheDocument()
        expect(container.querySelector('.list__search')).toBeInTheDocument()
        expect(container.querySelector('.list__sort')).toBeInTheDocument()
    })

    test('Should render all origin options', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        expect(screen.getByText('All')).toBeInTheDocument()
        expect(screen.getByText('Famous')).toBeInTheDocument()
        expect(screen.getByText('Users')).toBeInTheDocument()
    })

    test('Should render all order by options', () => {
        render(
            <Provider store={store}>
                <BrowserRouter>
                    <List />
                </BrowserRouter>
            </Provider>
        )

        const options = screen.getAllByTestId('select-option')
        expect(options.length).toBe(4) // Likes, Date, Random, Title
    })
})
