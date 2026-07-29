import { useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useDetailPoem } from './hooks/useDetailPoem'
import { usePoemActions } from '../../hooks/usePoemActions'
import { PoemNotFound } from './components/PoemNotFound'
import { PoemContent } from './components/PoemContent'
import { PoemFooter } from './components/PoemFooter'
import CommentsSection, { COMMENTS_ANCHOR } from '../Comments/CommentsSection'
import { NextPoemCard } from './components/NextPoemCard'
import { useNextPoem, NextPoemResponse } from './hooks/useNextPoem'
import { Poem } from '../../typescript/interfaces'

interface DetailProps {
    initialPoem?: Poem
    initialNextPoem?: NextPoemResponse | null
}

function Detail({ initialPoem, initialNextPoem }: DetailProps) {
    const router = useRouter()
    const poemId = router.query.poemId as string
    const context = useContext(AppContext)
    const commentsSentinelRef = useRef<HTMLDivElement | null>(null)
    const wantsCommentsScroll = useRef(false)
    const [shouldLoadComments, setShouldLoadComments] = useState(false)
    const { poem, isLoading, isError, retry } = useDetailPoem(poemId, initialPoem)
    // Server answer first (SSR), upgraded after hydration to the neighbour in
    // whichever list cache the reader arrived from.
    const nextPoem = useNextPoem(poem.id, initialNextPoem)
    const { onLike, onDelete, onEdit } = usePoemActions({
        poem,
        context,
        onDeleteSuccess: () => router.push('/')
    })

    useEffect(() => {
        setShouldLoadComments(false)
    }, [poem.id])

    // The comments icon links to #comments, from a list or from this page. The
    // section is lazily mounted, so the browser's own anchor handling finds
    // nothing to scroll to and the link looks broken. Mount it on demand, then
    // scroll once it exists. `hashchange` covers the same-page click, which
    // does not re-run the mount effect.
    useEffect(() => {
        const jumpToComments = () => {
            if (window.location.hash !== `#${COMMENTS_ANCHOR}`) return
            wantsCommentsScroll.current = true
            setShouldLoadComments(true)
        }

        jumpToComments()
        window.addEventListener('hashchange', jumpToComments)
        return () => window.removeEventListener('hashchange', jumpToComments)
    }, [poem.id])

    // Scrolling is a separate effect on purpose: it has to run AFTER the section
    // is committed to the DOM. Doing it inside the handler above (even behind a
    // requestAnimationFrame) can fire before React commits, and then there is
    // nothing to scroll to.
    useEffect(() => {
        if (!shouldLoadComments || !wantsCommentsScroll.current) return
        wantsCommentsScroll.current = false
        document.getElementById(COMMENTS_ANCHOR)?.scrollIntoView({ block: 'start' })
    }, [shouldLoadComments])

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
                    {/* Above the comments, always: comments lazy-load and grow
                        unbounded, so anything below them is unreachable. */}
                    {nextPoem && <NextPoemCard target={nextPoem} />}
                    <div ref={commentsSentinelRef} className='poem__comments-sentinel' aria-hidden='true' />
                    {shouldLoadComments && <CommentsSection targetType='poem' targetId={poem.id} />}
                </main>
            )}
        </>
    )
}

export default Detail
