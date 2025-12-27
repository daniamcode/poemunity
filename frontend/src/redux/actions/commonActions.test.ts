/* eslint-disable max-lines */
import axios from 'axios'
import { getTypes, getAction, postAction, putAction, deleteAction, patchAction } from './commonActions'
import { AppDispatch } from '../store'

jest.mock('../../utils/notifications')

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

jest.mock('../../utils/notifications')

const mockGet = (axios as any).__mockGet
const mockPost = (axios as any).__mockPost
const mockPut = (axios as any).__mockPut
const mockDelete = (axios as any).__mockDelete
const mockPatch = (axios as any).__mockPatch

describe('commonActions', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    describe('getTypes', () => {
        test('should return correct action types', () => {
            const result = getTypes('TEST_ACTION')

            expect(result).toEqual({
                requestAction: 'TEST_ACTION_request',
                fulfilledAction: 'TEST_ACTION_fulfilled',
                rejectedAction: 'TEST_ACTION_rejected',
                resetAction: 'TEST_ACTION_reset'
            })
        })

        test('should handle undefined baseType', () => {
            const result = getTypes(undefined)

            expect(result).toEqual({
                requestAction: 'undefined_request',
                fulfilledAction: 'undefined_fulfilled',
                rejectedAction: 'undefined_rejected',
                resetAction: 'undefined_reset'
            })
        })

        test('should work with different action names', () => {
            const result = getTypes('FETCH_USER')

            expect(result.requestAction).toBe('FETCH_USER_request')
            expect(result.fulfilledAction).toBe('FETCH_USER_fulfilled')
            expect(result.rejectedAction).toBe('FETCH_USER_rejected')
            expect(result.resetAction).toBe('FETCH_USER_reset')
        })
    })

    describe('getAction', () => {
        const mockCallbacks = {
            success: jest.fn(),
            error: jest.fn(),
            reset: jest.fn()
        }

        beforeEach(() => {
            mockCallbacks.success.mockClear()
            mockCallbacks.error.mockClear()
            mockCallbacks.reset.mockClear()
        })

        test('should dispatch request and fulfilled actions on successful GET request', async () => {
            const mockData = { id: '1', name: 'Test' }
            mockGet.mockResolvedValue({ data: mockData })

            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'TEST_ACTION_request' })
            expect(dispatch).toHaveBeenCalledWith({
                type: 'TEST_ACTION_fulfilled',
                payload: mockData
            })
            expect(mockCallbacks.success).toHaveBeenCalledWith(mockData)
        })

        test('should dispatch request and rejected actions on failed GET request', async () => {
            const mockError = {
                response: {
                    data: { message: 'Error occurred' }
                }
            }
            mockGet.mockRejectedValue(mockError)

            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'TEST_ACTION_request' })
            expect(dispatch).toHaveBeenCalledWith({
                type: 'TEST_ACTION_rejected',
                payload: mockError.response.data
            })
            expect(mockCallbacks.error).toHaveBeenCalledWith(mockError.response.data)
        })

        test('should dispatch reset action when options.reset is true', () => {
            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                dispatch,
                options: { reset: true },
                callbacks: mockCallbacks
            })

            expect(dispatch).toHaveBeenCalledWith({ type: 'TEST_ACTION_reset' })
            expect(mockCallbacks.reset).toHaveBeenCalled()
        })

        test('should not dispatch request action when options.fetch is false', () => {
            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                dispatch,
                options: { fetch: false }
            })

            expect(dispatch).not.toHaveBeenCalledWith({ type: 'TEST_ACTION_request' })
        })

        test('should transform response data when transformResponse is provided', async () => {
            const mockData = { value: 10 }
            const transformedData = { value: 20 }
            mockGet.mockResolvedValue({ data: mockData })

            const transformResponse = jest.fn(() => transformedData)

            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                dispatch,
                options: { transformResponse },
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(transformResponse).toHaveBeenCalledWith(mockData)
            expect(dispatch).toHaveBeenCalledWith({
                type: 'TEST_ACTION_fulfilled',
                payload: transformedData
            })
            expect(mockCallbacks.success).toHaveBeenCalledWith(transformedData)
        })

        test('should include params in GET request', () => {
            const params = { page: 1, limit: 10 }

            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                params,
                dispatch
            })

            expect(mockGet).toHaveBeenCalledWith('/test', { params })
        })

        test('should handle network error without response', async () => {
            const mockError = new Error('Network Error')
            mockGet.mockRejectedValue(mockError)

            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({
                type: 'TEST_ACTION_rejected',
                payload: mockError
            })
            expect(mockCallbacks.error).toHaveBeenCalledWith(mockError)
        })

        test('should pass extraConfig to API instance', () => {
            const extraConfig = { timeout: 5000 }

            getAction({
                type: 'TEST_ACTION',
                url: '/test',
                dispatch,
                extraConfig
            })

            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    timeout: 5000
                })
            )
        })
    })

    describe('postAction', () => {
        const mockCallbacks = {
            success: jest.fn(),
            error: jest.fn(),
            reset: jest.fn()
        }

        beforeEach(() => {
            mockCallbacks.success.mockClear()
            mockCallbacks.error.mockClear()
            mockCallbacks.reset.mockClear()
        })

        test('should dispatch request and fulfilled actions on successful POST request', async () => {
            const mockData = { id: '1', name: 'Created' }
            const requestData = { name: 'New Item' }
            mockPost.mockResolvedValue({ data: mockData })

            postAction({
                type: 'CREATE_ACTION',
                url: '/create',
                data: requestData,
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'CREATE_ACTION_request' })
            expect(mockPost).toHaveBeenCalledWith('/create', requestData)
            expect(dispatch).toHaveBeenCalledWith({
                type: 'CREATE_ACTION_fulfilled',
                payload: mockData
            })
            expect(mockCallbacks.success).toHaveBeenCalledWith(mockData)
        })

        test('should dispatch request and rejected actions on failed POST request', async () => {
            const mockError = {
                response: {
                    data: { message: 'Validation error' },
                    status: 400,
                    statusText: 'Bad Request'
                }
            }
            mockPost.mockRejectedValue(mockError)

            postAction({
                type: 'CREATE_ACTION',
                url: '/create',
                data: {},
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'CREATE_ACTION_request' })
            expect(dispatch).toHaveBeenCalledWith({
                type: 'CREATE_ACTION_rejected',
                payload: mockError.response.data
            })
            expect(mockCallbacks.error).toHaveBeenCalledWith(mockError.response.data)
        })

        test('should dispatch reset action when options.reset is true', () => {
            postAction({
                type: 'CREATE_ACTION',
                url: '/create',
                data: {},
                dispatch,
                options: { reset: true },
                callbacks: mockCallbacks
            })

            expect(dispatch).toHaveBeenCalledWith({ type: 'CREATE_ACTION_reset' })
            expect(mockCallbacks.reset).toHaveBeenCalled()
        })

        test('should not dispatch request action when options.fetch is false', () => {
            postAction({
                type: 'CREATE_ACTION',
                url: '/create',
                data: {},
                dispatch,
                options: { fetch: false }
            })

            expect(dispatch).not.toHaveBeenCalledWith({ type: 'CREATE_ACTION_request' })
        })

        test('should include custom headers', () => {
            const headers = { 'Custom-Header': 'value' }
            const data = { name: 'Test' }

            postAction({
                type: 'CREATE_ACTION',
                url: '/create',
                data,
                dispatch,
                headers
            })

            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Custom-Header': 'value'
                    })
                })
            )
        })

        test('should handle error without response data', async () => {
            const mockError = {
                message: 'Network Error'
            }
            mockPost.mockRejectedValue(mockError)

            postAction({
                type: 'CREATE_ACTION',
                url: '/create',
                data: {},
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({
                type: 'CREATE_ACTION_rejected',
                payload: expect.objectContaining({
                    message: 'Network Error'
                })
            })
        })

        test('should pass config to API instance', () => {
            const config = { withCredentials: true }
            const data = { name: 'Test' }

            postAction({
                type: 'CREATE_ACTION',
                url: '/create',
                data,
                dispatch,
                config
            })

            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    withCredentials: true
                })
            )
        })
    })

    describe('putAction', () => {
        const mockCallbacks = {
            success: jest.fn(),
            error: jest.fn(),
            reset: jest.fn()
        }

        beforeEach(() => {
            mockCallbacks.success.mockClear()
            mockCallbacks.error.mockClear()
            mockCallbacks.reset.mockClear()
        })

        test('should dispatch request and fulfilled actions on successful PUT request', async () => {
            const mockData = { id: '1', name: 'Updated' }
            const requestData = { name: 'Updated Item' }
            const config = { headers: { Authorization: 'Bearer token' } }
            mockPut.mockResolvedValue({ data: mockData })

            putAction({
                type: 'UPDATE_ACTION',
                url: '/update/1',
                data: requestData,
                dispatch,
                config,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_ACTION_request' })
            expect(mockPut).toHaveBeenCalledWith('/update/1', requestData, config)
            expect(dispatch).toHaveBeenCalledWith({
                type: 'UPDATE_ACTION_fulfilled',
                payload: mockData
            })
            expect(mockCallbacks.success).toHaveBeenCalledWith(mockData)
        })

        test('should dispatch request and rejected actions on failed PUT request', async () => {
            const mockError = {
                response: {
                    data: { message: 'Not found' },
                    status: 404,
                    statusText: 'Not Found'
                }
            }
            mockPut.mockRejectedValue(mockError)

            putAction({
                type: 'UPDATE_ACTION',
                url: '/update/1',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_ACTION_request' })
            expect(dispatch).toHaveBeenCalledWith({
                type: 'UPDATE_ACTION_rejected',
                payload: mockError.response.data
            })
            expect(mockCallbacks.error).toHaveBeenCalledWith(mockError.response.data)
        })

        test('should dispatch reset action when options.reset is true', () => {
            putAction({
                type: 'UPDATE_ACTION',
                url: '/update/1',
                dispatch,
                options: { reset: true },
                callbacks: mockCallbacks
            })

            expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_ACTION_reset' })
            expect(mockCallbacks.reset).toHaveBeenCalled()
        })

        test('should always dispatch request action even when fetch is true', () => {
            putAction({
                type: 'UPDATE_ACTION',
                url: '/update/1',
                dispatch,
                options: { fetch: true }
            })

            expect(dispatch).toHaveBeenCalledWith({ type: 'UPDATE_ACTION_request' })
        })

        test('should handle error without response data', async () => {
            const mockError = {
                message: 'Connection timeout'
            }
            mockPut.mockRejectedValue(mockError)

            putAction({
                type: 'UPDATE_ACTION',
                url: '/update/1',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({
                type: 'UPDATE_ACTION_rejected',
                payload: expect.objectContaining({
                    message: 'Connection timeout'
                })
            })
        })
    })

    describe('deleteAction', () => {
        const mockCallbacks = {
            success: jest.fn(),
            error: jest.fn(),
            reset: jest.fn()
        }

        beforeEach(() => {
            mockCallbacks.success.mockClear()
            mockCallbacks.error.mockClear()
            mockCallbacks.reset.mockClear()
        })

        test('should dispatch request and fulfilled actions on successful DELETE request', async () => {
            const mockData = { success: true }
            mockDelete.mockResolvedValue({ data: mockData })

            deleteAction({
                type: 'DELETE_ACTION',
                url: '/delete/1',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_ACTION_request' })
            expect(mockDelete).toHaveBeenCalledWith('/delete/1', undefined)
            expect(dispatch).toHaveBeenCalledWith({
                type: 'DELETE_ACTION_fulfilled',
                payload: mockData
            })
            expect(mockCallbacks.success).toHaveBeenCalledWith(mockData)
        })

        test('should dispatch request and rejected actions on failed DELETE request', async () => {
            const mockError = {
                response: {
                    data: { message: 'Forbidden' },
                    status: 403,
                    statusText: 'Forbidden'
                }
            }
            mockDelete.mockRejectedValue(mockError)

            deleteAction({
                type: 'DELETE_ACTION',
                url: '/delete/1',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_ACTION_request' })
            expect(dispatch).toHaveBeenCalledWith({
                type: 'DELETE_ACTION_rejected',
                payload: mockError.response.data
            })
            expect(mockCallbacks.error).toHaveBeenCalledWith(mockError.response.data)
        })

        test('should dispatch reset action when options.reset is true', () => {
            deleteAction({
                type: 'DELETE_ACTION',
                url: '/delete/1',
                dispatch,
                options: { reset: true },
                callbacks: mockCallbacks
            })

            expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_ACTION_reset' })
            expect(mockCallbacks.reset).toHaveBeenCalled()
        })

        test('should not dispatch request action when options.fetch is false', () => {
            deleteAction({
                type: 'DELETE_ACTION',
                url: '/delete/1',
                dispatch,
                options: { fetch: false }
            })

            expect(dispatch).not.toHaveBeenCalledWith({ type: 'DELETE_ACTION_request' })
        })

        test('should include custom headers and config', () => {
            const headers = { Authorization: 'Bearer token' }
            const config = { timeout: 3000 }

            deleteAction({
                type: 'DELETE_ACTION',
                url: '/delete/1',
                dispatch,
                headers,
                config
            })

            expect(axios.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer token'
                    }),
                    timeout: 3000
                })
            )
        })
    })

    describe('patchAction', () => {
        const mockCallbacks = {
            success: jest.fn(),
            error: jest.fn(),
            reset: jest.fn()
        }

        beforeEach(() => {
            mockCallbacks.success.mockClear()
            mockCallbacks.error.mockClear()
            mockCallbacks.reset.mockClear()
        })

        test('should dispatch request and fulfilled actions on successful PATCH request', async () => {
            const mockData = { id: '1', name: 'Patched' }
            const requestData = { name: 'Patched Item' }
            const config = { headers: { Authorization: 'Bearer token' } }
            mockPatch.mockResolvedValue({ data: mockData })

            patchAction({
                type: 'PATCH_ACTION',
                url: '/patch/1',
                data: requestData,
                dispatch,
                config,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'PATCH_ACTION_request' })
            expect(mockPatch).toHaveBeenCalledWith('/patch/1', requestData, config)
            expect(dispatch).toHaveBeenCalledWith({
                type: 'PATCH_ACTION_fulfilled',
                payload: mockData
            })
            expect(mockCallbacks.success).toHaveBeenCalledWith(mockData)
        })

        test('should dispatch request and rejected actions on failed PATCH request', async () => {
            const mockError = {
                response: {
                    data: { message: 'Conflict' },
                    status: 409,
                    statusText: 'Conflict'
                }
            }
            mockPatch.mockRejectedValue(mockError)

            patchAction({
                type: 'PATCH_ACTION',
                url: '/patch/1',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({ type: 'PATCH_ACTION_request' })
            expect(dispatch).toHaveBeenCalledWith({
                type: 'PATCH_ACTION_rejected',
                payload: mockError.response.data
            })
            expect(mockCallbacks.error).toHaveBeenCalledWith(mockError.response.data)
        })

        test('should dispatch reset action when options.reset is true', () => {
            patchAction({
                type: 'PATCH_ACTION',
                url: '/patch/1',
                dispatch,
                options: { reset: true },
                callbacks: mockCallbacks
            })

            expect(dispatch).toHaveBeenCalledWith({ type: 'PATCH_ACTION_reset' })
            expect(mockCallbacks.reset).toHaveBeenCalled()
        })

        test('should always dispatch request action even when fetch is true', () => {
            patchAction({
                type: 'PATCH_ACTION',
                url: '/patch/1',
                dispatch,
                options: { fetch: true }
            })

            expect(dispatch).toHaveBeenCalledWith({ type: 'PATCH_ACTION_request' })
        })

        test('should handle error without response data', async () => {
            const mockError = {
                message: 'Server error'
            }
            mockPatch.mockRejectedValue(mockError)

            patchAction({
                type: 'PATCH_ACTION',
                url: '/patch/1',
                dispatch,
                callbacks: mockCallbacks
            })

            await new Promise(resolve => setTimeout(resolve, 10))

            expect(dispatch).toHaveBeenCalledWith({
                type: 'PATCH_ACTION_rejected',
                payload: expect.objectContaining({
                    message: 'Server error'
                })
            })
        })
    })
})
