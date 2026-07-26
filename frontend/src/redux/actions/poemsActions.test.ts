/* eslint-disable max-lines */
import axios from 'axios'
import {
    createPoemAction,
    getPoemsListAction,
    dropPoemFromCaches,
    dropPoemFromFavouritesCache,
    insertPoemIntoCaches,
    addPoemToFavouritesCache,
    setRanking
} from './poemsActions'
import * as commonActions from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/poemsReducers'
import { waitFor } from '@testing-library/react'
import { AppDispatch } from '../store'
import store from '../store/index'

jest.mock('axios', () => {
    const mockGetFn = jest.fn()
    const mockPostFn = jest.fn()
    const mockPutFn = jest.fn()
    const mockDeleteFn = jest.fn()
    const mockPatchFn = jest.fn()

    const mockAxiosInstance = {
        get: mockGetFn,
        post: mockPostFn,
        put: mockPutFn,
        delete: mockDeleteFn,
        patch: mockPatchFn
    }

    const mockCreateFn = jest.fn(() => mockAxiosInstance)

    return {
        __esModule: true,
        default: {
            create: mockCreateFn,
            __mockGet: mockGetFn,
            __mockPost: mockPostFn,
            __mockPut: mockPutFn,
            __mockDelete: mockDeleteFn,
            __mockPatch: mockPatchFn
        }
    }
})
jest.mock('../store/index')

// Get references to the mock functions - these are used throughout the tests
const mockGet = (axios as any).__mockGet
const mockPost = (axios as any).__mockPost

describe('getPoemsListAction - fetch flow', () => {
    let dispatch: AppDispatch

    const callbacks = {
        error: () => {
            console.error('error')
        },
        reset: () => {
            console.info('reset')
        },
        success: () => {
            console.info('success')
        }
    }

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })
    afterEach(() => {
        // doing this in an afterAll could lead to not reset dispatch calls number so the latter
        // tests could fail
        ;(dispatch as jest.Mock).mockClear()
        jest.clearAllMocks()
    })

    test('should call getAction - no fetch', () => {
        const spy = jest.spyOn(commonActions, 'getAction')
        const options = { fetch: false }

        getPoemsListAction({
            params: {},
            options,
            callbacks
        })(dispatch)

        expect(spy).toHaveBeenCalled()
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.POEMS_LIST,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            options,
            params: {},
            // callbacks are wrapped so a successful fetch also seeds the authors store
            callbacks: {
                error: callbacks.error,
                reset: callbacks.reset,
                success: expect.any(Function)
            }
        })
        spy.mockRestore()
    })

    test('dispatches - reset', () => {
        const options = {
            fetch: false,
            reset: true
        }

        getPoemsListAction({
            params: {},
            options,
            callbacks
        })(dispatch)

        expect(dispatch).toHaveBeenCalled()
    })

    test('Should dispatch right type - reset', () => {
        const options = {
            fetch: false,
            reset: true
        }

        getPoemsListAction({
            params: {},
            options
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toBe(`${ACTIONS.POEMS_LIST}_reset`)
    })

    test('Should dispatch error when axios throws a generic error', async () => {
        mockGet.mockRejectedValueOnce({
            response: 'some error'
        })

        const options = { fetch: true }

        // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
        await waitFor(() =>
            getPoemsListAction({
                params: {},
                options
            })(dispatch)
        )
        // another alternative:
        // await new Promise(resolve=> {
        //     setTimeout(() => {
        //         resolve();
        //     }, 300);
        // })

        // probably is better to use "const spy = jest.spyOn(commonActions, 'getAction')"
        // and then "expect(spy).toHaveBeenCalledTimes(1)"
        expect(mockGet).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.POEMS_LIST}_rejected`)
        // Error is serialized: response.data is undefined so falls back to { message, status, statusText }
        expect((dispatch as jest.Mock).mock.calls[1][0].payload).toMatchObject({
            message: expect.any(String)
        })
    })

    // a network error is different because we don't get an error as an object with a response property
    test('Should dispatch error when axios throws a network error', async () => {
        mockGet.mockRejectedValueOnce('Network error')

        const options = { fetch: true }

        // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
        await waitFor(() =>
            getPoemsListAction({
                params: {},
                options
            })(dispatch)
        )

        expect(mockGet).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.POEMS_LIST}_rejected`)
        // String errors are serialized to { message, status, statusText }
        expect((dispatch as jest.Mock).mock.calls[1][0].payload).toMatchObject({
            message: expect.any(String)
        })
    })

    test('Should dispatch response when axios returns data correctly', async () => {
        // this is because we use Axios.create
        mockGet.mockResolvedValueOnce({
            data: 'poem1',
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }
        await waitFor(() =>
            getPoemsListAction({
                params: {},
                options
            })(dispatch)
        )

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.POEMS_LIST}_request`)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toStrictEqual(`${ACTIONS.POEMS_LIST}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[1][0].payload).toEqual('poem1')
    })
})
describe('createPoemAction', () => {
    let dispatch: AppDispatch

    const context = {
        elementToEdit: '1',
        user: 'whatever',
        userId: '2',
        username: 'username',
        picture: '1.jpg',
        config: {
            headers: {
                Authorization: 'Bearer 123'
            }
        },
        isAdmin: false,
        setState: () => {}
    }

    const poem = {
        id: '',
        author: 'author1',
        date: '01012001',
        genre: 'love',
        likes: ['1'],
        picture: '1.jpg',
        poem: 'This is a poem',
        title: 'title1',
        userId: '1'
    }

    const callbacks = {
        error: () => {
            console.error('error')
        },
        reset: () => {
            console.info('reset')
        },
        success: () => {
            console.info('success')
        }
    }

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })
    afterEach(() => {
        // doing this in an afterAll could lead to not reset dispatch calls number so the latter
        // tests could fail
        ;(dispatch as jest.Mock).mockClear()
        jest.clearAllMocks()
    })

    test('should call postAction - no fetch', () => {
        const spy = jest.spyOn(commonActions, 'postAction')
        const options = { fetch: false }

        createPoemAction({
            poem,
            context,
            callbacks,
            options
        })(dispatch)

        expect(spy).toHaveBeenCalled()
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.CREATE_POEM,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            data: poem,
            options,
            callbacks,
            config: context.config
        })
        spy.mockRestore()
    })

    test('dispatches - reset', () => {
        const options = {
            fetch: false,
            reset: true
        }

        createPoemAction({
            poem,
            context,
            callbacks,
            options
        })(dispatch)

        expect(dispatch).toHaveBeenCalled()
    })

    test('Should dispatch right type - reset', () => {
        const options = {
            fetch: false,
            reset: true
        }

        createPoemAction({
            poem,
            context,
            callbacks,
            options
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toBe(`${ACTIONS.CREATE_POEM}_reset`)
    })

    test('Should dispatch error when axios throws a generic error', async () => {
        const mockPost = (axios as any).__mockPost
        mockPost.mockRejectedValueOnce({
            message: 'some error',
            response: {
                status: 400,
                statusText: 'Bad Request'
            }
        })

        const options = { fetch: true }

        // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
        await waitFor(() =>
            createPoemAction({
                poem,
                context,
                callbacks,
                options
            })(dispatch)
        )

        // probably is better to use "const spy = jest.spyOn(commonActions, 'postAction')"
        // and then "expect(spy).toHaveBeenCalledTimes(1)"
        expect(mockPost).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.CREATE_POEM}_rejected`)
        // After error serialization fix, we expect the serialized error format
        expect((dispatch as jest.Mock).mock.calls[1][0].payload).toEqual({
            message: 'some error',
            status: 400,
            statusText: 'Bad Request'
        })
    })

    test('Should dispatch response when axios returns data correctly', async () => {
        // this is because we use Axios.create
        mockPost.mockResolvedValueOnce({
            data: 'poem1',
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }
        await waitFor(() =>
            createPoemAction({
                poem,
                context,
                callbacks,
                options
            })(dispatch)
        )

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.CREATE_POEM}_request`)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toStrictEqual(`${ACTIONS.CREATE_POEM}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[1][0].payload).toEqual('poem1')
    })
})

describe('getPoemsListAction - Pagination', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        jest.clearAllMocks()
    })

    test('should include pagination params in request', async () => {
        const spy = jest.spyOn(commonActions, 'getAction')
        // Mock the axios call to prevent actual API call
        mockGet.mockResolvedValueOnce({
            data: { poems: [], total: 0, page: 2, limit: 20, totalPages: 0, hasMore: false },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const params = { page: 2, limit: 20 }
        const options = { fetch: true }

        const { getPoemsListAction } = await import('./poemsActions')

        await waitFor(() => {
            getPoemsListAction({
                params,
                options
            })(dispatch)
        })

        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.POEMS_LIST,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            // callbacks are wrapped so a successful fetch also seeds the authors store
            callbacks: { success: expect.any(Function) }
        })

        spy.mockRestore()
    })

    test('should handle paginated response with hasMore true', async () => {
        const mockResponse = {
            poems: [
                { id: '1', title: 'Poem 1' },
                { id: '2', title: 'Poem 2' }
            ],
            total: 50,
            page: 1,
            limit: 20,
            totalPages: 3,
            hasMore: true
        }

        const mockGet = (axios as any).__mockGet
        mockGet.mockResolvedValueOnce({
            data: mockResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }

        const { getPoemsListAction } = await import('./poemsActions')

        await waitFor(() => {
            getPoemsListAction({
                params: { page: 1, limit: 20 },
                options
            })(dispatch)
        })

        expect(mockGet).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(3)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.POEMS_LIST}_fulfilled`)
    })

    test('should handle paginated response with hasMore false', async () => {
        const mockResponse = {
            poems: [{ id: '21', title: 'Poem 21' }],
            total: 21,
            page: 2,
            limit: 20,
            totalPages: 2,
            hasMore: false
        }

        const mockGet = (axios as any).__mockGet
        mockGet.mockResolvedValueOnce({
            data: mockResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }

        const { getPoemsListAction } = await import('./poemsActions')

        await waitFor(() => {
            getPoemsListAction({
                params: { page: 2, limit: 20 },
                options
            })(dispatch)
        })

        expect(mockGet).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(3)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.POEMS_LIST}_fulfilled`)
    })

    test('should handle pagination with origin filter', async () => {
        const spy = jest.spyOn(commonActions, 'getAction')

        // Mock getAction to do nothing (it returns void)
        spy.mockImplementation(() => {})

        const params = { page: 1, limit: 20, origin: 'classic' }
        const options = { fetch: true }

        const { getPoemsListAction } = await import('./poemsActions')

        // Call the thunk with mocked dispatch
        await getPoemsListAction({ params, options })(dispatch)

        expect(spy).toHaveBeenCalledWith(
            expect.objectContaining({
                params: expect.objectContaining({
                    origin: 'classic',
                    page: 1,
                    limit: 20
                }),
                options
            })
        )

        spy.mockRestore()
    })

    test('should reset to page 1 when reset option is true', () => {
        const options = {
            fetch: false,
            reset: true
        }

        import('./poemsActions').then(({ getPoemsListAction }) => {
            getPoemsListAction({
                params: {},
                options
            })(dispatch)

            expect(dispatch).toHaveBeenCalled()
            expect((dispatch as jest.Mock).mock.calls[0][0].type).toBe(`${ACTIONS.POEMS_LIST}_reset`)
        })
    })

    test('should handle empty results on last page', async () => {
        const mockResponse = {
            poems: [],
            total: 20,
            page: 3,
            limit: 20,
            totalPages: 1,
            hasMore: false
        }

        const mockGet = (axios as any).__mockGet
        mockGet.mockResolvedValueOnce({
            data: mockResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }

        await waitFor(async () => {
            const { getPoemsListAction } = await import('./poemsActions')
            await getPoemsListAction({
                params: { page: 3, limit: 20 },
                options
            })(dispatch)
        })

        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.POEMS_LIST}_fulfilled`)
    })
})

describe('getMyPoemsAction', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        jest.clearAllMocks()
    })

    test('should call getAction with MY_POEMS type and userId param', async () => {
        const spy = jest.spyOn(commonActions, 'getAction')
        mockGet.mockResolvedValueOnce({
            data: { poems: [], total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true, reset: true }
        const params = { userId: 'user-123', page: 1, limit: 10 }

        const { getMyPoemsAction } = await import('./poemsActions')

        await waitFor(() => {
            getMyPoemsAction({
                params,
                options
            })(dispatch)
        })

        expect(spy).toHaveBeenCalled()
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.MY_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            // callbacks are wrapped so a successful fetch also seeds the authors store
            callbacks: { success: expect.any(Function) }
        })
        spy.mockRestore()
    })

    test('should handle paginated response', async () => {
        const mockResponse = {
            poems: [
                { id: '1', title: 'My Poem 1', userId: 'user-123' },
                { id: '2', title: 'My Poem 2', userId: 'user-123' }
            ],
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasMore: false
        }

        const mockGet = (axios as any).__mockGet
        mockGet.mockResolvedValueOnce({
            data: mockResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }
        const params = { userId: 'user-123', page: 1, limit: 10 }

        await waitFor(async () => {
            const { getMyPoemsAction } = await import('./poemsActions')
            await getMyPoemsAction({
                params,
                options
            })(dispatch)
        })

        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.MY_POEMS}_fulfilled`)
    })
})

describe('getMyFavouritePoemsAction', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        jest.clearAllMocks()
    })

    test('should call getAction with MY_FAVOURITE_POEMS type and likedBy param', async () => {
        const spy = jest.spyOn(commonActions, 'getAction')
        mockGet.mockResolvedValueOnce({
            data: { poems: [], total: 0, page: 1, limit: 10, totalPages: 0, hasMore: false },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true, reset: true }
        const params = { likedBy: 'user-123', page: 1, limit: 10 }

        const { getMyFavouritePoemsAction } = await import('./poemsActions')

        await waitFor(() => {
            getMyFavouritePoemsAction({
                params,
                options
            })(dispatch)
        })

        expect(spy).toHaveBeenCalled()
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.MY_FAVOURITE_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            // callbacks are wrapped so a successful fetch also seeds the authors store
            callbacks: { success: expect.any(Function) }
        })
        spy.mockRestore()
    })

    test('should handle paginated response with liked poems', async () => {
        const mockResponse = {
            poems: [
                { id: '1', title: 'Favorite Poem', likes: ['user-123'] },
                { id: '2', title: 'Another Favorite', likes: ['user-123', 'user-456'] }
            ],
            total: 2,
            page: 1,
            limit: 10,
            totalPages: 1,
            hasMore: false
        }

        const mockGet = (axios as any).__mockGet
        mockGet.mockResolvedValueOnce({
            data: mockResponse,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }
        const params = { likedBy: 'user-123', page: 1, limit: 10 }

        await waitFor(async () => {
            const { getMyFavouritePoemsAction } = await import('./poemsActions')
            await getMyFavouritePoemsAction({
                params,
                options
            })(dispatch)
        })

        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.MY_FAVOURITE_POEMS}_fulfilled`)
    })
})


// ---------------------------------------------------------------------------
// Normalized cache maintenance (Phase 2). Caches now hold poem IDS; these
// thunks re-emit id-arrays. They replace the old updateXCacheAfterY family.
// ---------------------------------------------------------------------------

describe('dropPoemFromCaches', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('drops the poem id from every list cache and decrements paginated totals', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            poemsListQuery: { item: ['1', '2', '3'], page: 1, hasMore: false, total: 3, totalPages: 1 },
            myPoemsQuery: { item: ['2', '5'], page: 1, hasMore: false, total: 2, totalPages: 1 },
            myFavouritePoemsQuery: { item: ['9'], page: 1, hasMore: false, total: 1, totalPages: 1 },
            authorPoemsQuery: { item: ['2'], page: 1, hasMore: false, total: 1, totalPages: 1 }
        })

        dropPoemFromCaches({ poemId: '2' })(dispatch)

        const byType: Record<string, any> = {}
        ;(dispatch as jest.Mock).mock.calls.forEach(([action]) => {
            byType[action.type] = action.payload
        })

        // poemsList: paginated, id dropped, total decremented
        expect(byType['poems-list_fulfilled'].poems).toEqual(['1', '3'])
        expect(byType['poems-list_fulfilled'].total).toBe(2)
        // myPoems: id dropped
        expect(byType['my-poems_fulfilled'].poems).toEqual(['5'])
        expect(byType['my-poems_fulfilled'].total).toBe(1)
        // authorPoems: id dropped
        expect(byType['author-poems_fulfilled'].poems).toEqual([])
        // dropPoemFromCaches only maintains list membership; the ranking refresh is
        // a separate concern dispatched by the delete flow (setRanking from the response).
        expect(byType['ranking_fulfilled']).toBeUndefined()
        // favourites did not contain the id -> not re-emitted
        expect(byType['my-favourite-poems_fulfilled']).toBeUndefined()
    })

    test('is a no-op for a cache that does not contain the poem', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            poemsListQuery: { item: ['1', '3'], page: 1, hasMore: false, total: 2, totalPages: 1 },
            myPoemsQuery: { item: undefined },
            myFavouritePoemsQuery: { item: undefined },
            authorPoemsQuery: { item: undefined }
        })

        dropPoemFromCaches({ poemId: '2' })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })
})

describe('dropPoemFromFavouritesCache', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('removes the id from the favourites cache and decrements its total', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            myFavouritePoemsQuery: { item: ['1', '2', '3'], page: 1, hasMore: false, total: 3, totalPages: 1 }
        })

        dropPoemFromFavouritesCache({ poemId: '2' })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.type).toBe('my-favourite-poems_fulfilled')
        expect(action.payload.poems).toEqual(['1', '3'])
        expect(action.payload.total).toBe(2)
    })

    test('does nothing when the poem is not in the favourites cache', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            myFavouritePoemsQuery: { item: ['1', '3'], page: 1, hasMore: false, total: 2, totalPages: 1 }
        })

        dropPoemFromFavouritesCache({ poemId: '2' })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })
})

describe('insertPoemIntoCaches', () => {
    let dispatch: AppDispatch

    const newPoem = {
        id: 'new-1',
        author: 'author',
        date: 'd',
        genre: 'love',
        likes: [],
        picture: 'p.jpg',
        poem: 'body',
        title: 'title',
        userId: 'u1'
    }

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('upserts the entity and inserts the id at the front of the user lists', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            poemsListQuery: { item: ['1', '2'], page: 1, hasMore: false, total: 2, totalPages: 1 },
            myPoemsQuery: { item: ['1'], page: 1, hasMore: false, total: 1, totalPages: 1 }
        })

        insertPoemIntoCaches({ response: newPoem as any })(dispatch)

        const calls = (dispatch as jest.Mock).mock.calls.map(([a]) => a)
        // first dispatch upserts the poem entity
        expect(calls[0].type).toBe('poemEntities/poemUpserted')
        expect(calls[0].payload).toEqual(newPoem)

        const byType: Record<string, any> = {}
        calls.forEach(a => {
            byType[a.type] = a.payload
        })
        // user-facing lists: new id at the front, total bumped
        expect(byType['poems-list_fulfilled'].poems).toEqual(['new-1', '1', '2'])
        expect(byType['poems-list_fulfilled'].total).toBe(3)
        expect(byType['my-poems_fulfilled'].poems).toEqual(['new-1', '1'])
        expect(byType['my-poems_fulfilled'].total).toBe(2)
        // insertPoemIntoCaches only maintains list membership; the ranking refresh is
        // a separate concern dispatched by the create flow (setRanking from the response).
        expect(byType['ranking_fulfilled']).toBeUndefined()
    })
})

describe('addPoemToFavouritesCache', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('inserts the id at the front of the favourites cache and bumps its total', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            myFavouritePoemsQuery: { item: ['1', '2'], page: 1, hasMore: false, total: 2, totalPages: 1 }
        })

        addPoemToFavouritesCache({ poemId: '9' })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.type).toBe('my-favourite-poems_fulfilled')
        expect(action.payload.poems).toEqual(['9', '1', '2'])
        expect(action.payload.total).toBe(3)
    })

    test('does nothing when the poem is already in the favourites cache', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            myFavouritePoemsQuery: { item: ['1', '9', '2'], page: 1, hasMore: false, total: 3, totalPages: 1 }
        })

        addPoemToFavouritesCache({ poemId: '9' })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('does nothing when the favourites cache is not populated', () => {
        ;(store.getState as jest.Mock).mockReturnValue({
            myFavouritePoemsQuery: { item: undefined }
        })

        addPoemToFavouritesCache({ poemId: '9' })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })
})

describe('setRanking', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })
    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('replaces the ranking cache with the server-provided list verbatim', () => {
        // The backend recomputes and returns the fresh top-N; we adopt it as-is,
        // preserving the server's exact order/tie-breaks (no client re-sort).
        const serverRanking = [
            { userId: 'u2', author: 'Bea', picture: 'b.jpg', points: 12 },
            { userId: 'u1', author: 'Ana', picture: 'a.jpg', points: 10 }
        ]

        setRanking(serverRanking)(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.type).toBe('ranking_fulfilled')
        expect(action.payload).toBe(serverRanking)
    })

    test('is a no-op when the response carries no ranking array', () => {
        setRanking(undefined)(dispatch)
        setRanking(null)(dispatch)
        setRanking('nope' as any)(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })
})
