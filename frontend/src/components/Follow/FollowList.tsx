import { useEffect } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import type { RootState } from '../../redux/store'
import { AuthorAvatar } from '../ListItem/components/AuthorAvatar'
import { AiBadge } from '../common/AiBadge'
import CircularProgress from '../CircularIndeterminate'
import { getFollowersAction, getFollowingAction } from '../../redux/actions/followsActions'
import { selectFollowers, selectFollowing } from '../../redux/selectors/followCacheSelectors'
import { FOLLOW_LIST_LOAD_MORE } from '../../data/constants'

const PAGE_SIZE = 20

export type FollowDirection = 'followers' | 'following'

interface FollowListProps {
    /** Author id or slug whose graph is being listed. */
    idOrSlug: string
    direction: FollowDirection
    /** Shown when the list is loaded and empty. */
    emptyMessage: string
}

/**
 * One component for both tabs. The two lists differ only in which endpoint
 * fills them, and writing them separately is how they drift into two slightly
 * different empty states and two slightly different pagers.
 *
 * Rows resolve through `authorEntities`, so the AI badge is driven by the same
 * `type` field the poem lists and comments use — there is no second badge and
 * no second rule about when it appears. Following an AI persona is allowed;
 * showing one without the badge is what the disclosure exists to prevent.
 */
export default function FollowList({ idOrSlug, direction, emptyMessage }: FollowListProps) {
    const dispatch = useAppDispatch()
    const isFollowers = direction === 'followers'

    const cache = useSelector((state: RootState) =>
        (isFollowers ? state.followersQuery : state.followingQuery))
    const authors = useSelector(isFollowers ? selectFollowers : selectFollowing)

    useEffect(() => {
        if (!idOrSlug) return
        const action = isFollowers ? getFollowersAction : getFollowingAction
        dispatch(action({
            idOrSlug,
            params: { page: 1, limit: PAGE_SIZE },
            options: { reset: true, fetch: true }
        }))
    }, [dispatch, idOrSlug, isFollowers])

    const handleLoadMore = () => {
        if (cache?.isFetching || !cache?.hasMore) return
        const action = isFollowers ? getFollowersAction : getFollowingAction
        dispatch(action({
            idOrSlug,
            params: { page: (cache.page || 1) + 1, limit: PAGE_SIZE }
        }))
    }

    // Only a first load gets the spinner: paging keeps the rows on screen and
    // shows the spinner under them, so the list never jumps back to empty.
    const isFirstLoad = cache?.isFetching && authors.length === 0

    if (isFirstLoad) {
        return <CircularProgress />
    }

    if (authors.length === 0) {
        return <p className='follow-list__empty'>{emptyMessage}</p>
    }

    return (
        <div className='follow-list'>
            <ul className='follow-list__items'>
                {authors.map(author => (
                    <li key={author.id} className='follow-list__item'>
                        <Link
                            href={`/authors/${author.slug || author.id}`}
                            className='follow-list__link'
                        >
                            <AuthorAvatar name={author.name || ''} picture={author.picture || ''} />
                            <span className='follow-list__name'>{author.name}</span>
                        </Link>
                        <AiBadge authorType={author.type} />
                    </li>
                ))}
            </ul>
            {cache?.isFetching && <CircularProgress />}
            {cache?.hasMore && !cache?.isFetching && (
                <button type='button' className='follow-list__more' onClick={handleLoadMore}>
                    {FOLLOW_LIST_LOAD_MORE}
                </button>
            )}
        </div>
    )
}
