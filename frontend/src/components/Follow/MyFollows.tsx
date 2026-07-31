import { useContext } from 'react'
import { AppContext } from '../../App'
import FollowList from './FollowList'
import { FOLLOWING_EMPTY, FOLLOWERS_EMPTY } from '../../data/constants'

// The profile tabs. They address the graph by the signed-in user's ID, not by a
// slug, because the session carries identity only — the JWT has `id` and
// `username` and no slug at all. That is why the endpoints resolve id-or-slug.
//
// Both lists are PUBLIC data (they are the same rows anyone sees on the poet's
// author page), so nothing here is a privacy surface; the tabs exist because
// this is where a user looks for their own.

export function MyFollowing() {
    const context = useContext(AppContext)
    if (!context?.userId) return null
    return <FollowList idOrSlug={context.userId} direction='following' emptyMessage={FOLLOWING_EMPTY} />
}

export function MyFollowers() {
    const context = useContext(AppContext)
    if (!context?.userId) return null
    return <FollowList idOrSlug={context.userId} direction='followers' emptyMessage={FOLLOWERS_EMPTY} />
}
