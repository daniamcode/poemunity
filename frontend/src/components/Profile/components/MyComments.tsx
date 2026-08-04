import { useContext, useEffect } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { AppContext } from '../../../App'
import { useAppDispatch } from '../../../redux/store'
import type { RootState } from '../../../redux/store'
import { getMyCommentsAction } from '../../../redux/actions/myCommentsActions'
import { MyCommentRow } from '../../../redux/reducers/myCommentsReducers'
import CircularProgress from '../../CircularIndeterminate'
import {
    MY_COMMENTS_EMPTY,
    MY_COMMENTS_LOAD_MORE,
    MY_COMMENTS_ON_POEM,
    MY_COMMENTS_ON_PROFILE
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

export default function MyComments() {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()
    const cache = useSelector((state: RootState) => state.myCommentsQuery)
    const rows: MyCommentRow[] = cache?.item || []

    const signedIn = Boolean(context?.user)

    useEffect(() => {
        if (signedIn) {
            dispatch(getMyCommentsAction({ params: { page: 1 }, options: { reset: true, fetch: true } }))
        }
    }, [signedIn, dispatch])

    if (!signedIn) return null

    const handleLoadMore = () => {
        if (cache?.isFetching || !cache?.hasMore) return
        dispatch(getMyCommentsAction({ params: { page: (cache.page || 1) + 1 } }))
    }

    // The spinner is gated on having nothing yet, so paging in more rows does
    // not blank the list you are already reading.
    if (cache?.isFetching && rows.length === 0) return <CircularProgress />

    if (rows.length === 0) {
        return <p className='my-comments__empty'>{MY_COMMENTS_EMPTY}</p>
    }

    return (
        <div className='my-comments'>
            <ul className='my-comments__list'>
                {rows.map(row => {
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
