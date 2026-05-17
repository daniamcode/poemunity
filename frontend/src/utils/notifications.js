import toast from 'react-hot-toast'

export function manageWarning(message) {
    toast(message, { icon: '⚠️' })
}

export function manageError(message) {
    toast.error(message)
}

export function manageSuccess(message) {
    toast.success(message)
}
