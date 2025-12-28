/* eslint-disable max-lines */
import axios from 'axios'
import {
    createPoemAction,
    getAllPoemsAction,
    updateAllPoemsCacheAfterLikePoemAction,
    updatePoemsListCacheAfterLikePoemAction,
    updateRankingCacheAfterLikePoemAction
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

describe('getAllPoemsAction', () => {
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

        getAllPoemsAction({
            params: {},
            options,
            callbacks
        })(dispatch)

        expect(spy).toHaveBeenCalled()
        expect(spy).toBeCalledTimes(1)
        expect(spy).toHaveBeenCalledWith({
            type: ACTIONS.ALL_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            options,
            params: {},
            callbacks
        })
        spy.mockRestore()
    })

    test('dispatches - reset', () => {
        const options = {
            fetch: false,
            reset: true
        }

        getAllPoemsAction({
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

        getAllPoemsAction({
            params: {},
            options
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toBe(`${ACTIONS.ALL_POEMS}_reset`)
    })

    test('Should dispatch error when axios throws a generic error', async () => {
        mockGet.mockRejectedValueOnce({
            response: 'some error'
        })

        const options = { fetch: true }

        // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
        await waitFor(() =>
            getAllPoemsAction({
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
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.ALL_POEMS}_rejected`)
        expect((dispatch as jest.Mock).mock.calls[1][0].payload.response).toBe('some error')
    })

    // a network error is diferent because we don't get an error as an object with a response property
    test('Should dispatch error when axios throws a network error', async () => {
        mockGet.mockRejectedValueOnce('Network error')

        const options = { fetch: true }

        // this is done to give time to the test to wait until the second dispatch occurs. We can also use "act"
        await waitFor(() =>
            getAllPoemsAction({
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
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toBe(`${ACTIONS.ALL_POEMS}_rejected`)
        expect((dispatch as jest.Mock).mock.calls[1][0].payload).toBe('Network error')
    })

    test('Should dispatch response when axios returns data correctly', async () => {
        // this is beacuse we use Axios.create
        mockGet.mockResolvedValueOnce({
            data: 'poem1',
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        const options = { fetch: true }
        await waitFor(() =>
            getAllPoemsAction({
                params: {},
                options
            })(dispatch)
        )

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_request`)
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
        expect((dispatch as jest.Mock).mock.calls[1][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[1][0].payload).toEqual('poem1')
    })
})

describe('updatePoemsListCacheAfterLikePoemAction', () => {
    let dispatch: AppDispatch
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

    test('Should update cache when disliking a poem', () => {
        const context = {
            elementToEdit: '1',
            user: 'whatever',
            userId: '1',
            username: 'username',
            picture: '1.jpg',
            config: {},
            adminId: '1',
            setState: () => {}
        }

        const initialState = [
            {
                id: '1',
                likes: ['1', '4']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]
        const finalPoems = [
            {
                id: '1',
                likes: ['4']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: initialState,
                page: 2,
                hasMore: true,
                total: 25,
                totalPages: 3
            }
        })

        updatePoemsListCacheAfterLikePoemAction({
            poemId: '1',
            context
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.POEMS_LIST}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual({
            poems: finalPoems,
            page: 2,
            hasMore: true,
            total: 25,
            totalPages: 3
        })
    })
    test('Should update cache when liking a poem', () => {
        const context = {
            elementToEdit: '1',
            user: 'whatever',
            userId: '2',
            username: 'username',
            picture: '1.jpg',
            config: {},
            adminId: '1',
            setState: () => {}
        }

        const initialState = [
            {
                id: '1',
                likes: ['1']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]
        const finalPoems = [
            {
                id: '1',
                likes: ['1', '2']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 2,
                totalPages: 1
            }
        })

        updatePoemsListCacheAfterLikePoemAction({
            poemId: '1',
            context
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.POEMS_LIST}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual({
            poems: finalPoems,
            page: 1,
            hasMore: false,
            total: 2,
            totalPages: 1
        })
    })
    test('Should do nothing when liking a poem that does not exist', () => {
        const context = {
            elementToEdit: '1',
            user: 'whatever',
            userId: '1',
            username: 'username',
            picture: '1.jpg',
            config: {},
            adminId: '1',
            setState: () => {}
        }

        const initialState = [
            {
                id: '1',
                likes: ['1']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]
        const finalPoems = [
            {
                id: '1',
                likes: ['1']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: initialState,
                page: 1,
                hasMore: true,
                total: 15,
                totalPages: 2
            }
        })

        updatePoemsListCacheAfterLikePoemAction({
            poemId: '3',
            context
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.POEMS_LIST}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual({
            poems: finalPoems,
            page: 1,
            hasMore: true,
            total: 15,
            totalPages: 2
        })
    })
})

describe('updateRankingCacheAfterLikePoemAction', () => {
    let dispatch: AppDispatch
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

    test('Should update cache when disliking a poem', () => {
        const context = {
            elementToEdit: '1',
            user: 'whatever',
            userId: '1',
            username: 'username',
            picture: '1.jpg',
            config: {},
            adminId: '1',
            setState: () => {}
        }

        const initialState = [
            {
                id: '1',
                likes: ['1', '4']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]
        const finalState = [
            {
                id: '1',
                likes: ['4']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            rankingQuery: {
                item: initialState
            }
        })

        updateRankingCacheAfterLikePoemAction({
            poemId: '1',
            context
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.RANKING}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
    })
    test('Should update cache when liking a poem', () => {
        const context = {
            elementToEdit: '1',
            user: 'whatever',
            userId: '2',
            username: 'username',
            picture: '1.jpg',
            config: {},
            adminId: '1',
            setState: () => {}
        }

        const initialState = [
            {
                id: '1',
                likes: ['1']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]
        const finalState = [
            {
                id: '1',
                likes: ['1', '2']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            rankingQuery: {
                item: initialState
            }
        })

        updateRankingCacheAfterLikePoemAction({
            poemId: '1',
            context
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.RANKING}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
    })
})

describe('updateAllPoemsCacheAfterLikePoemAction', () => {
    let dispatch: AppDispatch
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

    test('Should update cache when disliking a poem', () => {
        const context = {
            elementToEdit: '1',
            user: 'whatever',
            userId: '1',
            username: 'username',
            picture: '1.jpg',
            config: {},
            adminId: '1',
            setState: () => {}
        }

        const initialState = [
            {
                id: '1',
                likes: ['1', '4']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]
        const finalState = [
            {
                id: '1',
                likes: ['4']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: initialState
            }
        })

        updateAllPoemsCacheAfterLikePoemAction({
            poemId: '1',
            context
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
    })
    test('Should update cache when liking a poem', () => {
        const context = {
            elementToEdit: '1',
            user: 'whatever',
            userId: '2',
            username: 'username',
            picture: '1.jpg',
            config: {},
            adminId: '1',
            setState: () => {}
        }

        const initialState = [
            {
                id: '1',
                likes: ['1']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]
        const finalState = [
            {
                id: '1',
                likes: ['1', '2']
            },
            {
                id: '2',
                likes: ['12', '14']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: initialState
            }
        })

        updateAllPoemsCacheAfterLikePoemAction({
            poemId: '1',
            context
        })(dispatch)

        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(finalState)
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
        adminId: '1',
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
        // this is beacuse we use Axios.create
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
            callbacks: undefined
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
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
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
        expect((dispatch as jest.Mock).mock.calls.length).toBe(2)
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
            callbacks: undefined
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
            callbacks: undefined
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

describe('updateAllPoemsCacheAfterSavePoemAction', () => {
    let dispatch: AppDispatch
    let consoleLogSpy: jest.SpyInstance

    beforeEach(() => {
        dispatch = jest.fn()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        consoleLogSpy.mockRestore()
        jest.clearAllMocks()
    })

    test('Should update poem in cache when allPoemsQuery exists', () => {
        const initialState = [
            {
                id: '1',
                title: 'Original Title',
                author: 'Author 1',
                poem: 'Original poem text',
                likes: ['1']
            },
            {
                id: '2',
                title: 'Poem 2',
                author: 'Author 2',
                poem: 'Poem 2 text',
                likes: ['2']
            }
        ]

        const updatedPoemData = {
            title: 'Updated Title',
            poem: 'Updated poem text'
        }

        const expectedState = [
            {
                id: '2',
                title: 'Poem 2',
                author: 'Author 2',
                poem: 'Poem 2 text',
                likes: ['2']
            },
            {
                id: '1',
                title: 'Updated Title',
                author: 'Author 1',
                poem: 'Updated poem text',
                likes: ['1']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: initialState
            }
        })

        const { updateAllPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateAllPoemsCacheAfterSavePoemAction({
            poem: updatedPoemData,
            poemId: '1'
        })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toEqual(expectedState)
    })

    test('Should not crash when allPoemsQuery is undefined (cache not loaded)', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: undefined
            }
        })

        const { updateAllPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateAllPoemsCacheAfterSavePoemAction({
            poem: { title: 'Updated Title' },
            poemId: '1'
        })(dispatch)

        // Should not dispatch anything
        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should not crash when allPoemsQuery is null', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: null
            }
        })

        const { updateAllPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateAllPoemsCacheAfterSavePoemAction({
            poem: { title: 'Updated Title' },
            poemId: '1'
        })(dispatch)

        // Should not dispatch anything
        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should preserve all other poems when updating one poem', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                author: 'Author 1',
                likes: ['1']
            },
            {
                id: '2',
                title: 'Poem 2',
                author: 'Author 2',
                likes: ['2', '3']
            },
            {
                id: '3',
                title: 'Poem 3',
                author: 'Author 3',
                likes: []
            }
        ]

        const updatedPoemData = {
            title: 'Updated Poem 2 Title'
        }

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: initialState
            }
        })

        const { updateAllPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateAllPoemsCacheAfterSavePoemAction({
            poem: updatedPoemData,
            poemId: '2'
        })(dispatch)

        const dispatchedPayload = (dispatch as jest.Mock).mock.calls[0][0].payload

        // Should have all 3 poems
        expect(dispatchedPayload).toHaveLength(3)
        // Should have updated poem 2
        const updatedPoem = dispatchedPayload.find((p: any) => p.id === '2')
        expect(updatedPoem.title).toBe('Updated Poem 2 Title')
        expect(updatedPoem.author).toBe('Author 2')
        expect(updatedPoem.likes).toEqual(['2', '3'])
        // Should preserve other poems
        expect(dispatchedPayload.find((p: any) => p.id === '1')).toBeDefined()
        expect(dispatchedPayload.find((p: any) => p.id === '3')).toBeDefined()
    })

    test('Should handle updating a poem that does not exist in cache', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                author: 'Author 1'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: initialState
            }
        })

        const { updateAllPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateAllPoemsCacheAfterSavePoemAction({
            poem: { title: 'Updated Title' },
            poemId: '999'
        })(dispatch)

        const dispatchedPayload = (dispatch as jest.Mock).mock.calls[0][0].payload

        // Current behavior: adds a partial poem object when poem doesn't exist
        // Note: This is not ideal behavior but tests the actual implementation
        expect(dispatchedPayload).toHaveLength(2)
        expect(dispatchedPayload[0].id).toBe('1')
        // Second item will be the "updated" poem with undefined merged with update data
        expect(dispatchedPayload[1].title).toBe('Updated Title')
    })
})

describe('updateMyPoemsCacheAfterSavePoemAction', () => {
    let dispatch: AppDispatch
    let consoleLogSpy: jest.SpyInstance

    beforeEach(() => {
        dispatch = jest.fn()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        consoleLogSpy.mockRestore()
        jest.clearAllMocks()
    })

    test('Should update poem in myPoems cache when cache exists', () => {
        const initialState = [
            {
                id: '1',
                title: 'My Original Poem',
                author: 'Author 1',
                poem: 'Original content',
                userId: 'user-123',
                likes: []
            },
            {
                id: '2',
                title: 'Another Poem',
                author: 'Author 1',
                poem: 'Another content',
                userId: 'user-123',
                likes: ['user-456']
            }
        ]

        const updatedPoemData = {
            title: 'My Updated Poem',
            poem: 'Updated content'
        }

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 2,
                totalPages: 1
            }
        })

        const { updateMyPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterSavePoemAction({
            poem: updatedPoemData,
            poemId: '1'
        })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.MY_POEMS}_fulfilled`)

        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload
        expect(payload.poems).toHaveLength(2)
        expect(payload.poems[0].id).toBe('1')
        expect(payload.poems[0].title).toBe('My Updated Poem')
        expect(payload.poems[0].poem).toBe('Updated content')
        expect(payload.poems[0].author).toBe('Author 1')
        expect(payload.poems[1].id).toBe('2')
        expect(payload.page).toBe(1)
        expect(payload.total).toBe(2)
    })

    test('Should not crash when myPoemsQuery is undefined (cache not loaded)', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: undefined
            }
        })

        const { updateMyPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterSavePoemAction({
            poem: { title: 'Updated Title' },
            poemId: '1'
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should preserve pagination metadata when updating', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-123'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 2,
                hasMore: true,
                total: 15,
                totalPages: 2
            }
        })

        const { updateMyPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterSavePoemAction({
            poem: { title: 'Updated Poem 1' },
            poemId: '1'
        })(dispatch)

        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload
        expect(payload.page).toBe(2)
        expect(payload.hasMore).toBe(true)
        expect(payload.total).toBe(15)
        expect(payload.totalPages).toBe(2)
    })

    test('Should only update the specific poem, not others', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                likes: ['user-1']
            },
            {
                id: '2',
                title: 'Poem 2',
                likes: ['user-2', 'user-3']
            },
            {
                id: '3',
                title: 'Poem 3',
                likes: []
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 3,
                totalPages: 1
            }
        })

        const { updateMyPoemsCacheAfterSavePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterSavePoemAction({
            poem: { title: 'Updated Poem 2' },
            poemId: '2'
        })(dispatch)

        const poems = (dispatch as jest.Mock).mock.calls[0][0].payload.poems
        expect(poems[0].title).toBe('Poem 1')
        expect(poems[1].title).toBe('Updated Poem 2')
        expect(poems[1].likes).toEqual(['user-2', 'user-3'])
        expect(poems[2].title).toBe('Poem 3')
    })
})

describe('updateAllPoemsCacheAfterCreatePoemAction', () => {
    let dispatch: AppDispatch
    let consoleLogSpy: jest.SpyInstance

    beforeEach(() => {
        dispatch = jest.fn()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        consoleLogSpy.mockRestore()
        jest.clearAllMocks()
    })

    test('Should add new poem to cache when allPoemsQuery exists', () => {
        const initialState = [
            {
                id: '1',
                title: 'Existing Poem',
                author: 'Author 1',
                likes: []
            }
        ]

        const newPoem = {
            id: '2',
            title: 'New Poem',
            author: 'Author 2',
            poem: 'New poem content',
            userId: 'user-123',
            likes: [],
            genre: 'love',
            picture: 'pic.jpg',
            date: '2024-01-01'
        }

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: initialState
            }
        })

        const { updateAllPoemsCacheAfterCreatePoemAction } = require('./poemsActions')

        updateAllPoemsCacheAfterCreatePoemAction({
            response: newPoem
        })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.ALL_POEMS}_fulfilled`)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload).toHaveLength(2)
        expect((dispatch as jest.Mock).mock.calls[0][0].payload[1]).toEqual(newPoem)
    })

    test('Should not crash when allPoemsQuery is null (CRITICAL BUG FIX)', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: null
            }
        })

        const { updateAllPoemsCacheAfterCreatePoemAction } = require('./poemsActions')

        const newPoem = {
            id: '1',
            title: 'New Poem',
            author: 'Author 1'
        }

        // This used to crash with "Cannot read properties of undefined reading push"
        updateAllPoemsCacheAfterCreatePoemAction({
            response: newPoem
        })(dispatch)

        // Should not dispatch anything
        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should not crash when allPoemsQuery is undefined', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            allPoemsQuery: {
                item: undefined
            }
        })

        const { updateAllPoemsCacheAfterCreatePoemAction } = require('./poemsActions')

        updateAllPoemsCacheAfterCreatePoemAction({
            response: { id: '1', title: 'New Poem' }
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })
})

describe('updateMyPoemsCacheAfterCreatePoemAction', () => {
    let dispatch: AppDispatch
    let consoleLogSpy: jest.SpyInstance

    beforeEach(() => {
        dispatch = jest.fn()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        consoleLogSpy.mockRestore()
        jest.clearAllMocks()
    })

    test('Should add new poem to beginning of myPoems cache (CRITICAL BUG FIX)', () => {
        const initialState = [
            {
                id: '1',
                title: 'Older Poem',
                author: 'Author 1',
                userId: 'user-123',
                likes: []
            }
        ]

        const newPoem = {
            id: '2',
            title: 'Brand New Poem',
            author: 'Author 1',
            poem: 'New content',
            userId: 'user-123',
            likes: [],
            genre: 'love',
            picture: 'pic.jpg',
            date: '2024-01-02'
        }

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 1,
                totalPages: 1
            }
        })

        const { updateMyPoemsCacheAfterCreatePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterCreatePoemAction({
            response: newPoem
        })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload

        expect(payload.poems).toHaveLength(2)
        // New poem should be at the beginning (most recent first)
        expect(payload.poems[0]).toEqual(newPoem)
        expect(payload.poems[1].id).toBe('1')
        // Total should be incremented
        expect(payload.total).toBe(2)
    })

    test('Should not crash when myPoemsQuery is null (CRITICAL BUG FIX)', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: null
            }
        })

        const { updateMyPoemsCacheAfterCreatePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterCreatePoemAction({
            response: { id: '1', title: 'New Poem' }
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should increment total count correctly', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: [],
                page: 1,
                hasMore: false,
                total: 0,
                totalPages: 1
            }
        })

        const { updateMyPoemsCacheAfterCreatePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterCreatePoemAction({
            response: { id: '1', title: 'First Poem' }
        })(dispatch)

        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload
        expect(payload.total).toBe(1)
    })
})

describe('updatePoemsListCacheAfterCreatePoemAction', () => {
    let dispatch: AppDispatch
    let consoleLogSpy: jest.SpyInstance

    beforeEach(() => {
        dispatch = jest.fn()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        consoleLogSpy.mockRestore()
        jest.clearAllMocks()
    })

    test('Should add new poem to beginning of poemsList cache', () => {
        const initialState = [
            {
                id: '1',
                title: 'Existing Poem',
                author: 'Author 1',
                likes: []
            }
        ]

        const newPoem = {
            id: '2',
            title: 'New Poem',
            author: 'Author 2',
            poem: 'Content',
            userId: 'user-456',
            likes: [],
            genre: 'nature',
            picture: 'pic2.jpg',
            date: '2024-01-02'
        }

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 1,
                totalPages: 1
            }
        })

        const { updatePoemsListCacheAfterCreatePoemAction } = require('./poemsActions')

        updatePoemsListCacheAfterCreatePoemAction({
            response: newPoem
        })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload

        expect(payload.poems).toHaveLength(2)
        // New poem should be at the beginning
        expect(payload.poems[0]).toEqual(newPoem)
        expect(payload.poems[1].id).toBe('1')
        // Total should be incremented
        expect(payload.total).toBe(2)
    })

    test('Should not crash when poemsListQuery is null', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: null
            }
        })

        const { updatePoemsListCacheAfterCreatePoemAction } = require('./poemsActions')

        updatePoemsListCacheAfterCreatePoemAction({
            response: { id: '1', title: 'New Poem' }
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should preserve pagination metadata', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: [],
                page: 2,
                hasMore: true,
                total: 20,
                totalPages: 3
            }
        })

        const { updatePoemsListCacheAfterCreatePoemAction } = require('./poemsActions')

        updatePoemsListCacheAfterCreatePoemAction({
            response: { id: '21', title: 'New Poem' }
        })(dispatch)

        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload
        expect(payload.page).toBe(2)
        expect(payload.hasMore).toBe(true)
        expect(payload.total).toBe(21) // Incremented
        expect(payload.totalPages).toBe(3)
    })
})

describe('updatePoemsListCacheAfterSavePoemAction', () => {
    let dispatch: AppDispatch
    let consoleLogSpy: jest.SpyInstance

    beforeEach(() => {
        dispatch = jest.fn()
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
        jest.clearAllMocks()
    })

    afterEach(() => {
        ;(dispatch as jest.Mock).mockClear()
        consoleLogSpy.mockRestore()
        jest.clearAllMocks()
    })

    test('Should update poem in poemsList cache when cache exists', () => {
        const initialState = [
            {
                id: '1',
                title: 'List Poem 1',
                author: 'Author 1',
                poem: 'Content 1',
                likes: []
            },
            {
                id: '2',
                title: 'List Poem 2',
                author: 'Author 2',
                poem: 'Content 2',
                likes: ['user-1']
            }
        ]

        const updatedPoemData = {
            title: 'Updated List Poem 1',
            poem: 'Updated content 1'
        }

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: initialState,
                page: 1,
                hasMore: true,
                total: 50,
                totalPages: 3
            }
        })

        const { updatePoemsListCacheAfterSavePoemAction } = require('./poemsActions')

        updatePoemsListCacheAfterSavePoemAction({
            poem: updatedPoemData,
            poemId: '1'
        })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        expect((dispatch as jest.Mock).mock.calls[0][0].type).toStrictEqual(`${ACTIONS.POEMS_LIST}_fulfilled`)

        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload
        expect(payload.poems).toHaveLength(2)
        expect(payload.poems[0].id).toBe('1')
        expect(payload.poems[0].title).toBe('Updated List Poem 1')
        expect(payload.poems[0].poem).toBe('Updated content 1')
        expect(payload.poems[1].id).toBe('2')
        expect(payload.page).toBe(1)
        expect(payload.hasMore).toBe(true)
        expect(payload.total).toBe(50)
    })

    test('Should not crash when poemsListQuery is undefined (cache not loaded)', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: undefined
            }
        })

        const { updatePoemsListCacheAfterSavePoemAction } = require('./poemsActions')

        updatePoemsListCacheAfterSavePoemAction({
            poem: { title: 'Updated Title' },
            poemId: '1'
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should preserve pagination metadata when updating', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: initialState,
                page: 3,
                hasMore: false,
                total: 45,
                totalPages: 3
            }
        })

        const { updatePoemsListCacheAfterSavePoemAction } = require('./poemsActions')

        updatePoemsListCacheAfterSavePoemAction({
            poem: { title: 'Updated Poem 1' },
            poemId: '1'
        })(dispatch)

        const payload = (dispatch as jest.Mock).mock.calls[0][0].payload
        expect(payload.page).toBe(3)
        expect(payload.hasMore).toBe(false)
        expect(payload.total).toBe(45)
        expect(payload.totalPages).toBe(3)
    })

    test('Should handle updating poem across multiple pages', () => {
        const initialState = [
            {
                id: '1',
                title: 'Page 1 Poem 1'
            },
            {
                id: '2',
                title: 'Page 1 Poem 2'
            },
            {
                id: '21',
                title: 'Page 2 Poem 1'
            },
            {
                id: '22',
                title: 'Page 2 Poem 2'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            poemsListQuery: {
                item: initialState,
                page: 2,
                hasMore: false,
                total: 4,
                totalPages: 2
            }
        })

        const { updatePoemsListCacheAfterSavePoemAction } = require('./poemsActions')

        updatePoemsListCacheAfterSavePoemAction({
            poem: { title: 'Updated Page 2 Poem 1' },
            poemId: '21'
        })(dispatch)

        const poems = (dispatch as jest.Mock).mock.calls[0][0].payload.poems
        expect(poems).toHaveLength(4)
        expect(poems[2].id).toBe('21')
        expect(poems[2].title).toBe('Updated Page 2 Poem 1')
        expect(poems[0].title).toBe('Page 1 Poem 1')
        expect(poems[1].title).toBe('Page 1 Poem 2')
    })
})

describe('updateMyPoemsCacheAfterDeletePoemAction', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('Should remove poem from myPoems cache', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-123'
            },
            {
                id: '2',
                title: 'Poem 2',
                userId: 'user-123'
            },
            {
                id: '3',
                title: 'Poem 3',
                userId: 'user-123'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 3,
                totalPages: 1
            }
        })

        const { updateMyPoemsCacheAfterDeletePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterDeletePoemAction({
            poemId: '2'
        })(dispatch)

        expect(dispatch).toHaveBeenCalledTimes(1)
        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.type).toBe('my-poems_fulfilled')
        expect(action.payload.poems).toHaveLength(2)
        expect(action.payload.poems.find((p: any) => p.id === '2')).toBeUndefined()
        expect(action.payload.poems[0].id).toBe('1')
        expect(action.payload.poems[1].id).toBe('3')
    })

    test('Should decrease total count when deleting poem', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-123'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 5,
                totalPages: 1
            }
        })

        const { updateMyPoemsCacheAfterDeletePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterDeletePoemAction({
            poemId: '1'
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.total).toBe(4) // 5 - 1
    })

    test('Should not crash when myPoemsQuery is undefined (cache not loaded)', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: undefined
            }
        })

        const { updateMyPoemsCacheAfterDeletePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterDeletePoemAction({
            poemId: '1'
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should not crash when myPoemsQuery is null', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: null
            }
        })

        const { updateMyPoemsCacheAfterDeletePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterDeletePoemAction({
            poemId: '1'
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should preserve pagination metadata when deleting', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-123'
            },
            {
                id: '2',
                title: 'Poem 2',
                userId: 'user-123'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 2,
                hasMore: true,
                total: 15,
                totalPages: 3
            }
        })

        const { updateMyPoemsCacheAfterDeletePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterDeletePoemAction({
            poemId: '1'
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.page).toBe(2)
        expect(action.payload.hasMore).toBe(true)
        expect(action.payload.total).toBe(14) // Decreased by 1
        expect(action.payload.totalPages).toBe(3)
    })

    test('Should handle deleting the last poem (total should not go below 0)', () => {
        const initialState = [
            {
                id: '1',
                title: 'Last Poem',
                userId: 'user-123'
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myPoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 0, // Edge case: total is already 0
                totalPages: 1
            }
        })

        const { updateMyPoemsCacheAfterDeletePoemAction } = require('./poemsActions')

        updateMyPoemsCacheAfterDeletePoemAction({
            poemId: '1'
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.total).toBe(0) // Should not be negative
        expect(action.payload.poems).toHaveLength(0)
    })
})

describe('updateMyFavouritePoemsCacheAfterLikePoemAction', () => {
    let dispatch: jest.Mock

    const mockContext = {
        user: 'user-token',
        userId: 'user-123',
        username: 'testuser',
        picture: 'avatar.jpg',
        adminId: 'admin-1',
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    beforeEach(() => {
        dispatch = jest.fn()
    })

    test('Should remove poem from cache when unliking', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-456',
                likes: ['user-123', 'user-789'] // User has liked this poem
            },
            {
                id: '2',
                title: 'Poem 2',
                userId: 'user-456',
                likes: ['user-123'] // User has liked this poem
            },
            {
                id: '3',
                title: 'Poem 3',
                userId: 'user-456',
                likes: ['user-123', 'user-999'] // User has liked this poem
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: true,
                total: 3,
                totalPages: 1
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '2',
            context: mockContext
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.poems).toHaveLength(2)
        expect(action.payload.poems.find((p: any) => p.id === '2')).toBeUndefined()
        expect(action.payload.poems.find((p: any) => p.id === '1')).toBeDefined()
        expect(action.payload.poems.find((p: any) => p.id === '3')).toBeDefined()
    })

    test('Should update likes when liking a poem (rare case)', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-456',
                likes: ['user-789'] // User has NOT liked this poem
            },
            {
                id: '2',
                title: 'Poem 2',
                userId: 'user-456',
                likes: ['user-123'] // User has liked this poem
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 2,
                totalPages: 1
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '1',
            context: mockContext
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.poems).toHaveLength(2)
        const updatedPoem = action.payload.poems.find((p: any) => p.id === '1')
        expect(updatedPoem.likes).toContain('user-123')
        expect(updatedPoem.likes).toHaveLength(2)
    })

    test('Should NOT dispatch if myFavouritePoemsQuery.item is null', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: null,
                page: 1,
                hasMore: false,
                total: 0,
                totalPages: 0
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '1',
            context: mockContext
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should NOT dispatch if myFavouritePoemsQuery.item is undefined', () => {
        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: undefined,
                page: 1,
                hasMore: false,
                total: 0,
                totalPages: 0
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '1',
            context: mockContext
        })(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('Should preserve pagination metadata and decrease total when unliking', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-456',
                likes: ['user-123', 'user-789']
            },
            {
                id: '2',
                title: 'Poem 2',
                userId: 'user-456',
                likes: ['user-123']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: initialState,
                page: 2,
                hasMore: true,
                total: 15,
                totalPages: 3
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '1',
            context: mockContext
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.page).toBe(2)
        expect(action.payload.hasMore).toBe(true)
        expect(action.payload.total).toBe(14) // Decreased by 1
        expect(action.payload.totalPages).toBe(3)
    })

    test('Should preserve pagination metadata and keep same total when liking', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-456',
                likes: ['user-789'] // User has NOT liked this
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 10,
                totalPages: 2
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '1',
            context: mockContext
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.page).toBe(1)
        expect(action.payload.hasMore).toBe(false)
        expect(action.payload.total).toBe(10) // Unchanged
        expect(action.payload.totalPages).toBe(2)
    })

    test('Should handle unliking the last poem (total should not go below 0)', () => {
        const initialState = [
            {
                id: '1',
                title: 'Last Poem',
                userId: 'user-456',
                likes: ['user-123']
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 0, // Edge case: total is already 0
                totalPages: 1
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '1',
            context: mockContext
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        expect(action.payload.total).toBe(0) // Should not be negative
        expect(action.payload.poems).toHaveLength(0)
    })

    test('Should correctly identify unliking vs liking based on current likes array', () => {
        const initialState = [
            {
                id: '1',
                title: 'Poem 1',
                userId: 'user-456',
                likes: ['user-123'] // User HAS liked
            },
            {
                id: '2',
                title: 'Poem 2',
                userId: 'user-456',
                likes: [] // User has NOT liked
            }
        ]

        ;(store.getState as jest.Mock).mockReturnValueOnce({
            myFavouritePoemsQuery: {
                item: initialState,
                page: 1,
                hasMore: false,
                total: 2,
                totalPages: 1
            }
        })

        const { updateMyFavouritePoemsCacheAfterLikePoemAction } = require('./poemsActions')

        // Unliking poem 1 (user had liked it)
        updateMyFavouritePoemsCacheAfterLikePoemAction({
            poemId: '1',
            context: mockContext
        })(dispatch)

        const action = (dispatch as jest.Mock).mock.calls[0][0]
        // Should remove poem from cache
        expect(action.payload.poems).toHaveLength(1)
        expect(action.payload.poems.find((p: any) => p.id === '1')).toBeUndefined()
    })
})
