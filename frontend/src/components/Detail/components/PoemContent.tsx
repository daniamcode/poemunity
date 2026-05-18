import Link from 'next/link'
import { format } from 'date-fns'
import { Poem } from '../../../typescript/interfaces'
import { AuthorAvatar } from '../../ListItem/components/AuthorAvatar'
import { slugify } from '../../../utils/urlUtils'

interface PoemContentProps {
    poem: Poem
}

export function PoemContent({ poem }: PoemContentProps) {
    const authorSlug = poem.authorSlug || slugify(poem.author)

    return (
        <>
            <section>
                <h2 className='poem__title'>{poem.title}</h2>
                <div className='poem__author-container'>
                    <Link href={`/authors/${authorSlug}`}>
                        <AuthorAvatar name={poem.author} picture={poem.picture} />
                    </Link>
                    <Link href={`/authors/${authorSlug}`} className='poem__author'>
                        {poem.author}
                    </Link>
                </div>
                {poem.date && <div className='poem__date'>{format(new Date(poem.date), "MM/dd/yyyy HH:mm'h'")}</div>}
            </section>
            <section>
                <div className='poem__content'>{poem.poem}</div>
            </section>
        </>
    )
}
