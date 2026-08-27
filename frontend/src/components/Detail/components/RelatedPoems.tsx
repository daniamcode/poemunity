import Link from 'next/link'
import { AiBadge } from '../../common/AiBadge'
import { categoryToSlug, slugToCategory } from '../../../data/constants'
import { RelatedPoem, RelatedPoemsResponse } from '../hooks/useRelatedPoems'
import { poemHref } from '../hooks/useNextPoem'

interface RelatedPoemsProps {
    related: RelatedPoemsResponse
    /** Display name of the poem's author, for the "More by …" heading. */
    authorName?: string
    /** The current poem's genre, as stored (a slug for anything recent). */
    genre?: string
    /** Slug of the poem's author, for the "all poems by" link. Omitted for the legacy poems that have none. */
    authorSlug?: string
    /**
     * Href of the Next-poem card, dropped from both lists.
     *
     * The walk continues with the SAME author, so its destination is normally
     * the newest of "More by this author" — which put the identical title twice
     * on screen, four lines apart, as though they were different poems. Found
     * by looking at the page; no test would have called it wrong.
     */
    excludeHref?: string
}

interface RelatedListProps {
    id: string
    heading: string
    poems: RelatedPoem[]
    /** Where "See all" goes. Omitted when there is no page to send the reader to. */
    seeAllHref?: string
    seeAllLabel?: string
    /** Whether to name the author under each title — pointless when they are all the same poet. */
    showAuthor: boolean
}

function RelatedList({ id, heading, poems, seeAllHref, seeAllLabel, showAuthor }: RelatedListProps) {
    if (poems.length === 0) return null

    return (
        <section className='related-poems__group' aria-labelledby={id}>
            <h2 className='related-poems__heading' id={id}>{heading}</h2>
            <ul className='related-poems__list'>
                {poems.map(poem => (
                    <li key={poem.id} className='related-poems__item'>
                        {/* A real <Link>, not a click handler: middle-click,
                            cmd-click and crawlers all have to work — the crawler
                            being the entire point of this module. */}
                        <Link
                            href={poemHref(poem)}
                            className='related-poems__link'
                            // The title alone is the accessible name when every
                            // poem is by the same author; naming them all "by
                            // Emily Dickinson" adds nothing to a screen reader.
                            aria-label={showAuthor && poem.author ? `${poem.title} by ${poem.author}` : undefined}
                        >
                            <span className='related-poems__title'>{poem.title}</span>
                            {showAuthor && poem.author && (
                                <span className='related-poems__author' aria-hidden='true'>by {poem.author}</span>
                            )}
                        </Link>
                        {/* Renders nothing for a human author, so it is safe
                            unconditionally — and it belongs on every surface
                            that names an author, or the disclosure depends on
                            which page you happen to be reading. */}
                        {showAuthor && <AiBadge authorType={poem.authorType} />}
                    </li>
                ))}
            </ul>
            {seeAllHref && (
                <Link href={seeAllHref} className='related-poems__see-all'>{seeAllLabel}</Link>
            )}
        </section>
    )
}

/**
 * Two short lists under a poem: more by its author, more in its genre.
 *
 * WHY THIS EXISTS. A poem page used to carry exactly ONE outbound link to
 * another poem — the next-poem card — so 16,087 poems formed a single linked
 * list and reaching the nth cost n clicks. A crawl from the homepage following
 * only server-rendered links reached 11% of the poems within five clicks, which
 * is a large part of why 17,349 URLs sit in Search Console as "Discovered —
 * currently not indexed". It is a reader improvement first: the obvious next
 * thing to read after a Dickinson poem is another Dickinson poem, and until now
 * the site did not offer one.
 *
 * Rendered ABOVE the comments sentinel for the same reason the next-poem card
 * is: comments lazy-load and grow unbounded, so anything below them is
 * effectively unreachable — and a link nobody reaches is not a link.
 *
 * Renders NOTHING when both lists are empty. A heading over no poems is the
 * shape Google files as a soft 404, and a reader gains nothing from being told
 * that a poet has written only this.
 */
export function RelatedPoems({ related, authorName, genre, authorSlug, excludeHref }: RelatedPoemsProps) {
    const notTheNextPoem = (poem: RelatedPoem) => !excludeHref || poemHref(poem) !== excludeHref
    const byAuthor = related.byAuthor.filter(notTheNextPoem)
    const byGenre = related.byGenre.filter(notTheNextPoem)
    if (byAuthor.length === 0 && byGenre.length === 0) return null

    // The database stores genres in slug form for anything recent, and display
    // form for parts of the scraped corpus. slugToCategory returns its input
    // unchanged when it recognises neither, so an unknown genre still reads as
    // itself rather than as an empty heading.
    const genreLabel = genre ? slugToCategory(genre) : ''

    return (
        <aside className='related-poems' aria-label='Related poems'>
            <RelatedList
                id='related-by-author'
                heading={authorName ? `More by ${authorName}` : 'More by this poet'}
                poems={byAuthor}
                // Every poem here is by the same person named in the heading.
                showAuthor={false}
                seeAllHref={authorSlug ? `/authors/${authorSlug}` : undefined}
                seeAllLabel={authorName ? `All poems by ${authorName}` : 'All poems by this poet'}
            />
            <RelatedList
                id='related-by-genre'
                heading={genreLabel ? `More ${genreLabel} poems` : 'More poems'}
                poems={byGenre}
                showAuthor
                seeAllHref={genre ? `/${categoryToSlug(genre)}` : undefined}
                seeAllLabel={genreLabel ? `All ${genreLabel} poems` : 'All poems'}
            />
        </aside>
    )
}

export default RelatedPoems
