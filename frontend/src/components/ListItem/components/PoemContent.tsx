import { Link } from 'react-router-dom'
import { READ_MORE } from '../../../data/constants'

interface PoemContentProps {
    poemId: string
    content: string
}

export function PoemContent({ poemId, content }: PoemContentProps) {
    return (
        <section>
            <div className='poem__content poems__content'>{content}</div>
            <div className='poems__read-more'>
                <Link to={`/detail/${poemId}`} className='poems__read-more'>
                    {READ_MORE}
                </Link>
            </div>
        </section>
    )
}
