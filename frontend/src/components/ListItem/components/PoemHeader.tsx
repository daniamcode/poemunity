import Link from 'next/link'
import { format } from 'date-fns'
import { AuthorAvatar } from './AuthorAvatar'
import { slugify } from '../../../utils/urlUtils'

interface PoemHeaderProps {
    poemId: string
    title: string
    author: string
    picture: string
    date: string
    authorSlug?: string
}

export function PoemHeader({ poemId, title, author, picture, date, authorSlug: authorSlugProp }: PoemHeaderProps) {
    const authorSlug = authorSlugProp || slugify(author)

    return (
        <section>
            <Link href={`/detail/${poemId}`} className='poem__title'>
                {title}
            </Link>
            <div className='poem__author-container'>
                <Link href={`/authors/${authorSlug}`}>
                    <AuthorAvatar name={author} picture={picture} />
                </Link>
                <Link href={`/authors/${authorSlug}`} className='poem__author'>
                    {author}
                </Link>
            </div>
            <div className='poem__date'>{format(new Date(date), "MM/dd/yyyy HH:mm'h'")}</div>
        </section>
    )
}
