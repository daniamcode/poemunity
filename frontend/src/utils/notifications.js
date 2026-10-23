import toast from 'react-hot-toast'

export function manageWarning(message) {
    toast(message, { icon: '⚠️' })
}

export function manageError(messageOrError) {
    const message = typeof messageOrError === 'string'
        ? messageOrError
        : messageOrError?.response?.data?.error
            || messageOrError?.message
            || 'An unexpected error occurred'
    toast.error(message)
}

export function manageSuccess(message) {
    toast.success(message)
}

// The Redux thunks hand their error callbacks the RESPONSE BODY (commonActions
// passes `error?.response?.data || error`), so the server's own message — the
// EMAIL_UNVERIFIED one and the rate-limit texts — sits at `.error`, which is
// NOT where manageError's axios-error branch looks. Raw-axios callers may still
// pass a full AxiosError, so both shapes are read here. Anything else gets the
// caller's fallback: the point is that the server's words replace the generic
// one, not that every error becomes interesting.
export function manageServerError(errorData, fallback) {
    const message = errorData?.error ?? errorData?.response?.data?.error
    manageError(typeof message === 'string' ? message : fallback)
}
