import { getAction, postAction, patchAction } from './commonActions'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { ACTIONS, unreadCountSet, NotificationRow } from '../reducers/notificationsReducers'
import { AppDispatch } from '../store'
import { ReduxOptions, ReduxCallbacks } from '../../typescript/interfaces'
import { authorsUpserted, AuthorEntity } from '../reducers/authorEntitiesReducers'
import API from './axiosInstance'

/**
 * Push every actor into the normalized author store.
 *
 * The notification row itself is a private record nothing else reads, but its
 * actors are authors — they appear on poem lists, author pages and follow tabs,
 * and `type` travels with them because that is what the AI badge reads. A
 * notification that dropped it would present an AI persona as a person, on a
 * surface the disclosure rules cover like any other.
 */
function seedActors(dispatch: AppDispatch, responseData: unknown): void {
    const rows = (responseData as { notifications?: NotificationRow[] })?.notifications
    if (!Array.isArray(rows)) return

    const entities: AuthorEntity[] = rows
        .flatMap(row => row?.actors || [])
        // Requires a NAME as well as an id: `AuthorEntity.name` is non-optional,
        // and upserting a nameless entity would overwrite a good name already in
        // the store with `undefined` — the row would then render blank
        // everywhere, not just here.
        .filter(actor => actor?.id && (actor.name || actor.username))
        .map(actor => ({
            id: actor.id,
            name: (actor.name || actor.username) as string,
            picture: actor.picture,
            slug: actor.slug,
            type: actor.type
        }))

    if (entities.length > 0) {
        dispatch(authorsUpserted(entities))
    }
}

interface GetNotificationsProps {
    params?: object
    options?: ReduxOptions
    callbacks?: ReduxCallbacks
}

export function getNotificationsAction({ params, options, callbacks }: GetNotificationsProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.NOTIFICATIONS,
            url: API_ENDPOINTS.NOTIFICATIONS,
            dispatch,
            params,
            options,
            callbacks: {
                ...callbacks,
                success: (responseData: unknown) => {
                    seedActors(dispatch, responseData)
                    callbacks?.success?.(responseData)
                }
            }
        })
    }
}

/**
 * The badge. A bare fetch rather than a request-lifecycle action, because there
 * is no loading or error state worth rendering for it — a bell that cannot
 * reach the server shows the count it last knew, which is a better answer than
 * a spinner or a zero.
 */
export function fetchUnreadCountAction() {
    return async function dispatcher(dispatch: AppDispatch) {
        try {
            const api = API({}, {})
            const res = await api.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT)
            dispatch(unreadCountSet(res?.data?.count ?? 0))
        } catch {
            // Deliberately silent: see above.
        }
    }
}

interface MarkReadProps {
    /** Omit to mark everything read — what opening the panel does. */
    ids?: string[]
    callbacks?: ReduxCallbacks
}

/**
 * Mark notifications read.
 *
 * The badge is updated from the RESPONSE's `unreadCount`, not decremented
 * locally: the server is the only thing that knows what was actually unread,
 * and a client that subtracted its own guess would drift the moment two tabs
 * were open.
 */
export function markNotificationsReadAction({ ids, callbacks }: MarkReadProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return postAction({
            type: ACTIONS.NOTIFICATIONS,
            url: API_ENDPOINTS.NOTIFICATIONS_READ,
            dispatch,
            data: ids && ids.length > 0 ? { ids } : {},
            // No reducer listens to this action's lifecycle — the notifications
            // cache holds a LIST, and feeding it a `{ updated, unreadCount }`
            // body would blank the rows on screen. The callback owns the state
            // change, exactly as the follow mutation does.
            options: { fetch: false } as ReduxOptions,
            callbacks: {
                ...callbacks,
                success: (responseData: any) => {
                    dispatch(unreadCountSet(responseData?.unreadCount ?? 0))
                    callbacks?.success?.(responseData)
                }
            }
        })
    }
}

export function getNotificationPreferencesAction({ callbacks }: { callbacks?: ReduxCallbacks } = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return getAction({
            type: ACTIONS.NOTIFICATION_PREFERENCES,
            url: API_ENDPOINTS.NOTIFICATION_PREFERENCES,
            dispatch,
            callbacks
        })
    }
}

export function saveNotificationPreferencesAction({
    data,
    callbacks
}: { data: Record<string, boolean>; callbacks?: ReduxCallbacks }) {
    return function dispatcher(dispatch: AppDispatch) {
        return patchAction({
            type: ACTIONS.NOTIFICATION_PREFERENCES,
            url: API_ENDPOINTS.NOTIFICATION_PREFERENCES,
            dispatch,
            data,
            callbacks
        })
    }
}
