import Link from 'next/link'
import { NextPoemTarget } from '../hooks/useNextPoem'

interface NextPoemCardProps {
    target: NextPoemTarget
}

// Both label strings are always rendered and CSS picks one at $bp-md. Branching
// on viewport width in JS would produce different markup on the server and on
// the client, i.e. a hydration mismatch on every single detail page.
//
// The label always names the bucket the reader is ARRIVING in, so same-bucket
// and next-bucket share one formula — for same-bucket the destination's
// author/genre is the current one anyway. Only a wrap reads differently,
// because "you have come full circle" is the useful thing to say.
function labelsFor({ scope, dimension, author, genre }: NextPoemTarget): { wide: string, narrow: string } {
    if (scope === 'wrap') {
        return { wide: 'Starting over', narrow: 'Next poem' }
    }
    return dimension === 'author'
        ? { wide: `Next poem by ${author}`, narrow: `By ${author}` }
        : { wide: `Next poem in ${genre}`, narrow: `In ${genre}` }
}

export function NextPoemCard({ target }: NextPoemCardProps) {
    const { wide, narrow } = labelsFor(target)

    return (
        <nav aria-label='Poem navigation' className='next-poem'>
            {/* A real link, not a button + router.push: middle-click, cmd-click,
                "open in new tab" and crawlers all have to work. */}
            <Link
                href={target.href}
                className='next-poem__card'
                data-testid='next-poem-link'
                data-scope={target.scope}
                data-dimension={target.dimension}
                // Both label variants sit in the DOM, so the accessible name is
                // stated once here instead of being read twice.
                aria-label={`${wide}: ${target.title} by ${target.author}`}
            >
                <span className='next-poem__scope' aria-hidden='true'>
                    <span className='next-poem__scope-wide'>{wide}</span>
                    <span className='next-poem__scope-narrow'>{narrow}</span>
                </span>
                <span className='next-poem__title' aria-hidden='true'>{target.title}</span>
                <span className='next-poem__author' aria-hidden='true'>by {target.author}</span>
            </Link>
        </nav>
    )
}
