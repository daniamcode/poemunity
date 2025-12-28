import { useContext } from 'react'
import { AppContext } from '../../App'
import './Detail.scss'
import '../../App.scss'
import Disqus from 'disqus-react'
import CircularProgress from '../CircularIndeterminate'
import { Helmet } from 'react-helmet'
import { useDetailPoem } from './hooks/useDetailPoem'
import { usePoemActions } from './hooks/usePoemActions'
import { PoemNotFound } from './components/PoemNotFound'
import { PoemContent } from './components/PoemContent'
import { PoemFooter } from './components/PoemFooter'

interface Props {
    match: {
        params: {
            poemId: string
        }
    }
}

function Detail(props: Props) {
    const context = useContext(AppContext)
    const { poem, isLoading } = useDetailPoem(props.match.params.poemId)
    const { handleLike, handleDelete, handleEdit } = usePoemActions(props.match.params.poemId, context)

    if (isLoading) {
        return <CircularProgress />
    }

    const disqusShortname = 'poemunity'
    const disqusConfig = {
        url: `http://localhost:3000/detail/${props.match.params.poemId}`,
        identifier: `http://localhost:3000/detail/${props.match.params.poemId}`,
        title: 'Title of Your Article'
    }

    return (
        <>
            {!poem.id ? (
                <PoemNotFound />
            ) : (
                <main className='poem__detail'>
                    <Helmet>
                        <title>{`Poem: ${poem.title}`}</title>
                    </Helmet>
                    <section className='poem__block'>
                        <PoemContent poem={poem} />
                        <br />
                        <PoemFooter
                            poem={poem}
                            context={context}
                            onLike={handleLike}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />
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
