import { getAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/statsReducers'
import { AppDispatch } from '../store'
import { ReduxOptions, ReduxCallbacks } from '../../typescript/interfaces'

interface GetUserStatsProps {
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

/**
 * Fetch the signed-in poet's published-poem and like totals.
 *
 * Takes no parameters at all: the endpoint is scoped by the session, and a
 * component that passed an author id would read as though client-supplied scope
 * were what keeps somebody's numbers their own. Same rule as the drafts tab.
 */
export function getUserStatsAction({ options, callbacks }: GetUserStatsProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.USER_STATS,
            url: API_ENDPOINTS.USER_STATS,
            dispatch,
            options,
            callbacks
        })
    }
}
