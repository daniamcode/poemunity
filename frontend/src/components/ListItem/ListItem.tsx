import '../List/List.scss'
import '../Detail/Detail.scss'
import '../../App.scss'
import normalizeString from '../../utils/normalizeString'
import { Poem, Context } from '../../typescript/interfaces'
import { PoemHeader, PoemContent, PoemFooter } from './components'
import { usePoemActions } from './hooks'

interface Props {
    poem: Poem
    filter: string
    context: Context
}

const ListItem = ({ poem, filter, context }: Props) => {
    const { onDelete, onLike, onEdit } = usePoemActions({ poem, context })

    // Determine if the current user can see like button (not their own poem)
    const showLikeButton = !!(context.user && poem.userId !== context.userId)

    // Determine if the user is liked this poem
    const isLiked = poem.likes?.some(id => id === context.userId) || false

    // Determine if the user is the owner or admin
    const isOwner = !!(context.user && (poem.userId === context.userId || context.userId === context.adminId))

    // Filter by author name
    if (!normalizeString(poem.author).includes(filter)) {
        return null
    }

    return (
        <main key={poem.id} className='poem__detail'>
            <section className='poem__block' id='poem__block'>
                <PoemHeader
                    poemId={poem.id}
                    title={poem.title}
                    author={poem.author}
                    picture={poem.picture}
                    date={poem.date}
                />
                <PoemContent poemId={poem.id} content={poem.poem} />
                <PoemFooter
                    poemId={poem.id}
                    likesCount={poem.likes?.length || 0}
                    isLiked={isLiked}
                    showLikeButton={showLikeButton}
                    isOwner={isOwner}
                    onLike={onLike}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            </section>
        </main>
    )
}

export default ListItem
