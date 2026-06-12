import { useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useDetailPoem } from './hooks/useDetailPoem'
import { usePoemActions } from '../../hooks/usePoemActions'
import { PoemNotFound } from './components/PoemNotFound'
import { PoemContent } from './components/PoemContent'
import { PoemFooter } from './components/PoemFooter'
import CommentsSection from '../Comments/CommentsSection'
import { Poem } from '../../typescript/interfaces'

interface DetailProps {
    initialPoem?: Poem
}

function Detail({ initialPoem }: DetailProps) {
    const router = useRouter()
    const poemId = router.query.poemId as string
    const context = useContext(AppContext)
    const commentsSentinelRef = useRef<HTMLDivElement | null>(null)
    const [shouldLoadComments, setShouldLoadComments] = useState(false)
    const { poem, isLoading, isError, retry } = useDetailPoem(poemId, initialPoem)
    const { onLike, onDelete, onEdit } = usePoemActions({
        poem,
        context,
        onDeleteSuccess: () => router.push('/')
    })

    useEffect(() => {
        setShouldLoadComments(false)
    }, [poem.id])

    useEffect(() => {
        if (!poem.id || shouldLoadComments) return
        if (typeof IntersectionObserver === 'undefined') {
            setShouldLoadComments(true)
            return
        }

        const sentinel = commentsSentinelRef.current
        if (!sentinel) return

        const observer = new IntersectionObserver(
            entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    setShouldLoadComments(true)
                    observer.disconnect()
                }
            },
            {
                root: null,
                rootMargin: '400px',
                threshold: 0
            }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [poem.id, shouldLoadComments])

    if (isLoading) {
        return <CircularProgress />
    }

    if (isError) {
        return (
            <div className='detail__error' role='alert'>
                <p>Could not load this poem.</p>
                <button onClick={retry}>Try again</button>
            </div>
        )
    }

    return (
        <>
            {!poem.id ? (
                <PoemNotFound />
            ) : (
                <main className='poem__detail' data-testid='detail-component'>
                    <section className='poem__block'>
                        <PoemContent poem={poem} />
                        <br />
                        <PoemFooter poem={poem} context={context} onLike={onLike} onDelete={onDelete} onEdit={onEdit} />
                    </section>
                    <div ref={commentsSentinelRef} className='poem__comments-sentinel' aria-hidden='true' />
                    {shouldLoadComments && <CommentsSection targetType='poem' targetId={poem.id} />}
                </main>
            )}
        </>
    )
}

export default Detail
