import { useContext, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { AppContext } from '../../App'
import { useAppDispatch } from '../../redux/store'
import type { RootState } from '../../redux/store'
import { getUserStatsAction } from '../../redux/actions/statsActions'
import { selectRanking } from '../../redux/selectors/authorCacheSelectors'
import {
    STATS_TITLE,
    STATS_POEMS_LABEL,
    STATS_LIKES_LABEL,
    STATS_RANK_LABEL,
    STATS_RANK_UNRANKED,
    STATS_EMPTY
} from '../../data/constants'

/**
 * The profile stats panel.
 *
 * THREE FIGURES AND NO FOURTH. The reference site this was modelled on breaks
 * points down by day / week / month / year — four unexplained decimals that
 * look like feedback and are not, and which would need time-bucketed
 * aggregation that does not exist here. Dropped on purpose; see TODO.md.
 *
 * Poems and likes are counted server-side (`GET /users/stats`). The rank is
 * read from the ranking cache the app already fetched for the public sidebar,
 * NOT from a second request — the two numbers are then the same number by
 * construction, instead of two aggregations that agree until one of them is
 * refetched.
 */
export default function ProfileStats() {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()

    const statsQuery = useSelector((state: RootState) => state.userStatsQuery)
    const ranking = useSelector(selectRanking)

    const userId = context?.userId
    const signedIn = Boolean(context?.user)

    useEffect(() => {
        if (signedIn) {
            dispatch(getUserStatsAction())
        }
    }, [signedIn, dispatch])

    if (!signedIn) return null

    const stats = statsQuery?.item

    // Renders nothing at all while loading or on error, rather than a spinner
    // or an error box: this is a supporting panel beside the profile form, and
    // three empty boxes cost more attention than the numbers are worth. The
    // same call the Poem of the week card makes.
    if (!stats) return null

    // `rank` is the 1-based position, or null when outside the ten rows the
    // ranking endpoint returns. Compared as strings because the ranking rows
    // carry the author id from the server while context holds it from the JWT.
    const rankIndex = ranking?.findIndex(row => String(row.userId) === String(userId)) ?? -1
    const rank = rankIndex >= 0 ? rankIndex + 1 : null

    const nothingYet = stats.poemsPublished === 0 && stats.likesReceived === 0

    return (
        <section className='profile-stats' aria-labelledby='profile-stats-title'>
            <h3 className='profile-stats__title' id='profile-stats-title'>
                {STATS_TITLE}
            </h3>

            {nothingYet ? (
                <p className='profile-stats__empty'>{STATS_EMPTY}</p>
            ) : (
                <dl className='profile-stats__list'>
                    <div className='profile-stats__item'>
                        <dt className='profile-stats__label'>{STATS_POEMS_LABEL}</dt>
                        <dd className='profile-stats__value'>{stats.poemsPublished}</dd>
                    </div>
                    <div className='profile-stats__item'>
                        <dt className='profile-stats__label'>{STATS_LIKES_LABEL}</dt>
                        <dd className='profile-stats__value'>{stats.likesReceived}</dd>
                    </div>
                    <div className='profile-stats__item'>
                        <dt className='profile-stats__label'>{STATS_RANK_LABEL}</dt>
                        <dd className='profile-stats__value'>
                            {rank !== null
                                ? (
                                    <>
                                        <span aria-hidden='true'>#{rank}</span>
                                        <span className='sr-only'>{`Number ${rank}`}</span>
                                    </>
                                )
                                : (
                                    <span className='profile-stats__value--muted'>
                                        {STATS_RANK_UNRANKED}
                                    </span>
                                )}
                        </dd>
                    </div>
                </dl>
            )}
        </section>
    )
}
