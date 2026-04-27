import { useContext, useEffect } from 'react'
import { RouteComponentProps } from 'react-router-dom'
import { AppContext } from '../../App'
import ListItem from '../ListItem/ListItem'
import CircularProgress from '../CircularIndeterminate'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useAuthorPoems } from './useAuthorPoems'
import '../List/List.scss'
import './Authors.scss'

interface MatchParams {
    slug: string
}

export default function AuthorDetail({ match }: RouteComponentProps<MatchParams>) {
    const { slug } = match.params
    const context = useContext(AppContext)
    const authorName = slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

    const { poems, isLoading, hasMore, total, handleLoadMore } = useAuthorPoems(slug)

    const sentinelRef = useInfiniteScroll({ onLoadMore: handleLoadMore, hasMore, isLoading })

    useEffect(() => {
        document.title = `${authorName} - Poems | Poemunity`
    }, [authorName])

    return (
        <main className='author-detail'>
            <header className='author-detail__header'>
                <h1 className='author-detail__name'>{authorName}</h1>
                {total > 0 && <p className='author-detail__count'>{total} poems</p>}
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
