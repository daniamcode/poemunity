import toast from 'react-hot-toast'
import { manageError, manageServerError, manageSuccess, manageWarning } from './notifications'

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

    describe('manageServerError prefers the SERVER message over the fallback', () => {
        // The thunks hand their error callbacks the RESPONSE BODY, so the
        // server's words live at `.error` — which is not where manageError's
        // axios-error branch looks. Without this helper the 403
        // EMAIL_UNVERIFIED and the rate-limit texts all collapsed into the
        // generic fallback at every call site.
        test('a thunk-style body uses its message', () => {
            manageServerError(
                { error: 'Please verify your email address before liking.' },
                'generic fallback'
            )
            expect(toast.error).toHaveBeenCalledWith('Please verify your email address before liking.')
        })

        test('a rate-limit body surfaces its own text, not the fallback', () => {
            manageServerError(
                { error: 'Too many likes, please try again later' },
                'generic fallback'
            )
            expect(toast.error).toHaveBeenCalledWith('Too many likes, please try again later')
        })

        test('a raw axios-style error is read through response.data.error', () => {
            manageServerError(
                { response: { data: { error: 'This username already exists' } } },
                'generic fallback'
            )
            expect(toast.error).toHaveBeenCalledWith('This username already exists')
        })

        test('a body with a non-string error uses the fallback — never "[object Object]"', () => {
            manageServerError({ error: { nested: true } }, 'generic fallback')
            expect(toast.error).toHaveBeenCalledWith('generic fallback')
        })

        test('network failures and empty bodies use the fallback', () => {
            manageServerError(new Error('Network Error'), 'generic fallback')
            manageServerError(undefined, 'generic fallback')
            manageServerError(null, 'generic fallback')
            expect(toast.error).toHaveBeenCalledTimes(3)
            expect(toast.error).toHaveBeenNthCalledWith(1, 'generic fallback')
            expect(toast.error).toHaveBeenNthCalledWith(2, 'generic fallback')
            expect(toast.error).toHaveBeenNthCalledWith(3, 'generic fallback')
        })
    })

    test('manageWarning shows a warning toast', () => {
        manageWarning('Heads up')
        expect(toast).toHaveBeenCalledWith('Heads up', { icon: '⚠️' })
    })
})
