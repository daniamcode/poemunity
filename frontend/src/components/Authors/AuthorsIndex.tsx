import Link from 'next/link'
import { Author } from '../../typescript/interfaces'
import {
    AUTHOR_ORIGINS,
    DEFAULT_LETTER,
    DEFAULT_ORIGIN,
    buildAuthorsHref
} from '../../utils/authorsIndex'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const ORIGIN_LABELS: Record<string, string> = {
    all: 'All',
    famous: 'Famous',
    user: 'Users',
    ai: 'AI'
}

interface AuthorsIndexProps {
    /** Letters that have at least one author with poems. */
    initialLetters?: string[]
    initialAuthors?: Author[]
    letter?: string
    origin?: string
}

/**
 * The author index.
 *
 * THE LETTERS AND THE ORIGIN FILTER ARE LINKS, NOT BUTTONS. They used to be 26
 * `<button onClick>` handlers over client state, which meant there was no URL
 * anywhere on the site for "authors starting with B": the page server-rendered
 * letter A and the other 25 letters — 3,100-odd of the 3,364 author pages —
 * existed only after a click a crawler cannot perform.
 *
 * Being links also makes the whole component PROP-DRIVEN. Every letter and
 * filter is a real navigation that re-runs `getServerSideProps`, so there is no
 * client fetch, no seeding effect, and no window in which the store holds the
 * previous letter's authors while the URL names a different one. That window is
 * what the effect-seeded version had, and it is the same class of bug as
 * rendering nothing on the server — see `Authors.ssr.test.tsx`.
 */
export default function AuthorsIndex({
    initialLetters,
    initialAuthors,
    letter = DEFAULT_LETTER,
    origin = DEFAULT_ORIGIN
}: AuthorsIndexProps) {
    const authors = initialAuthors ?? []
    const availableLetters = initialLetters ?? []

    return (
        <main className='authors-index'>
            <h1 className='authors-index__title'>Authors</h1>

            <nav className='authors-index__origin-filter' aria-label='Filter authors by kind'>
                {AUTHOR_ORIGINS.map(value => {
                    const isActive = value === origin
                    return (
                        <Link
                            key={value}
                            className={`authors-index__origin-btn${isActive ? ' active' : ''}`}
                            // Changing the filter returns to A: the letters that
                            // hold authors differ per filter, so keeping the
                            // letter can land on one this filter has emptied.
                            href={buildAuthorsHref(DEFAULT_LETTER, value)}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            {ORIGIN_LABELS[value]}
                        </Link>
                    )
                })}
            </nav>

            <nav className='authors-index__alphabet' aria-label='Browse authors by letter'>
                {ALPHABET.map(entry => {
                    const hasAuthors = availableLetters.includes(entry)
                    const isActive = entry === letter
                    const activeClass = isActive ? ' active' : ''

                    // A letter with no authors is not a link and not a page —
                    // it would render a heading over nothing, which is the
                    // soft-404 shape the empty genres were fixed for.
                    if (!hasAuthors) {
                        return (
                            <span key={entry} className='authors-index__letter disabled' aria-disabled='true'>
                                {entry}
                            </span>
                        )
                    }

                    return (
                        <Link
                            key={entry}
                            className={`authors-index__letter${activeClass}`}
                            href={buildAuthorsHref(entry, origin)}
                            aria-current={isActive ? 'true' : undefined}
                        >
                            {entry}
                        </Link>
                    )
                })}
            </nav>

            <section className='authors-index__list'>
                {authors.map(author => (
                    <Link
                        key={author.slug}
                        className='authors-index__author'
                        href={`/authors/${author.slug}`}
                    >
                        <span className='authors-index__author-name'>{author.name}</span>
                        <span className='authors-index__author-count'>
                            {author.count} {author.count === 1 ? 'poem' : 'poems'}
                        </span>
                    </Link>
                ))}
                {authors.length === 0 && (
                    <p className='authors-index__empty'>No authors found for this letter.</p>
                )}
            </section>
        </main>
    )
}
