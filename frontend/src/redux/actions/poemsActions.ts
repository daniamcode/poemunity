/* eslint-disable no-console */
import store from '../store/index'
import { getAction, getTypes, postAction } from './commonActions'
import { removeFromCache, insertIntoCacheFront } from './poemCacheMembership'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/poemsReducers'
import { AppDispatch, RootState } from '../store'
import { ReduxOptions, ReduxCallbacks, Poem } from '../../typescript/interfaces'
import { authorsUpserted, AuthorEntity } from '../reducers/authorEntitiesReducers'
import { poemsUpserted, poemUpserted } from '../reducers/poemEntitiesReducers'
import { RankItem } from '../../utils/getRanking'

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
    signal?: AbortSignal
}

export function getPoemsListAction({ params, options, callbacks, signal }: GetPoemsListActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.POEMS_LIST,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            signal,
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

// One read, no params: the server owns the pick entirely, so there is nothing
// for the client to pass or recompute.
export function getPoemOfTheWeekAction() {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.POEM_OF_THE_WEEK,
            url: API_ENDPOINTS.POEM_OF_THE_WEEK,
            dispatch
        })
    }
}

interface GetMyPoemsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
    signal?: AbortSignal
}

export function getMyPoemsAction({ params, options, callbacks, signal }: GetMyPoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            signal,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

interface GetMyFavouritePoemsActionProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
    signal?: AbortSignal
}

export function getMyFavouritePoemsAction({ params, options, callbacks, signal }: GetMyFavouritePoemsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_FAVOURITE_POEMS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params,
            options,
            signal,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

interface GetMyDraftsActionProps {
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
    signal?: AbortSignal
    params?: object
}

// The Drafts tab. `status=draft` is scoped by the SESSION on the server, never
// by a userId param — so this deliberately sends no author of its own.
export function getMyDraftsAction({ params, options, callbacks, signal }: GetMyDraftsActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_DRAFTS,
            url: API_ENDPOINTS.POEMS,
            dispatch,
            params: { ...params, status: 'draft' },
            options,
            signal,
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

const PAGINATED_CACHES: { actionType: string; key: keyof RootState }[] = [
    { actionType: ACTIONS.POEMS_LIST, key: 'poemsListQuery' },
    { actionType: ACTIONS.MY_POEMS, key: 'myPoemsQuery' },
    { actionType: ACTIONS.MY_FAVOURITE_POEMS, key: 'myFavouritePoemsQuery' },
    { actionType: ACTIONS.AUTHOR_POEMS, key: 'authorPoemsQuery' },
    // Drafts belong here too: deleting a draft must drop it from its own list.
    { actionType: ACTIONS.MY_DRAFTS, key: 'myDraftsQuery' }
]

// The public lists a poem joins when it is published and leaves when it is
// withdrawn. Author poems is included because the owner may be looking at their
// own public author page.
const PUBLIC_CACHES: { actionType: string; key: keyof RootState }[] = [
    { actionType: ACTIONS.POEMS_LIST, key: 'poemsListQuery' },
    { actionType: ACTIONS.MY_POEMS, key: 'myPoemsQuery' },
    { actionType: ACTIONS.AUTHOR_POEMS, key: 'authorPoemsQuery' }
]

interface MovePoemBetweenDraftAndPublishedProps {
    poemId: string
    status: 'draft' | 'published'
}

// Publish / unpublish is purely a MEMBERSHIP move: the poem itself is one entity
// that both sides resolve through, so all that changes is which id-lists hold
// its id. Publishing moves it out of Drafts and into the public lists;
// withdrawing does the reverse.
export function movePoemBetweenDraftAndPublished({ poemId, status }: MovePoemBetweenDraftAndPublishedProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const state = store.getState() as RootState
        const drafts = (state as any).myDraftsQuery

        if (status === 'published') {
            removeFromCache(dispatch, ACTIONS.MY_DRAFTS, drafts, poemId)
            PUBLIC_CACHES.forEach(({ actionType, key }) => {
                insertIntoCacheFront(dispatch, actionType, state[key] as any, poemId)
            })
            return
        }

        PUBLIC_CACHES.forEach(({ actionType, key }) => {
            removeFromCache(dispatch, actionType, state[key] as any, poemId)
        })
        // A withdrawn poem keeps its likes, but it is no longer readable, so it
        // also leaves the favourites view of anyone looking at it — including
        // the author's own.
        removeFromCache(dispatch, ACTIONS.MY_FAVOURITE_POEMS, (state as any).myFavouritePoemsQuery, poemId)
        insertIntoCacheFront(dispatch, ACTIONS.MY_DRAFTS, drafts, poemId)
    }
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
            removeFromCache(dispatch, actionType, state[key] as any, poemId)
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
        removeFromCache(dispatch, ACTIONS.MY_FAVOURITE_POEMS, myFavouritePoemsQuery as any, poemId)
    }
}

interface InsertPoemIntoCachesProps {
    response: Poem
}

// Create: register the new poem as an entity and insert its id at the front of
// the user-facing paginated lists, bumping their totals. (Ranking/top-authors are
// server-computed aggregates — the caller refreshes them via refreshAggregates.)
export function insertPoemIntoCaches({ response }: InsertPoemIntoCachesProps) {
    return function dispatcher(dispatch: AppDispatch) {
        if (!response?.id) {
            return
        }
        dispatch(poemUpserted(response))

        const state = store.getState() as RootState
        const poemId = response.id

        // A poem saved as a draft is private: it belongs in the Drafts list and
        // nowhere else. Putting it in the public caches would show the author a
        // dashboard row that nobody else can see and that a refresh removes.
        if (response.status === 'draft') {
            insertIntoCacheFront(dispatch, ACTIONS.MY_DRAFTS, (state as any).myDraftsQuery, poemId)
            return
        }

        insertIntoCacheFront(dispatch, ACTIONS.POEMS_LIST, (state as any).poemsListQuery, poemId)
        insertIntoCacheFront(dispatch, ACTIONS.MY_POEMS, (state as any).myPoemsQuery, poemId)
    }
}

interface AddPoemToFavouritesCacheProps {
    poemId: string
}

// Liking adds the poem to the "my favourites" filtered view — symmetric to the
// unlike drop (dropPoemFromFavouritesCache). Pure membership maintenance (no
// entity data duplicated): only touch a populated cache, and never duplicate an
// id that is already present.
export function addPoemToFavouritesCache({ poemId }: AddPoemToFavouritesCacheProps) {
    return function dispatcher(dispatch: AppDispatch) {
        const { myFavouritePoemsQuery } = store.getState() as RootState
        insertIntoCacheFront(dispatch, ACTIONS.MY_FAVOURITE_POEMS, myFavouritePoemsQuery as any, poemId)
    }
}

// Keep the server-computed ranking cache fresh after a mutation WITHOUT an extra
// round-trip: the like/create/delete responses already carry the freshly
// recomputed top-N (the backend computes it in the same request), so we just
// replace the cache with that authoritative list. No client-side scoring formula
// and no re-sorting — ordering, tie-breaks and boundary crossings are all the
// server's (the single source of truth). A response without a `ranking` field
// (older backend / unrelated call) is a safe no-op.
export function setRanking(ranking: RankItem[] | undefined | null) {
    return function dispatcher(dispatch: AppDispatch) {
        if (!Array.isArray(ranking)) {
            return
        }
        const { fulfilledAction } = getTypes(ACTIONS.RANKING)
        dispatch({ type: fulfilledAction, payload: ranking })
    }
}
