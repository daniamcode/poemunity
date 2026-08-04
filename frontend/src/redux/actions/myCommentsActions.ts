import { getAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS } from '../reducers/myCommentsReducers'
import { AppDispatch } from '../store'
import { ReduxOptions, ReduxCallbacks } from '../../typescript/interfaces'

interface GetMyCommentsProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

/**
 * Fetch the signed-in author's own comments.
 *
 * Sends no author id. The endpoint is scoped by the session, and a component
 * that passed one would read as though client-supplied scope were what keeps
 * the list yours — the same rule the Drafts tab and the notification routes
 * follow.
 */
export function getMyCommentsAction({ params, options, callbacks }: GetMyCommentsProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.MY_COMMENTS,
            url: API_ENDPOINTS.COMMENTS_MINE,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}

/**
 * Fetch the comments the signed-in author RECEIVED — on their poems, on their
 * page, and replies to them anywhere. Sends no author id, for the same reason
 * the written half does not.
 */
export function getReceivedCommentsAction({ params, options, callbacks }: GetMyCommentsProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.RECEIVED_COMMENTS,
            url: API_ENDPOINTS.COMMENTS_RECEIVED,
            dispatch,
            params,
            options,
            callbacks
        })
    }
}
