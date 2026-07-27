import toast from 'react-hot-toast'
import { manageError, manageSuccess, manageWarning } from './notifications'

// react-hot-toast's default export is a callable with .error/.success methods.
jest.mock('react-hot-toast', () => {
    const toast = jest.fn()
    toast.error = jest.fn()
    toast.success = jest.fn()
    return { __esModule: true, default: toast }
})

describe('notifications', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('manageError never surfaces "[object Object]"', () => {
        test('a plain string is shown verbatim', () => {
            manageError('Failed to post comment')
            expect(toast.error).toHaveBeenCalledWith('Failed to post comment')
        })

        test('an axios-style error uses response.data.error', () => {
            manageError({ response: { data: { error: 'This username already exists' } } })
            expect(toast.error).toHaveBeenCalledWith('This username already exists')
        })

        test('an Error object falls back to its message', () => {
            manageError(new Error('Network Error'))
            expect(toast.error).toHaveBeenCalledWith('Network Error')
        })

        // This is the case the TODO called out: Redux actions (commonActions.ts)
        // pass the raw error object. If it has no readable field we must show a
        // generic string, never the stringified object.
        test('an opaque object with no message uses the generic fallback', () => {
            manageError({ someInternalField: 42 })
            expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred')
        })

        test('null / undefined use the generic fallback', () => {
            manageError(null)
            manageError(undefined)
            expect(toast.error).toHaveBeenCalledTimes(2)
            expect(toast.error).toHaveBeenNthCalledWith(1, 'An unexpected error occurred')
            expect(toast.error).toHaveBeenNthCalledWith(2, 'An unexpected error occurred')
        })

        test('every message passed to toast.error is a string, never "[object Object]"', () => {
            const inputs = [
                'plain string',
                { response: { data: { error: 'server said no' } } },
                new Error('boom'),
                { nothing: 'useful' },
                null,
                undefined
            ]
            inputs.forEach(input => manageError(input))
            toast.error.mock.calls.forEach(([arg]) => {
                expect(typeof arg).toBe('string')
                expect(arg).not.toBe('[object Object]')
            })
        })
    })

    test('manageSuccess forwards to toast.success', () => {
        manageSuccess('Poem deleted')
        expect(toast.success).toHaveBeenCalledWith('Poem deleted')
    })

    test('manageWarning shows a warning toast', () => {
        manageWarning('Heads up')
        expect(toast).toHaveBeenCalledWith('Heads up', { icon: '⚠️' })
    })
})
