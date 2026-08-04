import { StateItem } from '../../typescript/interfaces'
import { INITIAL } from './commonReducers'
import { getTypes } from '../actions/commonActions'

export const ACTIONS = {
    USER_STATS: 'user-stats'
}

export interface UserStats {
    poemsPublished: number
    likesReceived: number
}

interface Action {
    type: string
    payload?: any
}

/**
 * The two server-counted numbers behind the profile stats panel.
 *
 * The panel's third figure — your rank — is deliberately NOT here. It is read
 * from `rankingQuery`, which the app already fetches once on mount for the
 * public sidebar. Storing a separately-fetched rank would let the panel and the
 * sidebar show different positions for the same poet, and would put
 * computeRanking()'s full-collection aggregation on every profile load.
 *
 * A plain request-lifecycle cache: these are two integers belonging to one
 * viewer, read nowhere else, so there is nothing for an entity store to
 * deduplicate.
 */
export function userStatsQuery(
    state: StateItem<UserStats> = INITIAL,
    action: Action = { type: '' }
): StateItem<UserStats> {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } =
        getTypes(ACTIONS.USER_STATS)

    switch (action.type) {
        case requestAction:
            return Object.assign({}, state, { isFetching: true })

        case fulfilledAction:
            return Object.assign({}, state, {
                isFetching: false,
                isError: false,
                item: action.payload,
                err: undefined
            })

        case rejectedAction:
            return Object.assign({}, state, { isFetching: false, isError: true, err: action.payload })

        case resetAction:
            return INITIAL

        default:
            return state
    }
}
