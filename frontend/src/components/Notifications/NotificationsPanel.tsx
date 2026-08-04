import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import type { RootState } from '../../redux/store'
import CircularProgress from '../CircularIndeterminate'
import { AiBadge } from '../common/AiBadge'
import { getNotificationsAction } from '../../redux/actions/notificationsActions'
import { NotificationRow } from '../../redux/reducers/notificationsReducers'
import {
    notificationMessage,
    notificationHref,
    notificationTimestamp,
    notificationExactTime,
    notificationDateTimeAttr
} from './notificationText'
import {
    NOTIFICATIONS_TITLE,
    NOTIFICATIONS_EMPTY,
    NOTIFICATIONS_LOAD_MORE
} from '../../data/constants'

interface Props {
    onClose: () => void
}

/**
 * The dropdown the bell opens.
 *
 * Rows render `read` styling from the value the server sent with the LIST — the
 * bell marks everything read on open, but the rows the user is looking at
 * should still show which ones were new when they opened it. Re-reading the
 * list after the mark-read would erase exactly the distinction they opened it
 * to see.
 */
export default function NotificationsPanel({ onClose }: Props) {
    const dispatch = useAppDispatch()
    const cache = useSelector((state: RootState) => state.notificationsQuery)
    const rows: NotificationRow[] = cache?.item || []

    const handleLoadMore = () => {
        if (cache?.isFetching || !cache?.hasMore) return
        dispatch(getNotificationsAction({ params: { page: (cache.page || 1) + 1 } }))
    }

    const isFirstLoad = cache?.isFetching && rows.length === 0

    return (
        <div className='notifications-panel' role='dialog' aria-label={NOTIFICATIONS_TITLE}>
            <p className='notifications-panel__title'>{NOTIFICATIONS_TITLE}</p>

            {isFirstLoad && <CircularProgress />}

            {!isFirstLoad && rows.length === 0 && (
                <p className='notifications-panel__empty'>{NOTIFICATIONS_EMPTY}</p>
            )}

            {rows.length > 0 && (
                <ul className='notifications-panel__items'>
                    {rows.map(row => {
                        const href = notificationHref(row)
                        const message = notificationMessage(row)
                        // An AI persona is badged here as everywhere else. A
                        // notification is a surface where a bot addresses you
                        // directly, so if anything it matters more here.
                        const aiActor = (row.actors || []).find(a => a.type === 'ai')

                        const body = (
                            <>
                                <span className='notifications-panel__message'>{message}</span>
                                {row.poem?.title && (
                                    <span className='notifications-panel__poem'>{row.poem.title}</span>
                                )}
                                {/*
                                    `updatedAt`, matching the list's own
                                    ordering — see notificationTimestamp. A
                                    real <time> so the precise moment is
                                    machine-readable and available on hover,
                                    while the visible text stays the readable
                                    relative form.
                                */}
                                <time
                                    className='notifications-panel__time'
                                    dateTime={notificationDateTimeAttr(row)}
                                    title={notificationExactTime(row)}
                                >
                                    {notificationTimestamp(row)}
                                </time>
                            </>
                        )

                        return (
                            <li
                                key={row.id}
                                className={`notifications-panel__item${
                                    row.read ? '' : ' notifications-panel__item--unread'
                                }`}
                            >
                                {href
                                    ? (
                                        <Link
                                            href={href}
                                            className='notifications-panel__link'
                                            onClick={onClose}
                                        >
                                            {body}
                                        </Link>
                                    )
                                    : (
                                        // No link rather than a link to nowhere:
                                        // a poem or author that has since been
                                        // deleted leaves the row readable but
                                        // inert.
                                        <span className='notifications-panel__link'>{body}</span>
                                    )}
                                <AiBadge authorType={aiActor?.type} />
                            </li>
                        )
                    })}
                </ul>
            )}

            {cache?.isFetching && rows.length > 0 && <CircularProgress />}

            {cache?.hasMore && !cache?.isFetching && (
                <button
                    type='button'
                    className='notifications-panel__more'
                    onClick={handleLoadMore}
                >
                    {NOTIFICATIONS_LOAD_MORE}
                </button>
            )}
        </div>
    )
}
