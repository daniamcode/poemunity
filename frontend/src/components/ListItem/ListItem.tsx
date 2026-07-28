import React from 'react'
import { useSelector } from 'react-redux'
import { Poem, Context } from '../../typescript/interfaces'
import type { RootState } from '../../redux/store'
import { selectAuthorEntityById } from '../../redux/reducers/authorEntitiesReducers'
import { PoemHeader, PoemContent, PoemFooter } from './components'
import { usePoemActions } from '../../hooks/usePoemActions'

interface Props {
    poem: Poem
    context: Context
}

const ListItem = React.memo(function ListItem({ poem, context }: Props) {
    const { onDelete, onLike, onEdit } = usePoemActions({ poem, context })

    // Author display fields are denormalized onto the poem, but the normalized
    // authors store is the source of truth. Prefer it when the author is known;
    // fall back to the poem's copied fields (SSR first paint / not-yet-fetched).
    const authorEntity = useSelector((state: RootState) => selectAuthorEntityById(state, poem.userId))
    const authorName = authorEntity?.name ?? poem.author
    const authorPicture = authorEntity?.picture ?? poem.picture
    const authorSlug = authorEntity?.slug ?? poem.authorSlug

    // Determine if the current user can see like button (not their own poem)
    const showLikeButton = !!(context.user && poem.userId !== context.userId)

    // Determine if the user is liked this poem
    const isLiked = poem.likes?.some(id => id === context.userId) || false

    // Determine if the user is the owner or admin
    const isOwner = !!(context.user && (poem.userId === context.userId || context.isAdmin))

    return (
        <main key={poem.id} className='poem__detail'>
            <section className='poem__block' id='poem__block'>
                <PoemHeader
                    poemId={poem.slug || poem.id}
                    title={poem.title}
                    author={authorName}
                    picture={authorPicture}
                    date={poem.date}
                    authorSlug={authorSlug}
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
})

export default ListItem
