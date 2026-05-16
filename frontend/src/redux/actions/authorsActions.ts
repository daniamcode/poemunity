import { getAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/authorsReducers'
import { AppDispatch } from '../store'
import { ReduxOptions, ReduxCallbacks } from '../../typescript/interfaces'

interface GetTopAuthorsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getTopAuthorsAction({ params, options, callbacks }: GetTopAuthorsActionProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.TOP_AUTHORS,
            url: API_ENDPOINTS.AUTHORS,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

interface GetAuthorsByLetterActionProps {
    letter: string
    origin?: string
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getAuthorsByLetterAction({ letter, origin, options, callbacks }: GetAuthorsByLetterActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.AUTHORS_BY_LETTER,
            url: API_ENDPOINTS.AUTHORS,
            dispatch,
            params: { letter, ...(origin && origin !== 'all' ? { type: origin } : {}) },
            options,
            callbacks
        })
    }
}

interface GetAuthorsLettersActionProps {
    origin?: string
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getAuthorsLettersAction({ origin, options, callbacks }: GetAuthorsLettersActionProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.AUTHORS_LETTERS,
            url: API_ENDPOINTS.AUTHORS_LETTERS,
            dispatch,
            params: origin && origin !== 'all' ? { type: origin } : undefined,
            options,
            callbacks
        })
    }
}
