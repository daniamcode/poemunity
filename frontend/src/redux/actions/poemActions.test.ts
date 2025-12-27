import {
    getPoemAction,
    likePoemAction,
    updatePoemCacheAfterLikePoemAction,
    deletePoemAction,
    savePoemAction
} from './poemActions'
import * as commonActions from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/poemReducers'
import { AppDispatch } from '../store'
import store from '../store/index'
import { Poem, Context } from '../../typescript/interfaces'

jest.mock('../store/index')

// Polyfill for structuredClone if not available
if (typeof structuredClone === 'undefined') {
    global.structuredClone = function (obj: any) {
        return JSON.parse(JSON.stringify(obj))
    }
}

describe('poemActions', () => {
    let dispatch: AppDispatch

    const mockCallbacks = {
        success: jest.fn(),
        error: jest.fn(),
        reset: jest.fn()
    }

    const mockContext: Context = {
        user: 'token123',
        userId: 'user-123',
        username: 'testuser',
        picture: 'pic.jpg',
        adminId: 'admin-456',
        setState: jest.fn(),
        config: {
            headers: {
                Authorization: 'Bearer token123'
            }
        }
    }

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    describe('getPoemAction', () => {
        test('should call getAction with correct parameters', () => {
            const spy = jest.spyOn(commonActions, 'getAction')
            const poemId = 'poem-123'

            getPoemAction({
                params: { poemId }
            })(dispatch)

            expect(spy).toHaveBeenCalledWith({
                type: ACTIONS.POEM,
                url: `${API_ENDPOINTS.POEMS}/${poemId}`,
                dispatch,
                options: undefined
            })
            expect(spy).toHaveBeenCalledTimes(1)

            spy.mockRestore()
        })

        test('should call getAction with options when provided', () => {
            const spy = jest.spyOn(commonActions, 'getAction')
            const poemId = 'poem-456'
            const options = { fetch: false, reset: true }

            getPoemAction({
                params: { poemId },
                options
            })(dispatch)

            expect(spy).toHaveBeenCalledWith({
                type: ACTIONS.POEM,
                url: `${API_ENDPOINTS.POEMS}/${poemId}`,
                dispatch,
                options
            })

            spy.mockRestore()
        })

        test('should return a function', () => {
            const result = getPoemAction({
                params: { poemId: 'poem-123' }
            })

            expect(typeof result).toBe('function')
        })

        test('should use correct API endpoint format', () => {
            const spy = jest.spyOn(commonActions, 'getAction')
            const poemId = 'test-poem-id'

            getPoemAction({
                params: { poemId }
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: `${API_ENDPOINTS.POEMS}/${poemId}`
                })
            )

            spy.mockRestore()
        })
    })

    describe('likePoemAction', () => {
        test('should call putAction with correct parameters', () => {
            const spy = jest.spyOn(commonActions, 'putAction')
            const poemId = 'poem-123'

            likePoemAction({
                params: { poemId },
                context: mockContext,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith({
                type: ACTIONS.LIKE_POEM,
                url: `${API_ENDPOINTS.POEMS}/${poemId}`,
                config: mockContext.config,
                dispatch,
                options: undefined,
                callbacks: mockCallbacks
            })
            expect(spy).toHaveBeenCalledTimes(1)

            spy.mockRestore()
        })

        test('should include authorization config from context', () => {
            const spy = jest.spyOn(commonActions, 'putAction')
            const poemId = 'poem-456'
            const customContext = {
                ...mockContext,
                config: {
                    headers: {
                        Authorization: 'Bearer custom-token'
                    }
                }
            }

            likePoemAction({
                params: { poemId },
                context: customContext,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: customContext.config
                })
            )

            spy.mockRestore()
        })

        test('should call putAction with options when provided', () => {
            const spy = jest.spyOn(commonActions, 'putAction')
            const poemId = 'poem-789'
            const options = { fetch: true, reset: false }

            likePoemAction({
                params: { poemId },
                context: mockContext,
                options,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    options
                })
            )

            spy.mockRestore()
        })

        test('should return a function', () => {
            const result = likePoemAction({
                params: { poemId: 'poem-123' },
                context: mockContext,
                callbacks: mockCallbacks
            })

            expect(typeof result).toBe('function')
        })
    })

    describe('updatePoemCacheAfterLikePoemAction', () => {
        test('should add userId to likes when user has not liked the poem', () => {
            const mockPoem: Poem = {
                id: 'poem-123',
                title: 'Test Poem',
                author: 'Test Author',
                poem: 'Test content',
                likes: ['user-456', 'user-789'],
                userId: 'author-123',
                genre: 'love',
                picture: 'pic.jpg',
                date: '2024-01-01'
            }

            ;(store.getState as jest.Mock).mockReturnValue({
                poemQuery: {
                    item: mockPoem
                }
            })

            const spy = jest.spyOn(commonActions, 'getTypes')

            updatePoemCacheAfterLikePoemAction({ context: mockContext })(dispatch)

            expect(spy).toHaveBeenCalledWith(ACTIONS.POEM)
            expect(dispatch).toHaveBeenCalledWith({
                type: `${ACTIONS.POEM}_fulfilled`,
                payload: expect.objectContaining({
                    likes: expect.arrayContaining(['user-456', 'user-789', 'user-123'])
                })
            })

            spy.mockRestore()
        })

        test('should remove userId from likes when user has already liked the poem', () => {
            const mockPoem: Poem = {
                id: 'poem-123',
                title: 'Test Poem',
                author: 'Test Author',
                poem: 'Test content',
                likes: ['user-456', 'user-123', 'user-789'],
                userId: 'author-123',
                genre: 'love',
                picture: 'pic.jpg',
                date: '2024-01-01'
            }

            ;(store.getState as jest.Mock).mockReturnValue({
                poemQuery: {
                    item: mockPoem
                }
            })

            updatePoemCacheAfterLikePoemAction({ context: mockContext })(dispatch)

            expect(dispatch).toHaveBeenCalledWith({
                type: `${ACTIONS.POEM}_fulfilled`,
                payload: expect.objectContaining({
                    likes: ['user-456', 'user-789']
                })
            })
        })

        test('should not mutate original poem state', () => {
            const mockPoem: Poem = {
                id: 'poem-123',
                title: 'Test Poem',
                author: 'Test Author',
                poem: 'Test content',
                likes: ['user-456'],
                userId: 'author-123',
                genre: 'love',
                picture: 'pic.jpg',
                date: '2024-01-01'
            }

            const originalLikes = [...mockPoem.likes]

            ;(store.getState as jest.Mock).mockReturnValue({
                poemQuery: {
                    item: mockPoem
                }
            })

            updatePoemCacheAfterLikePoemAction({ context: mockContext })(dispatch)

            expect(mockPoem.likes).toEqual(originalLikes)
        })

        test('should return a function', () => {
            const result = updatePoemCacheAfterLikePoemAction({ context: mockContext })

            expect(typeof result).toBe('function')
        })
    })

    describe('deletePoemAction', () => {
        test('should call deleteAction with correct parameters', () => {
            const spy = jest.spyOn(commonActions, 'deleteAction')
            const poemId = 'poem-123'

            deletePoemAction({
                params: { poemId },
                context: mockContext,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith({
                type: ACTIONS.DELETE_POEM,
                url: `${API_ENDPOINTS.POEMS}/${poemId}`,
                config: mockContext.config,
                dispatch,
                options: undefined,
                callbacks: mockCallbacks
            })
            expect(spy).toHaveBeenCalledTimes(1)

            spy.mockRestore()
        })

        test('should include authorization config from context', () => {
            const spy = jest.spyOn(commonActions, 'deleteAction')
            const poemId = 'poem-456'

            deletePoemAction({
                params: { poemId },
                context: mockContext,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: mockContext.config
                })
            )

            spy.mockRestore()
        })

        test('should call deleteAction with options when provided', () => {
            const spy = jest.spyOn(commonActions, 'deleteAction')
            const poemId = 'poem-789'
            const options = { fetch: true, reset: false }

            deletePoemAction({
                params: { poemId },
                context: mockContext,
                options,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    options
                })
            )

            spy.mockRestore()
        })

        test('should return a function', () => {
            const result = deletePoemAction({
                params: { poemId: 'poem-123' },
                context: mockContext,
                callbacks: mockCallbacks
            })

            expect(typeof result).toBe('function')
        })
    })

    describe('savePoemAction', () => {
        const mockPoemData: Poem = {
            id: 'poem-123',
            title: 'Updated Poem',
            author: 'Test Author',
            poem: 'Updated content',
            likes: [],
            userId: 'user-123',
            genre: 'love',
            picture: 'pic.jpg',
            date: '2024-01-01'
        }

        test('should call patchAction with correct parameters', () => {
            const spy = jest.spyOn(commonActions, 'patchAction')
            const poemId = 'poem-123'

            savePoemAction({
                params: { poemId },
                data: mockPoemData,
                context: mockContext,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith({
                type: ACTIONS.SAVE_POEM,
                url: `${API_ENDPOINTS.POEMS}/${poemId}`,
                config: mockContext.config,
                data: mockPoemData,
                dispatch,
                options: undefined,
                callbacks: mockCallbacks
            })
            expect(spy).toHaveBeenCalledTimes(1)

            spy.mockRestore()
        })

        test('should include poem data in patchAction call', () => {
            const spy = jest.spyOn(commonActions, 'patchAction')
            const poemId = 'poem-456'
            const customPoemData = {
                ...mockPoemData,
                title: 'Different Title'
            }

            savePoemAction({
                params: { poemId },
                data: customPoemData,
                context: mockContext,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: customPoemData
                })
            )

            spy.mockRestore()
        })

        test('should include authorization config from context', () => {
            const spy = jest.spyOn(commonActions, 'patchAction')
            const poemId = 'poem-789'

            savePoemAction({
                params: { poemId },
                data: mockPoemData,
                context: mockContext,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    config: mockContext.config
                })
            )

            spy.mockRestore()
        })

        test('should call patchAction with options when provided', () => {
            const spy = jest.spyOn(commonActions, 'patchAction')
            const poemId = 'poem-101'
            const options = { fetch: true, reset: false }

            savePoemAction({
                params: { poemId },
                data: mockPoemData,
                context: mockContext,
                options,
                callbacks: mockCallbacks
            })(dispatch)

            expect(spy).toHaveBeenCalledWith(
                expect.objectContaining({
                    options
                })
            )

            spy.mockRestore()
        })

        test('should return a function', () => {
            const result = savePoemAction({
                params: { poemId: 'poem-123' },
                data: mockPoemData,
                context: mockContext,
                callbacks: mockCallbacks
            })

            expect(typeof result).toBe('function')
        })
    })
})
