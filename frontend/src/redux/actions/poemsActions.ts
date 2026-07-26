/* eslint-disable no-console */
import store from '../store/index'
import { getAction, getTypes, postAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/poemsReducers'
import { AppDispatch, RootState } from '../store'
import { ReduxOptions, ReduxCallbacks, Poem } from '../../typescript/interfaces'
import { authorsUpserted, AuthorEntity } from '../reducers/authorEntitiesReducers'
import { poemsUpserted, poemUpserted } from '../reducers/poemEntitiesReducers'

// Extract the poems array from either fulfilled payload shape: a plain Poem[]
// (RANKING) or a paginated { poems, ... } object (the rest).
function extractPoems(responseData: unknown): Poem[] {
    const payload = responseData as Poem[] | { poems?: Poem[] } | null | undefined
    const poems: Poem[] | undefined = Array.isArray(payload) ? payload : payload?.poems
    return Array.isArray(poems) ? poems : []
}

// Seed the normalized stores from a poem fetch: the full poems into poemEntities
// (single source of truth) and their denormalized authors into authorEntities.
function seedStoresFromPoemsPayload(dispatch: AppDispatch, responseData: unknown): void {
    const poems = extractPoems(responseData)
    if (poems.length === 0) {
        return
    }

    dispatch(poemsUpserted(poems))

    const authors: AuthorEntity[] = poems
        .filter((poem: Poem) => poem && poem.userId)
        .map((poem: Poem) => ({
            id: poem.userId,
            name: poem.author,
            picture: poem.picture,
            slug: poem.authorSlug,
            type: poem.authorType
        }))

    if (authors.length > 0) {
        dispatch(authorsUpserted(authors))
    }
}

// Wrap a caller's callbacks so that, on a successful poem fetch, we also seed the
// normalized poem + author stores before invoking the caller's own success handler.
function withAuthorSeeding(dispatch: AppDispatch, callbacks?: ReduxCallbacks): ReduxCallbacks {
    return {
        ...callbacks,
        success: (responseData: unknown) => {
            seedStoresFromPoemsPayload(dispatch, responseData)
            callbacks?.success?.(responseData)
        }
    }
}

interface GetPoemsListActionProps {
    params?: object | null
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getPoemsListAction({ params, options, callbacks }: GetPoemsListActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.POEMS_LIST,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

interface GetRankingActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

// Ranking is computed server-side (see backend GET /poems/ranking): the response
// is a ready-to-render RankItem[], so there is no poem/author seeding to do here.
export function getRankingAction({ params, options, callbacks }: GetRankingActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.RANKING,
            url: API_ENDPOINTS.POEMS_RANKING,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

interface GetMyPoemsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getMyPoemsAction({ params, options, callbacks }: GetMyPoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

interface GetMyFavouritePoemsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getMyFavouritePoemsAction({ params, options, callbacks }: GetMyFavouritePoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_FAVOURITE_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

interface GetAuthorPoemsActionProps {
    params?: object | null
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getAuthorPoemsAction({ params, options, callbacks }: GetAuthorPoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.AUTHOR_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

interface CreatePoemActionProps {
    poem: Poem
    callbacks?: ReduxCallbacks
    context: { config: object }
    options?: ReduxOptions
}

export function createPoemAction({ poem, context, callbacks, options = {} }: CreatePoemActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.CREATE_POEM,
            url: `${API_ENDPOINTS.POEMS}`,
            dispatch,
            data: poem,
            callbacks,
            config: context.config,
            options
        })
    }
}

// ---------------------------------------------------------------------------
// Cache-list maintenance after a mutation.
//
// Because every list cache now stores poem ids that resolve through the single
// poemEntities store, a like or an edit needs NO per-cache patching: mutate the
// one entity (poemUpdated) and every view re-reads it. What the id-lists still
// own is membership + counts, so the only cache maintenance left is:
//   - create: insert the new poem's id (and upsert the entity)
//   - delete: drop the id from every list (poemRemoved handles the entity)
//   - unlike from the "my favourites" view: that filtered list must drop the id
// This is the complete replacement for the old updateXCacheAfterY family.
// ---------------------------------------------------------------------------

function idOf(entry: Poem | string): string {
    return typeof entry === 'string' ? entry : entry?.id
}

const PAGINATED_CACHES: { actionType: string; key: keyof RootState }[] = [
    { actionType: ACTIONS.POEMS_LIST, key: 'poemsListQuery' },
    { actionType: ACTIONS.MY_POEMS, key: 'myPoemsQuery' },
    { actionType: ACTIONS.MY_FAVOURITE_POEMS, key: 'myFavouritePoemsQuery' },
    { actionType: ACTIONS.AUTHOR_POEMS, key: 'authorPoemsQuery' }
]

// Re-emit a paginated cache's fulfilled action with an explicit id-array so the
// reducer's cache-update path (same page, length <=) replaces in place.
function emitPaginated(dispatch: AppDispatch, actionType: string, cache: any, ids: string[], total?: number) {
    const { fulfilledAction } = getTypes(actionType)
    dispatch({
        type: fulfilledAction,
        payload: {
            poems: ids,
            page: cache.page,
            hasMore: cache.hasMore,
            total: total !== undefined ? total : cache.total,
            totalPages: cache.totalPages
        }
    })
}

interface DropPoemFromCachesProps {
    poemId: string
}

// Delete: drop the poem id from every list cache (decrementing paginated totals).
// The entity itself is removed separately via poemRemoved.
export function dropPoemFromCaches({ poemId }: DropPoemFromCachesProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const state = store.getState() as RootState

        PAGINATED_CACHES.forEach(({ actionType, key }) => {
            const cache = state[key] as any
            if (!Array.isArray(cache?.item)) {
                return
            }
            const kept = (cache.item as (Poem | string)[]).map(idOf).filter(id => id !== poemId)
            if (kept.length === cache.item.length) {
                return
            }
            emitPaginated(dispatch, actionType, cache, kept, Math.max(0, (cache.total || 0) - 1))
        })
    }
}

interface DropPoemFromFavouritesCacheProps {
    poemId: string
}

// Unliking from the "my favourites" view: that list only shows poems the user
// has liked, so a now-unliked poem must leave it (and drop the total by one).
export function dropPoemFromFavouritesCache({ poemId }: DropPoemFromFavouritesCacheProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { myFavouritePoemsQuery } = store.getState() as RootState
        const cache = myFavouritePoemsQuery as any
        if (!Array.isArray(cache?.item)) {
            return
        }
        const kept = (cache.item as (Poem | string)[]).map(idOf).filter(id => id !== poemId)
        if (kept.length === cache.item.length) {
            return
        }
        emitPaginated(dispatch, ACTIONS.MY_FAVOURITE_POEMS, cache, kept, Math.max(0, (cache.total || 0) - 1))
    }
}

interface InsertPoemIntoCachesProps {
    response: Poem
}

// Create: register the new poem as an entity and insert its id at the front of
// the user-facing paginated lists, bumping their totals. (Ranking is computed
// server-side now, so it refreshes on its next fetch rather than being patched.)
export function insertPoemIntoCaches({ response }: InsertPoemIntoCachesProps) {
    return function dispatcher(dispatch: AppDispatch) {
        if (!response?.id) {
            return
        }
        dispatch(poemUpserted(response))

        const state = store.getState() as RootState
        const poemId = response.id

        const insertFront = (actionType: string, cache: any) => {
            if (!Array.isArray(cache?.item)) {
                return
            }
            const ids = (cache.item as (Poem | string)[]).map(idOf).filter(id => id !== poemId)
            emitPaginated(dispatch, actionType, cache, [poemId, ...ids], (cache.total || 0) + 1)
        }

        insertFront(ACTIONS.POEMS_LIST, (state as any).poemsListQuery)
        insertFront(ACTIONS.MY_POEMS, (state as any).myPoemsQuery)
    }
}
