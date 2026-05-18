import { useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AppContext } from '../../App'
import ListItem from '../ListItem/ListItem'
import CircularProgress from '../CircularIndeterminate'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useAuthorPoems, InitialAuthorPoemsData } from './useAuthorPoems'
import API from '../../redux/actions/axiosInstance'
import { categoryToSlug } from '../../data/constants'
import CommentsSection from '../Comments/CommentsSection'

export interface AuthorProfile {
    id?: string
    name: string
    picture?: string
    type?: string
    bio?: string
    preferredGenres?: string[]
    surname?: string
    city?: string
    country?: string
    birthYear?: number
    gender?: string
}

interface AuthorDetailProps {
    initialPoems?: InitialAuthorPoemsData
    initialAuthor?: AuthorProfile | null
}

export default function AuthorDetail({ initialPoems, initialAuthor }: AuthorDetailProps) {
    const router = useRouter()
    const slug = router.query.slug as string
    const context = useContext(AppContext)
    const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(initialAuthor ?? null)

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

    const authorType = authorProfile?.type || poems[0]?.authorType
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
                {total > 0 && <p className='author-detail__count'>{total} poems</p>}

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
                {poems.map(poem => (
                    <ListItem key={poem.id} poem={poem} filter='' context={context} />
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
