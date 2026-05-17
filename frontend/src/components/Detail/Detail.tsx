import { useContext } from 'react'
import { useRouter } from 'next/router'
import { AppContext } from '../../App'
import Disqus from 'disqus-react'
import CircularProgress from '../CircularIndeterminate'
import { useDetailPoem } from './hooks/useDetailPoem'
import { usePoemActions } from '../../hooks/usePoemActions'
import { PoemNotFound } from './components/PoemNotFound'
import { PoemContent } from './components/PoemContent'
import { PoemFooter } from './components/PoemFooter'
import { Poem } from '../../typescript/interfaces'

interface DetailProps {
    initialPoem?: Poem
}

function Detail({ initialPoem }: DetailProps) {
    const router = useRouter()
    const poemId = router.query.poemId as string
    const context = useContext(AppContext)
    const { poem, isLoading } = useDetailPoem(poemId, initialPoem)
    const { onLike, onDelete, onEdit } = usePoemActions({
        poem,
        context,
        onDeleteSuccess: () => router.push('/')
    })

    if (isLoading) {
        return <CircularProgress />
    }

    const disqusShortname = 'poemunity'
    const disqusConfig = {
        url: `${typeof window !== 'undefined' ? window.location.origin : ''}/detail/${poemId}`,
        identifier: poemId,
        title: poem.title || 'Poem'
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
                    <div className='article-container'>
                        <Disqus.DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
                    </div>
                </main>
            )}
        </>
    )
}

export default Detail
