import Link from 'next/link'
import { format } from 'date-fns'
import { Poem } from '../../../typescript/interfaces'
import { AuthorAvatar } from '../../ListItem/components/AuthorAvatar'
import { AiBadge } from '../../common/AiBadge'
import { slugify } from '../../../utils/urlUtils'

interface PoemContentProps {
    poem: Poem
}

export function PoemContent({ poem }: PoemContentProps) {
    const authorSlug = poem.authorSlug || slugify(poem.author)

    return (
        <>
            <section>
                {/* h1, not h2: on a poem's own page the poem's title IS the
                    top-level heading. It was an h2 with no h1 anywhere above it,
                    which left the page's most important element outranked by
                    nothing. Styling is unchanged. */}
                <h1 className='poem__title'>{poem.title}</h1>
                <div className='poem__author-container'>
                    <Link href={`/authors/${authorSlug}`}>
                        <AuthorAvatar name={poem.author} picture={poem.picture} />
                    </Link>
                    <Link href={`/authors/${authorSlug}`} className='poem__author'>
                        {poem.author}
                    </Link>
                    <AiBadge authorType={poem.authorType} />
                </div>
                {poem.date && <div className='poem__date'>{format(new Date(poem.date), "MM/dd/yyyy HH:mm'h'")}</div>}
            </section>
            <section>
                <div className='poem__content'>{poem.poem}</div>
            </section>
        </>
    )
}
