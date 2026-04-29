import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { AuthorAvatar } from './AuthorAvatar'
import { slugify } from '../../../utils/urlUtils'

interface PoemHeaderProps {
    poemId: string
    title: string
    author: string
    picture: string
    date: string
}

export function PoemHeader({ poemId, title, author, picture, date }: PoemHeaderProps) {
    const authorSlug = slugify(author)

    return (
        <section>
            <Link to={`/detail/${poemId}`} className='poem__title'>
                {title}
            </Link>
            <div className='poem__author-container'>
                <Link to={`/authors/${authorSlug}`}>
                    <AuthorAvatar name={author} picture={picture} />
                </Link>
                <Link to={`/authors/${authorSlug}`} className='poem__author'>
                    {author}
                </Link>
            </div>
            <div className='poem__date'>{format(new Date(date), "MM/dd/yyyy HH:mm'h'")}</div>
        </section>
    )
}
