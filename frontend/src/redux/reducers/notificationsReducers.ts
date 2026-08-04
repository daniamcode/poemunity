import { StateItem } from '../../typescript/interfaces'
import { INITIAL } from './commonReducers'
import { getTypes } from '../actions/commonActions'

export const ACTIONS = {
    NOTIFICATIONS: 'notifications',
    NOTIFICATION_PREFERENCES: 'notification-preferences'
}

/** Actions the bell owns directly, outside the request lifecycle. */
export const UNREAD_COUNT_SET = 'notifications/unreadCountSet'

export interface NotificationActor {
    id: string
    name?: string
    username?: string
    slug?: string
    picture?: string
    type?: 'famous' | 'user' | 'ai'
}

export interface NotificationRow {
    id: string
    type: 'like' | 'comment' | 'profileComment' | 'reply' | 'follow' | 'newPoem'
    actors: NotificationActor[]
    /** DISTINCT actors, which is NOT actors.length once the array hits its cap. */
    count: number
    poem?: { id: string; title?: string; slug?: string } | null
    read: boolean
    /**
     * The author page a profile comment or reply happened on. Served rather
     * than derived: the client builds a slug from the username, but the real
     * one comes from the display name and gains a numeric suffix on collision.
     * NOT the recipient — a reply on somebody else's page is addressed to you
     * but lives on theirs.
     */
    profile?: { slug?: string; name?: string; username?: string }
    updatedAt: string
    createdAt: string
}

export interface NotificationsState extends StateItem<NotificationRow[]> {
    page?: number
    hasMore?: boolean
}

interface Action {
    type: string
    payload?: any
}

/**
 * Notification ROWS are stored here directly, not as ids resolving through an
 * entity store — and that is not a departure from the single-source-of-truth
 * rule. That rule exists because the same poem or author appears in six caches
 * and must not drift. A notification appears in exactly one list, belongs to
 * exactly one viewer, and nothing else in the app reads or mutates it.
 *
 * Its ACTORS are a different matter: those are authors, they appear everywhere,
 * and they DO go into `authorEntities` (see notificationsActions), so a poet who
 * renames is renamed here too.
 */
export function notificationsQuery(
    state: NotificationsState = INITIAL,
    action: Action = { type: '' }
): NotificationsState {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } =
        getTypes(ACTIONS.NOTIFICATIONS)

    switch (action.type) {
        case requestAction:
            return Object.assign({}, state, { isFetching: true })

        case fulfilledAction: {
            // No `total`. The list endpoint asks for one row more than the
            // page instead of running a second `countDocuments` per open, so
            // "is there another page" is known and "how many are there" is not.
            const { notifications, page, hasMore } = action.payload || {}
            const incoming: NotificationRow[] = notifications || []
            // Page 1 replaces, later pages append — the same rule every other
            // paginated cache here uses.
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

export interface UnreadCountState {
    count: number
}

/**
 * The bell's badge, kept apart from the list on purpose.
 *
 * The bell renders on every page; the list renders only when the panel is open.
 * Folding the count into the list cache would mean either fetching the whole
 * list on every page load to learn one number, or letting an empty list reset
 * the badge to zero.
 *
 * It is also written directly by the mark-read response, so the badge clears in
 * the same round-trip rather than after a second fetch.
 */
export function unreadCount(
    state: UnreadCountState = { count: 0 },
    action: Action = { type: '' }
): UnreadCountState {
    if (action.type === UNREAD_COUNT_SET) {
        const next = Number(action.payload)
        // Guarded because this is fed from two different responses, and a
        // missing field arriving as NaN would render "NaN" in the badge.
        return Number.isFinite(next) ? { count: Math.max(next, 0) } : state
    }
    return state
}

export function unreadCountSet(count: number) {
    return { type: UNREAD_COUNT_SET, payload: count }
}

export interface NotificationPreferences {
    like: boolean
    comment: boolean
    profileComment: boolean
    reply: boolean
    follow: boolean
    newPoem: boolean
}

export function notificationPreferencesQuery(
    state: StateItem<NotificationPreferences> = INITIAL,
    action: Action = { type: '' }
): StateItem<NotificationPreferences> {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } =
        getTypes(ACTIONS.NOTIFICATION_PREFERENCES)

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
