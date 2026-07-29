import Link from 'next/link'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { NextPoemTarget } from '../hooks/useNextPoem'

interface NextPoemCardProps {
    target: NextPoemTarget
}

// One label at every width. It used to vary by scope and viewport ("Next poem in
// Garden" / "In Garden"), which meant four strings, a CSS swap and a rule that
// the word "Next" must survive shortening — all of it explaining a distinction
// the reader never asked for. The walk is one rule now, so the label is one
// string.
const LABEL = 'Next poem'

export function NextPoemCard({ target }: NextPoemCardProps) {
    return (
        <nav aria-label='Poem navigation' className='next-poem'>
            {/* A real link, not a button + router.push: middle-click, cmd-click,
                "open in new tab" and crawlers all have to work. */}
            <Link
                href={target.href}
                className='next-poem__card'
                data-testid='next-poem-link'
                // The visible text is split across three spans; state the
                // accessible name once here instead of having it read piecemeal.
                aria-label={`${LABEL}: ${target.title} by ${target.author}`}
            >
                <span className='next-poem__body' aria-hidden='true'>
                    <span className='next-poem__scope'>{LABEL}</span>
                    <span className='next-poem__title'>{target.title}</span>
                    <span className='next-poem__author'>by {target.author}</span>
                </span>
                {/* Decorative: the label already says "Next". */}
                <ArrowForwardIcon className='next-poem__arrow' aria-hidden='true' />
            </Link>
        </nav>
    )
}
