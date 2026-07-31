import store from '../store/index'
import { getAction, getTypes, postAction, deleteAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/followsReducers'
import { AppDispatch, RootState } from '../store'
import { ReduxOptions, ReduxCallbacks } from '../../typescript/interfaces'
import { authorsUpserted, authorUpdated, AuthorEntity } from '../reducers/authorEntitiesReducers'

/** One row of GET /authors/:idOrSlug/{followers,following}. */
export interface FollowAuthor {
    id: string
    name: string
    slug?: string
    picture?: string
    type?: 'famous' | 'user' | 'ai'
    followedAt?: string
}

interface FollowListResponse {
    authors?: FollowAuthor[]
    total?: number
    page?: number
}

// Every author on a follow list goes into the normalized store, exactly as the
// poem and author-list fetches do. `type` travels with them because that is
// what the AI badge on each row reads — a follow list that dropped it would
// silently present an AI persona as a person.
function seedAuthorEntities(dispatch: AppDispatch, responseData: unknown): void {
    const authors = (responseData as FollowListResponse)?.authors
    if (!Array.isArray(authors) || authors.length === 0) {
        return
    }
    const entities: AuthorEntity[] = authors
        .filter(author => author && author.id)
        .map(author => ({
            id: author.id,
            name: author.name,
            picture: author.picture,
            slug: author.slug,
            type: author.type
        }))
    dispatch(authorsUpserted(entities))
}

function withAuthorSeeding(dispatch: AppDispatch, callbacks?: ReduxCallbacks): ReduxCallbacks {
    return {
        ...callbacks,
        success: (responseData: unknown) => {
            seedAuthorEntities(dispatch, responseData)
            callbacks?.success?.(responseData)
        }
    }
}

interface FollowListActionProps {
    /** Author id OR slug — the server resolves both. */
    idOrSlug: string
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
    signal?: AbortSignal
}

export function getFollowersAction({ idOrSlug, params, options, callbacks, signal }: FollowListActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.FOLLOWERS,
            url: API_ENDPOINTS.AUTHOR_FOLLOWERS(idOrSlug),
            dispatch,
            params,
            options,
            signal,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

export function getFollowingAction({ idOrSlug, params, options, callbacks, signal }: FollowListActionProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.FOLLOWING,
            url: API_ENDPOINTS.AUTHOR_FOLLOWING(idOrSlug),
            dispatch,
            params,
            options,
            signal,
            callbacks: withAuthorSeeding(dispatch, callbacks)
        })
    }
}

interface FollowResponse {
    following?: boolean
    followerCount?: number
    followingCount?: number
}

interface FollowMutationProps {
    /** Author id or slug, for the URL. */
    idOrSlug: string
    /** The author's ID — the key of the normalized record to update. */
    authorId: string
    context: { config: object }
    callbacks?: ReduxCallbacks
}

// Adopt the server's answer verbatim, exactly as `setRanking` does with the
// ranking: `following` and the two counts are all recomputed server-side in the
// same request, so the client never has to guess whether its optimistic +1 was
// right. It is also what makes the mutation idempotent end to end — following
// something you already follow returns the unchanged count rather than an
// incremented one.
function applyFollowResponse(dispatch: AppDispatch, authorId: string, response: FollowResponse) {
    if (!authorId || !response || typeof response.following !== 'boolean') {
        return
    }
    dispatch(authorUpdated({
        id: authorId,
        changes: {
            isFollowing: response.following,
            followerCount: response.followerCount,
            followingCount: response.followingCount
        }
    }))
}

// Membership maintenance for the signed-in user's own "Following" tab: the
// author they just followed joins it, the one they unfollowed leaves it. The
// author RECORD is untouched here — it lives once in authorEntities and both
// the tab and the author page resolve through it.
function updateOwnFollowingCache(dispatch: AppDispatch, authorId: string, following: boolean) {
    const cache = (store.getState() as RootState).followingQuery
    if (!Array.isArray(cache?.item)) {
        // An unfetched cache is left alone: writing to it would fabricate a
        // first page the user never loaded, which then reads as a full list.
        return
    }
    const ids = cache.item as string[]
    const alreadyThere = ids.includes(authorId)
    // Idempotent, for the same reason the endpoints are: re-following someone
    // already in the list must not add a second row, and unfollowing someone
    // who was never in it must not decrement the total.
    if (following === alreadyThere) {
        return
    }
    const next = following ? [authorId, ...ids] : ids.filter(id => id !== authorId)
    const { fulfilledAction } = getTypes(ACTIONS.FOLLOWING)
    dispatch({
        type: fulfilledAction,
        payload: {
            authors: next,
            page: cache.page,
            hasMore: cache.hasMore,
            total: Math.max(0, (cache.total || 0) + (following ? 1 : -1)),
            totalPages: cache.totalPages
        }
    })
}

export function followAuthorAction({ idOrSlug, authorId, context, callbacks }: FollowMutationProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.FOLLOW_MUTATION,
            url: API_ENDPOINTS.AUTHOR_FOLLOW(idOrSlug),
            dispatch,
            // Explicitly empty. The server takes the follower from the session
            // and reads nothing from the body; sending an author id here would
            // suggest otherwise to the next person reading this.
            data: {},
            config: context.config,
            // The list caches must not be touched by the mutation's own
            // request/fulfilled actions — `options.fetch` still runs the call,
            // but we handle the state change ourselves in the callback.
            callbacks: {
                ...callbacks,
                success: (response: FollowResponse) => {
                    applyFollowResponse(dispatch, authorId, response)
                    updateOwnFollowingCache(dispatch, authorId, true)
                    callbacks?.success?.(response)
                }
            }
        })
    }
}

export function unfollowAuthorAction({ idOrSlug, authorId, context, callbacks }: FollowMutationProps) {
    return function dispatcher(dispatch: AppDispatch) {
        return deleteAction({
            type: ACTIONS.FOLLOW_MUTATION,
            url: API_ENDPOINTS.AUTHOR_FOLLOW(idOrSlug),
            dispatch,
            config: context.config,
            callbacks: {
                ...callbacks,
                success: (response: FollowResponse) => {
                    applyFollowResponse(dispatch, authorId, response)
                    updateOwnFollowingCache(dispatch, authorId, false)
                    callbacks?.success?.(response)
                }
            }
        })
    }
}
