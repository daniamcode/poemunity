import { useContext, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AppContext } from '../../App'
import { useAppDispatch } from '../../redux/store'
import type { RootState } from '../../redux/store'
import {
    fetchUnreadCountAction,
    getNotificationsAction,
    markNotificationsReadAction
} from '../../redux/actions/notificationsActions'
import { NOTIFICATIONS_OPEN } from '../../data/constants'
import NotificationsPanel from './NotificationsPanel'

// Anything above this shows as "9+". A three-digit badge is wider than the bell
// and stops being a number you read — it becomes a shape meaning "lots".
const BADGE_MAX = 9

/**
 * The header bell.
 *
 * Renders nothing at all when signed out: there is no such thing as an
 * anonymous notification, and an empty bell would be an affordance that never
 * does anything.
 */
export default function NotificationBell() {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    const count = useSelector((state: RootState) => state.unreadCount?.count ?? 0)
    const signedIn = Boolean(context?.user)

    // One fetch on mount. Deliberately NOT polled: a poll on every open tab is a
    // request per user per interval forever, against a serverless backend billed
    // per invocation, to learn a number that is usually unchanged. The count
    // refreshes when the panel opens, which is when it matters.
    useEffect(() => {
        if (signedIn) {
            dispatch(fetchUnreadCountAction())
        }
    }, [signedIn, dispatch])

    // Close on an outside click. Registered only while open, so the app is not
    // carrying a document-level listener for a panel nobody has opened.
    useEffect(() => {
        if (!open) return

        function onPointerDown(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') setOpen(false)
        }

        document.addEventListener('mousedown', onPointerDown)
        document.addEventListener('keydown', onKeyDown)
        return () => {
            document.removeEventListener('mousedown', onPointerDown)
            document.removeEventListener('keydown', onKeyDown)
        }
    }, [open])

    if (!signedIn) return null

    const handleToggle = () => {
        const next = !open
        setOpen(next)
        if (!next) return

        // Opening loads the list, and marks everything read ONLY ONCE THAT HAS
        // LANDED. The order is load-bearing, not tidiness: both were dispatched
        // together before, so the mark-read could reach the server first and the
        // list would come back with every row already `read: true` — erasing
        // exactly the what's-new distinction the panel is opened to see. Chained
        // through the success callback rather than awaited, because that is the
        // one thing guaranteed to run after the rows are in the store.
        //
        // Marking read is NOT optimistic — the server owns which rows were
        // unread, and a client that zeroed its own badge would be wrong the
        // moment a second tab had already read them.
        dispatch(getNotificationsAction({
            params: { page: 1 },
            options: { reset: true, fetch: true },
            callbacks: { success: () => dispatch(markNotificationsReadAction({})) }
        }))
    }

    return (
        <div className='notification-bell' ref={wrapperRef}>
            <button
                type='button'
                className='notification-bell__button'
                onClick={handleToggle}
                aria-expanded={open}
                aria-haspopup='dialog'
                // The count is in the accessible name, not only in the badge:
                // a screen reader user gets "Notifications, 3 unread" from the
                // button itself rather than having to open it to find out.
                aria-label={count > 0 ? `${NOTIFICATIONS_OPEN}, ${count} unread` : NOTIFICATIONS_OPEN}
            >
                <span className='notification-bell__icon' aria-hidden='true'>🔔</span>
                {count > 0 && (
                    <span className='notification-bell__badge' aria-hidden='true'>
                        {count > BADGE_MAX ? `${BADGE_MAX}+` : count}
                    </span>
                )}
            </button>
            {open && <NotificationsPanel onClose={() => setOpen(false)} />}
        </div>
    )
}
