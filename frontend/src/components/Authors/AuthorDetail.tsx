import { useContext, useEffect, useState } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { AppContext } from '../../App'
import ListItem from '../ListItem/ListItem'
import CircularProgress from '../CircularIndeterminate'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useAuthorPoems } from './useAuthorPoems'
import API from '../../redux/actions/axiosInstance'
import '../List/List.scss'
import './Authors.scss'

interface MatchParams {
    slug: string
}

interface AuthorProfile {
    name: string
    picture?: string
    type?: string
    bio?: string
    preferredGenres?: string[]
}

export default function AuthorDetail({ match }: RouteComponentProps<MatchParams>) {
    const { slug } = match.params
    const context = useContext(AppContext)
    const [authorProfile, setAuthorProfile] = useState<AuthorProfile | null>(null)

    const { poems, isLoading, hasMore, total, handleLoadMore } = useAuthorPoems(slug)

    const authorName = authorProfile?.name
        || poems[0]?.authorName || poems[0]?.author
        || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    const sentinelRef = useInfiniteScroll({ onLoadMore: handleLoadMore, hasMore, isLoading })

    useEffect(() => {
        document.title = `${authorName} - Poems | Poemunity`
    }, [authorName])

    useEffect(() => {
        if (!slug) return
        const api = API({}, {})
        api.get(`/api/authors/${slug}`)
            .then(res => setAuthorProfile(res.data))
            .catch(() => {})
    }, [slug])

    const authorType = authorProfile?.type || poems[0]?.authorType

    return (
        <main className='author-detail'>
            <header className='author-detail__header'>
                <h1 className='author-detail__name'>
                    {authorName}
                    {authorType === 'ai' && <span className='author-detail__ai-badge'> (AI generated)</span>}
                </h1>
                {total > 0 && <p className='author-detail__count'>{total} poems</p>}

                {authorProfile?.bio && (
                    <p className='author-detail__bio'>{authorProfile.bio}</p>
                )}
                {authorProfile?.preferredGenres && authorProfile.preferredGenres.length > 0 && (
                    <div className='author-detail__genres'>
                        {authorProfile.preferredGenres.map(genre => (
                            <span key={genre} className='author-detail__genre-tag'>{genre}</span>
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
        </main>
    )
}
