import { getAction, putAction, patchAction, deleteAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/poemReducers'
import { ReduxOptions, ReduxCallbacks, Context, Poem } from '../../typescript/interfaces'
import { AppDispatch } from '../store'
import { poemUpserted } from '../reducers/poemEntitiesReducers'
import { authorUpserted } from '../reducers/authorEntitiesReducers'

interface getPoemActionProps {
    params?: {
        poemId: string
    }
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

// Seed the normalized poem + author stores from a single-poem fetch so that the
// entity exists as the source of truth (a later like/save mutates it in place).
function seedStoresFromPoem(dispatch: AppDispatch, responseData: unknown): void {
    const poem = responseData as Poem | null | undefined
    if (!poem || !poem.id) {
        return
    }
    dispatch(poemUpserted(poem))
    if (poem.userId) {
        dispatch(
            authorUpserted({
                id: poem.userId,
                name: poem.author,
                picture: poem.picture,
                slug: poem.authorSlug,
                type: poem.authorType
            })
        )
    }
}

export function getPoemAction({ params, options, callbacks }: getPoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.POEM,
            url: `${API_ENDPOINTS.POEM}/${params?.poemId}`,
            dispatch,
            options,
            callbacks: {
                ...callbacks,
                success: (responseData: unknown) => {
                    seedStoresFromPoem(dispatch, responseData)
                    callbacks?.success?.(responseData)
                }
            }
        })
    }
}

interface likePoemActionProps {
    params: {
        poemId: string
    }
    context: Context
    options?: ReduxOptions
    callbacks: ReduxCallbacks
}

export function likePoemAction({ params, context, options, callbacks }: likePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return putAction({
            type: ACTIONS.LIKE_POEM,
            url: `${API_ENDPOINTS.POEM}/${params.poemId}`,
            // context.config carries auth request options, usually cookie credentials
            config: context.config,
            dispatch,
            options,
            callbacks
        })
    }
}

interface deletePoemActionProps {
    params: {
        poemId: string
    }
    context: Context
    options?: ReduxOptions
    callbacks: ReduxCallbacks
}

export function deletePoemAction({ params, context, options, callbacks }: deletePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return deleteAction({
            type: ACTIONS.DELETE_POEM,
            url: `${API_ENDPOINTS.POEM}/${params.poemId}`,
            // context.config carries auth request options, usually cookie credentials
            config: context.config,
            dispatch,
            options,
            callbacks
        })
    }
}

interface savePoemActionProps {
    params: {
        poemId: string
    }
    // Partial: the same PATCH route is how a poem is published or withdrawn,
    // and that sends nothing but `{ status }`.
    data: Partial<Poem>
    context: Context
    options?: ReduxOptions
    callbacks: ReduxCallbacks
}

export function savePoemAction({ params, context, data, options, callbacks }: savePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return patchAction({
            type: ACTIONS.SAVE_POEM,
            url: `${API_ENDPOINTS.POEM}/${params.poemId}`,
            // context.config carries auth request options, usually cookie credentials
            config: context.config,
            data,
            dispatch,
            options,
            callbacks
        })
    }
}
