import { StateItem } from '../../typescript/interfaces'
import { INITIAL } from './commonReducers'
import { getTypes } from '../actions/commonActions'

export const ACTIONS = {
    MY_COMMENTS: 'my-comments',
    RECEIVED_COMMENTS: 'received-comments'
}

/** A comment somebody else left, on your poem or page, or in reply to you. */
export interface ReceivedCommentRow {
    id: string
    body: string
    createdAt: string
    targetType: 'poem' | 'profile'
    /** Answered a comment YOU wrote — the UI says "replied to you", not "commented". */
    isReply: boolean
    poem?: { id: string; title?: string; slug?: string }
    author?: {
        id: string
        name?: string
        slug?: string
        picture?: string
        /** Carried so an AI commenter keeps its badge here as everywhere else. */
        type?: 'famous' | 'user' | 'ai'
    } | null
}

export interface MyCommentRow {
    id: string
    body: string
    createdAt: string
    targetType: 'poem' | 'profile'
    /** Present for a poem comment. Absent when the comment is on a profile. */
    poem?: {
        id: string
        title?: string
        slug?: string
        author?: { name?: string; slug?: string } | null
    }
    /** Present for a profile comment. */
    author?: { name?: string; slug?: string }
}

export interface MyCommentsState extends StateItem<MyCommentRow[]> {
    page?: number
    hasMore?: boolean
}

interface Action {
    type: string
    payload?: any
}

/**
 * Your own comments, newest first.
 *
 * Rows are stored directly rather than as ids through an entity store, for the
 * same reason notification rows are: a comment appears in exactly one list and
 * nothing else in the app reads or mutates it. The POEM each row points at is a
 * different matter — but only its title and slug travel here, and neither is
 * mutable from this screen, so there is nothing to drift.
 *
 * No `total`. The endpoint asks for one row more than the page instead of
 * running a second count query, so "is there another page" is known and "how
 * many are there" is not.
 */
export function myCommentsQuery(
    state: MyCommentsState = INITIAL,
    action: Action = { type: '' }
): MyCommentsState {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } =
        getTypes(ACTIONS.MY_COMMENTS)

    switch (action.type) {
        case requestAction:
            return Object.assign({}, state, { isFetching: true })

        case fulfilledAction: {
            const { comments, page, hasMore } = action.payload || {}
            const incoming: MyCommentRow[] = comments || []
            // Page 1 replaces, later pages append — the rule every paginated
            // cache here uses.
            const item = page === 1 || !state.item ? incoming : [...state.item, ...incoming]

            return Object.assign({}, state, {
                isFetching: false,
                isError: false,
                item,
                page,
                hasMore,
                err: undefined
            })
        }

        case rejectedAction:
            return Object.assign({}, state, { isFetching: false, isError: true, err: action.payload })

        case resetAction:
            return INITIAL

        default:
            return state
    }
}

/**
 * Comments you RECEIVED. A separate cache from the ones you wrote, not a flag
 * on the same one: the two halves of the tab are switched between freely, and
 * sharing a cache would refetch the other half on every toggle.
 */
export function receivedCommentsQuery(
    state: MyCommentsState = INITIAL,
    action: Action = { type: '' }
): MyCommentsState {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } =
        getTypes(ACTIONS.RECEIVED_COMMENTS)

    switch (action.type) {
        case requestAction:
            return Object.assign({}, state, { isFetching: true })

        case fulfilledAction: {
            const { comments, page, hasMore } = action.payload || {}
            const incoming = comments || []
            const item = page === 1 || !state.item ? incoming : [...state.item, ...incoming]
            return Object.assign({}, state, {
                isFetching: false, isError: false, item, page, hasMore, err: undefined
            })
        }

        case rejectedAction:
            return Object.assign({}, state, { isFetching: false, isError: true, err: action.payload })

        case resetAction:
            return INITIAL

        default:
            return state
    }
}
