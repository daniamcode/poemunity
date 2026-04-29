import { format } from 'date-fns'
import { Poem } from '../../../typescript/interfaces'
import { AuthorAvatar } from '../../ListItem/components/AuthorAvatar'

interface PoemContentProps {
    poem: Poem
}

export function PoemContent({ poem }: PoemContentProps) {
    return (
        <>
            <section>
                <h2 className='poem__title'>{poem.title}</h2>
                <div className='poem__author-container'>
                    <AuthorAvatar name={poem.author} picture={poem.picture} />
                    <p className='poem__author'>{poem.author}</p>
                </div>
                <div className='poem__date'>{format(new Date(poem.date), "MM/dd/yyyy HH:mm'h'")}</div>
            </section>
            <section>
                <div className='poem__content'>{poem.poem}</div>
            </section>
        </>
    )
}
