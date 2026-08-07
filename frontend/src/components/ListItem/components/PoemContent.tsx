import Link from 'next/link'
import { READ_MORE } from '../../../data/constants'

interface PoemContentProps {
    poemId: string
    content: string
    /** Named in the link's accessible name — see below. */
    title?: string
}

export function PoemContent({ poemId, content, title }: PoemContentProps) {
    return (
        <section>
            <div className='poem__content poems__content'>{content}</div>
            <div className='poems__read-more'>
                {/* THE ACCESSIBLE NAME NAMES THE POEM.
                    A list page carries ten of these, and out of context every
                    one of them read "Read more" — which is what a screen reader
                    announces when it lists the links on a page, and what
                    Lighthouse flagged across eleven links. The visible text
                    stays "Read more": it sits directly under the poem, where
                    repeating the title would be noise.

                    `aria-label` must CONTAIN the visible text (WCAG 2.5.3,
                    Label in Name), or voice control users saying "click Read
                    more" no longer match the control. Hence "Read more of X"
                    rather than just the title. */}
                <Link
                    href={`/detail/${poemId}`}
                    className='poems__read-more'
                    aria-label={title ? `${READ_MORE} of “${title}”` : undefined}
                >
                    {READ_MORE}
                </Link>
            </div>
        </section>
    )
}
