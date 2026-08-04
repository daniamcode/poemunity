import { StateItem } from '../../typescript/interfaces'
import { INITIAL } from './commonReducers'
import { getTypes } from '../actions/commonActions'

export const ACTIONS = {
    MY_COMMENTS: 'my-comments'
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
