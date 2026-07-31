import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { AppContext } from '../../App'
import ListItem from '../ListItem/ListItem'
import CircularProgress from '../CircularIndeterminate'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useAuthorPoems, InitialAuthorPoemsData } from './useAuthorPoems'
import API from '../../redux/actions/axiosInstance'
import { categoryToSlug, FOLLOWERS_LABEL, FOLLOWING_LABEL } from '../../data/constants'
import CommentsSection from '../Comments/CommentsSection'
import FollowButton from '../Follow/FollowButton'
import { useAppDispatch } from '../../redux/store'
import type { RootState } from '../../redux/store'
import { authorUpserted, selectAuthorEntityById } from '../../redux/reducers/authorEntitiesReducers'

export interface AuthorProfile {
    id?: string
    name: string
    slug?: string
    picture?: string
    type?: string
    bio?: string
    preferredGenres?: string[]
    surname?: string
    city?: string
    country?: string
    birthYear?: number
    gender?: string
    /**
     * Follow state, carried on the author profile response rather than fetched
     * separately — see the comment on GET /authors/:slug in the backend for
     * why. `isFollowing` is always present and reflects THIS viewer's session.
     */
    followerCount?: number
    followingCount?: number
    isFollowing?: boolean
}

interface AuthorDetailProps {
    initialPoems?: InitialAuthorPoemsData
    initialAuthor?: AuthorProfile | null
}

export default function AuthorDetail({ initialPoems, initialAuthor }: AuthorDetailProps) {
    const router = useRouter()
    const slug = router.query.slug as string
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()
    const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(initialAuthor ?? null)
    const authorId = authorProfile?.id
    // The counts and the follow state are read from the NORMALIZED store, not
    // from this component's copy of the profile, so a follow performed here and
    // one performed from a Following tab converge on the same record. The
    // profile response is the fallback for the first paint only — an effect
    // pushes it into the store immediately after.
    const authorEntity = useSelector((state: RootState) =>
        (authorId ? selectAuthorEntityById(state, authorId) : undefined))

    const { poems, isLoading, hasMore, total, handleLoadMore } = useAuthorPoems(slug, initialPoems)

    const authorName = authorProfile?.name
        || poems[0]?.authorName || poems[0]?.author
        || (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '')

    const sentinelRef = useInfiniteScroll({ onLoadMore: handleLoadMore, hasMore, isLoading })

    useEffect(() => {
        if (!slug) return
        const api = API({}, {})
        api.get(`/api/authors/${slug}`)
            .then(res => setAuthorProfile(res.data))
            .catch(() => {})
    }, [slug])

    // Seed the normalized store from the profile payload. `upsert` merges, so
    // this cannot blank the name/picture a poem fetch already wrote — and the
    // three follow fields are the only ones nothing else supplies.
    useEffect(() => {
        if (!authorProfile?.id) return
        dispatch(authorUpserted({
            id: authorProfile.id,
            name: authorProfile.name,
            slug: authorProfile.slug || slug,
            picture: authorProfile.picture,
            type: authorProfile.type as 'famous' | 'user' | 'ai' | undefined,
            followerCount: authorProfile.followerCount,
            followingCount: authorProfile.followingCount,
            isFollowing: authorProfile.isFollowing
        }))
    }, [dispatch, authorProfile, slug])

    const authorType = authorProfile?.type || poems[0]?.authorType
    const followerCount = authorEntity?.followerCount ?? authorProfile?.followerCount
    const followingCount = authorEntity?.followingCount ?? authorProfile?.followingCount
    const currentYear = new Date().getFullYear()
    const age = authorProfile?.birthYear ? currentYear - authorProfile.birthYear : null

    const metaParts = [
        age !== null && `${age} years old`,
        authorProfile?.city && authorProfile?.country
            ? `${authorProfile.city}, ${authorProfile.country}`
            : authorProfile?.city || authorProfile?.country,
        authorProfile?.gender
    ].filter(Boolean)

    return (
        <main className='author-detail'>
            <header className='author-detail__header'>
                <h1 className='author-detail__name'>
                    {authorName}
                    {authorProfile?.surname && <span className='author-detail__surname'> {authorProfile.surname}</span>}
                    {authorType === 'ai' && <span className='author-detail__ai-badge'> (AI generated)</span>}
                </h1>
                {metaParts.length > 0 && (
                    <p className='author-detail__meta'>{metaParts.join(' · ')}</p>
                )}

                {/* Counts render for everyone, signed in or not — they are
                    public facts about the poet. Only the BUTTON depends on the
                    session. They are omitted entirely until the profile has
                    loaded rather than shown as 0, because a 0 that turns into
                    412 is a wrong statement, not a loading state. */}
                {authorId && (
                    <div className='author-detail__follow'>
                        {followerCount !== undefined && followingCount !== undefined && (
                            <p className='author-detail__follow-counts'>
                                <span className='author-detail__follow-count'>
                                    <strong>{followerCount}</strong> {FOLLOWERS_LABEL}
                                </span>
                                <span className='author-detail__follow-count'>
                                    <strong>{followingCount}</strong> {FOLLOWING_LABEL}
                                </span>
                            </p>
                        )}
                        <FollowButton
                            authorId={authorId}
                            authorSlug={authorProfile?.slug || slug}
                            initialIsFollowing={authorProfile?.isFollowing}
                        />
                    </div>
                )}

                {authorProfile?.bio && (
                    <p className='author-detail__bio'>{authorProfile.bio}</p>
                )}
                {authorProfile?.preferredGenres && authorProfile.preferredGenres.length > 0 && (
                    <div className='author-detail__genres'>
                        {authorProfile.preferredGenres.map(genre => (
                            <Link key={genre} href={`/${categoryToSlug(genre)}`} className='author-detail__genre-tag'>
                                {genre}
                            </Link>
                        ))}
                    </div>
                )}
            </header>

            <div className='author-detail__poems'>
                {/* Heads the poem list rather than sitting up in the header: an
                    h2 above the bio would put the bio inside a section called
                    "35 poems". h1 stays the author's NAME — the page's subject
                    is the person, who also has a bio and genres; the poems are
                    one section of that. */}
                {total > 0 && (
                    <h2 className='author-detail__count'>
                        {total} {total === 1 ? 'poem' : 'poems'}
                    </h2>
                )}
                {poems.map(poem => (
                    <ListItem key={poem.id} poem={poem} context={context} />
                ))}
                {isLoading && <CircularProgress />}
                {!isLoading && poems.length === 0 && (
                    <p className='author-detail__empty'>No poems found for this author.</p>
                )}
                <div ref={sentinelRef} />
            </div>

            {authorProfile?.id && (
                <CommentsSection targetType='profile' targetId={authorProfile.id} />
            )}
        </main>
    )
}
