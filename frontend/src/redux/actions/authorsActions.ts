import { getAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/authorsReducers'
import { AppDispatch } from '../store'
import { ReduxOptions, ReduxCallbacks, Author } from '../../typescript/interfaces'
import { authorsUpserted, AuthorEntity } from '../reducers/authorEntitiesReducers'

// Seed the normalized authorEntities store from an /authors list fetch, so that
// name/picture/slug have a single source of truth. Later renames (authorUpdated)
// then propagate to every list that resolves through the entity store.
function seedAuthorEntities(dispatch: AppDispatch, responseData: unknown): void {
    const authors = (Array.isArray(responseData) ? responseData : []) as Author[]
    const entities: AuthorEntity[] = authors
        .filter(author => author && author.id)
        .map(author => ({
            id: author.id as string,
            name: author.name,
            picture: author.picture,
            slug: author.slug,
            type: author.type
        }))

    if (entities.length > 0) {
        dispatch(authorsUpserted(entities))
    }
}

function withAuthorEntitySeeding(dispatch: AppDispatch, callbacks?: ReduxCallbacks): ReduxCallbacks {
    return {
        ...callbacks,
        success: (responseData: unknown) => {
            seedAuthorEntities(dispatch, responseData)
            callbacks?.success?.(responseData)
        }
    }
}

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
            callbacks: withAuthorEntitySeeding(dispatch, callbacks)
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
            callbacks: withAuthorEntitySeeding(dispatch, callbacks)
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
