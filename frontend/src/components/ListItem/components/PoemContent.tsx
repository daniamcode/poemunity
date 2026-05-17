import Link from 'next/link'
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
                <Link href={`/detail/${poemId}`} className='poems__read-more'>
                    {READ_MORE}
                </Link>
            </div>
        </section>
    )
}
