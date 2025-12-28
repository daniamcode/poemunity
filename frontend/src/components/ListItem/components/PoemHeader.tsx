import { Link } from 'react-router-dom'
import { format } from 'date-fns'

interface PoemHeaderProps {
    poemId: string
    title: string
    author: string
    picture: string
    date: string
}

export function PoemHeader({ poemId, title, author, picture, date }: PoemHeaderProps) {
    return (
        <section>
            <Link to={`/detail/${poemId}`} className='poem__title'>
                {title}
            </Link>
            <div className='poem__author-container'>
                <img className='poem__picture' src={picture} alt={author} />
                <p className='poem__author'>{author}</p>
            </div>
            <div className='poem__date'>{format(new Date(date), "MM/dd/yyyy HH:mm'h'")}</div>
        </section>
    )
}
