import { useContext, useState } from 'react'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { AppContext } from '../../App'
import { useAppDispatch } from '../../redux/store'
import type { RootState } from '../../redux/store'
import { selectAuthorEntityById } from '../../redux/reducers/authorEntitiesReducers'
import { followAuthorAction, unfollowAuthorAction } from '../../redux/actions/followsActions'
import { FOLLOW, FOLLOWING_STATE, UNFOLLOW, FOLLOW_LOGGED_OUT_TITLE } from '../../data/constants'

interface FollowButtonProps {
    /** The author's id — the key of the normalized record this button reflects. */
    authorId?: string
    /** The author's slug, used for the URL. Falls back to the id. */
    authorSlug?: string
    /**
     * The value the page was server-rendered with. Used only until the entity
     * store has an answer of its own: the store is empty on first paint (it is
     * seeded by an effect), so reading it alone would render "Follow" for a
     * poet you already follow and then flip a moment later.
     */
    initialIsFollowing?: boolean
}

export default function FollowButton({ authorId, authorSlug, initialIsFollowing }: FollowButtonProps) {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()
    const [pending, setPending] = useState(false)
    const entity = useSelector((state: RootState) =>
        (authorId ? selectAuthorEntityById(state, authorId) : undefined))

    if (!authorId) {
        return null
    }

    // Your own page has no Follow button. The server rejects a self-follow with
    // a 400 anyway; rendering a control whose only outcome is an error is worse
    // than rendering nothing.
    if (context?.userId && context.userId === authorId) {
        return null
    }

    // Logged out: a real control that routes to /login, rather than nothing.
    // Hiding it hides the affordance entirely, so a visitor never learns the
    // site has following at all — and the counts beside it then look like
    // decoration. Sending them to /login preserves the intent they expressed by
    // clicking, which a disabled button does not.
    if (!context?.user) {
        return (
            <Link
                href='/login'
                className='follow-button follow-button--guest'
                title={FOLLOW_LOGGED_OUT_TITLE}
            >
                {FOLLOW}
            </Link>
        )
    }

    const isFollowing = entity?.isFollowing ?? initialIsFollowing ?? false
    const idOrSlug = authorSlug || authorId

    const handleClick = () => {
        if (pending) return
        setPending(true)
        const action = isFollowing ? unfollowAuthorAction : followAuthorAction
        dispatch(action({
            idOrSlug,
            authorId,
            context: { config: context.config },
            callbacks: {
                success: () => setPending(false),
                error: () => setPending(false)
            }
        }))
    }

    return (
        <button
            type='button'
            className={`follow-button${isFollowing ? ' follow-button--following' : ''}`}
            onClick={handleClick}
            disabled={pending}
            // The accessible name is the ACTION, always — a screen reader user
            // navigating by button list needs to know what pressing it does, and
            // "Following" alone reads as a status, not a control. The visible
            // label still shows the state (see the constants).
            aria-label={isFollowing ? UNFOLLOW : FOLLOW}
            aria-pressed={isFollowing}
        >
            <span className='follow-button__label' aria-hidden='true'>
                {isFollowing ? FOLLOWING_STATE : FOLLOW}
            </span>
            <span className='follow-button__hover-label' aria-hidden='true'>
                {isFollowing ? UNFOLLOW : FOLLOW}
            </span>
        </button>
    )
}
