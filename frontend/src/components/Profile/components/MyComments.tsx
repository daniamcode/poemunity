import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { AppContext } from '../../../App'
import { useAppDispatch } from '../../../redux/store'
import type { RootState } from '../../../redux/store'
import { getMyCommentsAction, getReceivedCommentsAction } from '../../../redux/actions/myCommentsActions'
import { MyCommentRow, ReceivedCommentRow } from '../../../redux/reducers/myCommentsReducers'
import { AiBadge } from '../../common/AiBadge'
import CircularProgress from '../../CircularIndeterminate'
import {
    MY_COMMENTS_EMPTY,
    MY_COMMENTS_LOAD_MORE,
    MY_COMMENTS_ON_POEM,
    MY_COMMENTS_ON_PROFILE,
    MY_COMMENTS_WRITTEN,
    MY_COMMENTS_RECEIVED,
    MY_COMMENTS_RECEIVED_EMPTY,
    MY_COMMENTS_REPLIED,
    MY_COMMENTS_ON_YOUR_POEM,
    MY_COMMENTS_ON_YOUR_PAGE
} from '../../../data/constants'
import { notificationTimestamp } from '../../Notifications/notificationText'

/**
 * The "My comments" tab.
 *
 * It exists because a comment was a dead end: you write one on a poem and have
 * no way back to it afterwards. Your poems and the poems you liked already have
 * tabs, so this is the only part of "my activity" that was unreachable — which
 * is why this is not the merged Activity timeline originally sketched. That
 * would have repeated two existing tabs to deliver this one capability.
 *
 * Rows whose target is gone or no longer public never arrive: the server drops
 * them, because a row linking to a 404 is worse than no row.
 */
function targetHref(row: MyCommentRow): string | null {
    if (row.targetType === 'profile') {
        return row.author?.slug ? `/authors/${row.author.slug}` : null
    }
    const target = row.poem?.slug || row.poem?.id
    return target ? `/detail/${target}` : null
}

/**
 * What a received row says happened.
 *
 * A reply is named a reply. "Commented on your poem" is true of a reply too,
 * but weaker — it loses the fact that it answered YOU, which is the whole
 * reason the row is worth surfacing.
 */
function receivedPhrase(row: ReceivedCommentRow): string {
    if (row.isReply) return MY_COMMENTS_REPLIED
    return row.targetType === 'profile' ? MY_COMMENTS_ON_YOUR_PAGE : MY_COMMENTS_ON_YOUR_POEM
}

/** Where a RECEIVED row points: the poem it is on, or your own author page. */
function receivedHref(row: ReceivedCommentRow): string | null {
    if (row.targetType === 'profile') return '/profile'
    const target = row.poem?.slug || row.poem?.id
    return target ? `/detail/${target}` : null
}

export default function MyComments() {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()

    // TWO CACHES, one per half. Sharing one would refetch the other side on
    // every toggle, and the two are switched between freely.
    const [view, setView] = useState<'written' | 'received'>('written')
    const writtenCache = useSelector((state: RootState) => state.myCommentsQuery)
    const receivedCache = useSelector((state: RootState) => state.receivedCommentsQuery)

    const cache = view === 'written' ? writtenCache : receivedCache
    const rows = (cache?.item || []) as (MyCommentRow | ReceivedCommentRow)[]
    const fetchFor = view === 'written' ? getMyCommentsAction : getReceivedCommentsAction

    const signedIn = Boolean(context?.user)

    // Refetches on every switch. The alternative — fetching once and trusting
    // the cache — shows a stale list to the one person who would notice: these
    // are replies addressed to them.
    useEffect(() => {
        if (signedIn) {
            const action = view === 'written' ? getMyCommentsAction : getReceivedCommentsAction
            dispatch(action({ params: { page: 1 }, options: { reset: true, fetch: true } }))
        }
    }, [signedIn, view, dispatch])

    if (!signedIn) return null

    const handleLoadMore = () => {
        if (cache?.isFetching || !cache?.hasMore) return
        dispatch(fetchFor({ params: { page: (cache.page || 1) + 1 } }))
    }

    const toggle = (
        <div className='my-comments__toggle' role='tablist' aria-label='Comments'>
            {(['written', 'received'] as const).map(key => (
                <button
                    key={key}
                    type='button'
                    role='tab'
                    aria-selected={view === key}
                    className={`my-comments__toggle-button${view === key ? ' my-comments__toggle-button--active' : ''}`}
                    onClick={() => setView(key)}
                >
                    {key === 'written' ? MY_COMMENTS_WRITTEN : MY_COMMENTS_RECEIVED}
                </button>
            ))}
        </div>
    )

    // The spinner is gated on having nothing yet, so paging in more rows does
    // not blank the list you are already reading. The toggle stays mounted
    // through both, or switching views makes the control you just used vanish.
    if (cache?.isFetching && rows.length === 0) {
        return <div className='my-comments'>{toggle}<CircularProgress /></div>
    }

    if (rows.length === 0) {
        return (
            <div className='my-comments'>
                {toggle}
                <p className='my-comments__empty'>
                    {view === 'written' ? MY_COMMENTS_EMPTY : MY_COMMENTS_RECEIVED_EMPTY}
                </p>
            </div>
        )
    }

    if (view === 'received') {
        return (
            <div className='my-comments'>
                {toggle}
                <ul className='my-comments__list'>
                    {(rows as ReceivedCommentRow[]).map(row => {
                        const href = receivedHref(row)
                        // A reply is named a reply. "Commented on your poem" is
                        // true but weaker — it loses that it answered YOU.
                        const what = receivedPhrase(row)
                        const where = row.targetType === 'profile' ? null : row.poem?.title

                        return (
                            <li key={row.id} className='my-comments__item'>
                                <p className='my-comments__body'>{row.body}</p>
                                <p className='my-comments__meta'>
                                    {row.author?.slug
                                        ? (
                                            <Link
                                                href={`/authors/${row.author.slug}`}
                                                className='my-comments__target'
                                            >
                                                {row.author.name}
                                            </Link>
                                        )
                                        : <span className='my-comments__target'>{row.author?.name}</span>}
                                    <AiBadge authorType={row.author?.type} />
                                    {` ${what} `}
                                    {where && (href
                                        ? <Link href={href} className='my-comments__target'>{where}</Link>
                                        : <span className='my-comments__target'>{where}</span>)}
                                    <time className='my-comments__time' dateTime={row.createdAt}>
                                        {notificationTimestamp({ updatedAt: row.createdAt } as never)}
                                    </time>
                                </p>
                            </li>
                        )
                    })}
                </ul>
                {cache?.isFetching && rows.length > 0 && <CircularProgress />}
                {cache?.hasMore && !cache?.isFetching && (
                    <button type='button' className='my-comments__more' onClick={handleLoadMore}>
                        {MY_COMMENTS_LOAD_MORE}
                    </button>
                )}
            </div>
        )
    }

    return (
        <div className='my-comments'>
            {toggle}
            <ul className='my-comments__list'>
                {(rows as MyCommentRow[]).map(row => {
                    const href = targetHref(row)
                    const targetName = row.targetType === 'profile'
                        ? row.author?.name
                        : row.poem?.title

                    return (
                        <li key={row.id} className='my-comments__item'>
                            <p className='my-comments__body'>{row.body}</p>
                            <p className='my-comments__meta'>
                                <span className='my-comments__preposition'>
                                    {row.targetType === 'profile' ? MY_COMMENTS_ON_PROFILE : MY_COMMENTS_ON_POEM}
                                </span>
                                {' '}
                                {href
                                    ? <Link href={href} className='my-comments__target'>{targetName}</Link>
                                    : <span className='my-comments__target'>{targetName}</span>}
                                {/* The poem's author, so a row identifies the
                                    poem the way the rest of the site does —
                                    two poems can share a title. */}
                                {row.targetType === 'poem' && row.poem?.author?.name && (
                                    <span className='my-comments__author'>
                                        {` by ${row.poem.author.name}`}
                                    </span>
                                )}
                                <time className='my-comments__time' dateTime={row.createdAt}>
                                    {notificationTimestamp({ updatedAt: row.createdAt } as never)}
                                </time>
                            </p>
                        </li>
                    )
                })}
            </ul>

            {cache?.isFetching && rows.length > 0 && <CircularProgress />}

            {cache?.hasMore && !cache?.isFetching && (
                <button type='button' className='my-comments__more' onClick={handleLoadMore}>
                    {MY_COMMENTS_LOAD_MORE}
                </button>
            )}
        </div>
    )
}
