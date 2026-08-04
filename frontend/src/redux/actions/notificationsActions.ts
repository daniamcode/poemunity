import { getAction, patchAction } from './commonActions'
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

/** The request itself, so a caller can await it without a thunk. */
export async function markNotificationsReadActionAsync(
    dispatch: AppDispatch,
    { ids, callbacks }: MarkReadProps = {}
) {
    try {
        const api = API({}, {})
        const res = await api.post(
            API_ENDPOINTS.NOTIFICATIONS_READ,
            ids && ids.length > 0 ? { ids } : {}
        )
        dispatch(unreadCountSet(res?.data?.unreadCount ?? 0))
        callbacks?.success?.(res?.data)
        return res?.data
    } catch (error) {
        // The badge is deliberately left alone on failure: it currently shows a
        // real number, and zeroing it because a write failed would claim the
        // notifications were read when they were not.
        callbacks?.error?.(error)
        return null
    }
}

/**
 * Mark notifications read.
 *
 * A BARE REQUEST, not `postAction`. This used to pass
 * `options: { fetch: false }` meaning "run the request but keep its response
 * out of the notifications reducer, which holds a LIST and would be blanked by
 * a `{ updated, unreadCount }` body". That is not what the flag does: `fetch:
 * false` skips the entire `if (options.fetch)` block in `postAction` — the
 * axios call included — so THE REQUEST WAS NEVER SENT. Nothing was ever marked
 * read, the badge never cleared, and the success callback that clears it never
 * ran. Reported from production. The four other `fetch: false` call sites in
 * the app pair it with `reset: true` and genuinely do mean "clear the cache
 * without fetching", which is why the flag exists.
 *
 * The badge is updated from the RESPONSE's `unreadCount`, not decremented
 * locally: the server is the only thing that knows what was actually unread,
 * and a client subtracting its own guess would drift the moment two tabs were
 * open.
 */
export function markNotificationsReadAction({ ids, callbacks }: MarkReadProps = {}) {
    return function dispatcher(dispatch: AppDispatch) {
        return markNotificationsReadActionAsync(dispatch, { ids, callbacks })
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
