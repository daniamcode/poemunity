import { StateItem } from '../../typescript/interfaces'
import { INITIAL } from './commonReducers'
import { getTypes } from '../actions/commonActions'

export const ACTIONS = {
    FOLLOWERS: 'followers',
    FOLLOWING: 'following',
    /**
     * Follow / unfollow. Deliberately NOT one of the two list types above: the
     * mutation response is `{ following, followerCount, followingCount }`, and
     * feeding that through a list reducer would set `item` from an absent
     * `authors` field and blank whichever list happened to be on screen. No
     * reducer listens to this type — the action's own success callback owns the
     * state change (one `authorUpdated` plus a membership move).
     */
    FOLLOW_MUTATION: 'follow-mutation'
}

interface Action {
    type: string
    payload?: any
}

/**
 * Like every other list cache in the store, these hold AUTHOR IDS plus
 * pagination meta — never author copies. The authors themselves live once in
 * `authorEntities`, so an author who renames, changes their avatar, or is
 * followed/unfollowed is one entity update and both tabs re-read it.
 *
 * The server sends `{ authors, total, page, ... }`; the reducer keeps only the
 * ids and pushes the rows into the entity store on the action side (see
 * followsActions).
 */
export interface FollowListState extends StateItem<string[]> {
    page?: number
    hasMore?: boolean
    total?: number
    totalPages?: number
}

interface FollowRow {
    id: string
}

function idsOf(authors: (FollowRow | string)[]): string[] {
    return (authors || []).map(entry => (typeof entry === 'string' ? entry : entry?.id))
}

function followListReducer(actionType: string) {
    return function reducer(state: FollowListState = INITIAL, action: Action): FollowListState {
        const { rejectedAction, requestAction, fulfilledAction, resetAction } = getTypes(actionType)

        switch (action.type) {
            case requestAction: {
                if (state.abortController) {
                    state.abortController.abort()
                }
                return Object.assign({}, state, { isFetching: true })
            }
            case fulfilledAction: {
                const { authors, page, hasMore, total, totalPages } = action.payload
                const incoming = idsOf(authors)
                // Same rule the poem caches use: page 1 replaces, later pages
                // append. A membership edit (unfollow from the list) re-emits
                // the same page with one fewer row, which the length check
                // treats as a replace rather than an append — otherwise
                // unfollowing would DUPLICATE the remaining rows.
                const isCacheUpdate = state.item && state.page === page && incoming.length <= state.item.length
                const item = page === 1 || isCacheUpdate ? incoming : [...(state.item || []), ...incoming]

                return Object.assign({}, state, {
                    isFetching: false,
                    isError: false,
                    item,
                    page,
                    hasMore,
                    total,
                    totalPages,
                    err: undefined,
                    abortController: undefined
                })
            }
            case rejectedAction:
                return Object.assign({}, state, {
                    isFetching: false,
                    isError: true,
                    err: action.payload,
                    abortController: undefined
                })
            case resetAction: {
                if (state.abortController) {
                    state.abortController.abort()
                }
                return INITIAL
            }
            default:
                return state
        }
    }
}

export const followersQuery = followListReducer(ACTIONS.FOLLOWERS)
export const followingQuery = followListReducer(ACTIONS.FOLLOWING)
