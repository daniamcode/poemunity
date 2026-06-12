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
