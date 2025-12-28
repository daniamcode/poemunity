import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { usePoemsList } from './usePoemsList'
import * as poemsActions from '../../../redux/actions/poemsActions'
import { rootReducer } from '../../../redux/reducers/rootReducer'

jest.mock('../../../redux/actions/poemsActions')

describe('usePoemsList', () => {
    let store: any
    let mockDispatch: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockDispatch = jest.fn()

        store = configureStore({
            reducer: rootReducer,
            preloadedState: {
                poemsListQuery: {
                    item: [],
                    isFetching: false,
                    isError: false,
                    hasMore: false,
                    page: 1
                }
            }
        })

        jest.spyOn(store, 'dispatch').mockImplementation(mockDispatch)
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>

    test('should dispatch reset action on mount', () => {
        const mockGetPoemsListAction = jest.fn()
        ;(poemsActions.getPoemsListAction as jest.Mock).mockReturnValue(mockGetPoemsListAction)

        renderHook(() => usePoemsList({ genre: undefined, origin: 'all', orderBy: 'Likes' }), { wrapper })

        expect(poemsActions.getPoemsListAction).toHaveBeenCalledWith({
            options: { reset: true, fetch: false }
        })
    })

    test('should fetch poems when origin changes', async () => {
        const mockGetPoemsListAction = jest.fn()
        ;(poemsActions.getPoemsListAction as jest.Mock).mockReturnValue(mockGetPoemsListAction)

        const { rerender } = renderHook(({ origin }) => usePoemsList({ genre: undefined, origin, orderBy: 'Likes' }), {
            wrapper,
            initialProps: { origin: 'all' }
        })

        await waitFor(() => {
            expect(poemsActions.getPoemsListAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({ page: 1 })
                })
            )
        })

        rerender({ origin: 'user' })

        await waitFor(() => {
            expect(poemsActions.getPoemsListAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({ origin: 'user' })
                })
            )
        })
    })

    test('should not include origin param when origin is "all"', async () => {
        const mockGetPoemsListAction = jest.fn()
        ;(poemsActions.getPoemsListAction as jest.Mock).mockReturnValue(mockGetPoemsListAction)

        renderHook(() => usePoemsList({ genre: undefined, origin: 'all', orderBy: 'Likes' }), { wrapper })

        await waitFor(() => {
            const calls = (poemsActions.getPoemsListAction as jest.Mock).mock.calls
            const fetchCall = calls.find(call => call[0]?.options?.fetch === true)
            expect(fetchCall[0].params).not.toHaveProperty('origin')
        })
    })

    test('should return correct initial state', () => {
        const { result } = renderHook(() => usePoemsList({ genre: undefined, origin: 'all', orderBy: 'Likes' }), {
            wrapper
        })

        expect(result.current.poems).toEqual([])
        expect(result.current.isLoading).toBe(false)
        expect(result.current.hasMore).toBe(false)
        expect(result.current.hasItems).toBe(false)
        expect(typeof result.current.handleLoadMore).toBe('function')
    })

    test('should call handleLoadMore with correct params', async () => {
        store = configureStore({
            reducer: rootReducer,
            preloadedState: {
                poemsListQuery: {
                    item: [{ id: '1', title: 'Test' }],
                    isFetching: false,
                    isError: false,
                    hasMore: true,
                    page: 1
                }
            }
        })

        jest.spyOn(store, 'dispatch').mockImplementation(mockDispatch)

        const mockGetPoemsListAction = jest.fn()
        ;(poemsActions.getPoemsListAction as jest.Mock).mockReturnValue(mockGetPoemsListAction)

        const { result } = renderHook(() => usePoemsList({ genre: undefined, origin: 'all', orderBy: 'Likes' }), {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
        })

        result.current.handleLoadMore()

        await waitFor(() => {
            expect(poemsActions.getPoemsListAction).toHaveBeenCalledWith(
                expect.objectContaining({
                    params: expect.objectContaining({ page: 2 }),
                    options: { fetch: true, reset: false }
                })
            )
        })
    })

    test('should not load more when already fetching', () => {
        store = configureStore({
            reducer: rootReducer,
            preloadedState: {
                poemsListQuery: {
                    item: [],
                    isFetching: true,
                    isError: false,
                    hasMore: true,
                    page: 1
                }
            }
        })

        jest.spyOn(store, 'dispatch').mockImplementation(mockDispatch)

        const { result } = renderHook(() => usePoemsList({ genre: undefined, origin: 'all', orderBy: 'Likes' }), {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
        })

        const callsBeforeLoadMore = (poemsActions.getPoemsListAction as jest.Mock).mock.calls.length

        result.current.handleLoadMore()

        expect((poemsActions.getPoemsListAction as jest.Mock).mock.calls.length).toBe(callsBeforeLoadMore)
    })

    test('should not load more when hasMore is false', () => {
        store = configureStore({
            reducer: rootReducer,
            preloadedState: {
                poemsListQuery: {
                    item: [],
                    isFetching: false,
                    isError: false,
                    hasMore: false,
                    page: 1
                }
            }
        })

        jest.spyOn(store, 'dispatch').mockImplementation(mockDispatch)

        const { result } = renderHook(() => usePoemsList({ genre: undefined, origin: 'all', orderBy: 'Likes' }), {
            wrapper: ({ children }) => <Provider store={store}>{children}</Provider>
        })

        const callsBeforeLoadMore = (poemsActions.getPoemsListAction as jest.Mock).mock.calls.length

        result.current.handleLoadMore()

        expect((poemsActions.getPoemsListAction as jest.Mock).mock.calls.length).toBe(callsBeforeLoadMore)
    })
})
