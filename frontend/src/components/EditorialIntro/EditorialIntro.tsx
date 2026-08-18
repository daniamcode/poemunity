import Link from 'next/link'

export interface EditorialLink {
    /** Href-relative target, e.g. `/authors/john-donne`. */
    href: string
    label: string
    /** One line on why. Not a biography. */
    note: string
}

interface EditorialIntroProps {
    heading: string
    /** Paragraphs of original prose. The FIRST stays visible; the rest collapse. */
    body: string[]
    linksHeading: string
    links: EditorialLink[]
    /** Distinguishes the genre and author instances for styling and testing. */
    variant: 'genre' | 'author'
}

/**
 * The editorial introduction shared by genre pages and author pages.
 *
 * WHY IT EXISTS AT ALL. 97.3% of this site's poems are scraped famous ones that
 * cannot outrank their own source (`docs/SEO_AUDIT.md`). Prose written here is
 * the only text on the site that exists nowhere else, and these two page types
 * are where it can do some good.
 *
 * WHY IT IS ONE COMPONENT. The disclosure below has four non-obvious decisions
 * in it, and they were all going to be copied verbatim into an author version.
 * A second copy is a second place to get them wrong.
 *
 * THE LEAD IS ALWAYS VISIBLE; THE REST IS BEHIND A DISCLOSURE. Fully expanded
 * on a genre page this block was 564px tall and pushed the first poem to y=766
 * — on a poetry site, an essay where the poems should be.
 *
 * `<details>`, NOT React state, for two reasons:
 *
 *   Everything inside is in the SERVER-RENDERED HTML. Collapsed is a
 *   presentation state, not a fetch, which is the whole reason a disclosure is
 *   an acceptable home for this text — Google indexes expandable content
 *   normally, but content it must run JS to obtain is a different and worse
 *   bet.
 *
 *   A `useState` toggle does nothing until hydration, so the control would be
 *   inert on a slow connection, and inert-looking controls get clicked twice.
 *   `<details>` works with no JS, brings its own keyboard handling and aria
 *   semantics, and cannot desynchronise from a re-render.
 *
 * The two toggle labels are swapped by CSS on `[open]`, so the control never
 * claims it will do the thing it has already done — with no JS to keep them in
 * sync.
 *
 * THE LINKS ARE NOT DECORATION. The audit measured a genre page linking to ten
 * poems and nothing else, and a poem page linking onward to exactly one other
 * poem — 16,087 poems arranged as a single linked list. These add curated,
 * chosen (not ranked) links from pages that have some authority to pass. They
 * point at AUTHOR pages in both variants because poem slugs move when a title
 * is cleaned up, and author slugs derive from a name that does not.
 */
export function EditorialIntro({ heading, body, linksHeading, links, variant }: EditorialIntroProps) {
    const headingId = `${variant}-intro-heading`
    const [lead, ...rest] = body

    return (
        <section className={`editorial-intro editorial-intro--${variant}`} aria-labelledby={headingId}>
            <h2 className='editorial-intro__heading' id={headingId}>{heading}</h2>
            <p className='editorial-intro__paragraph editorial-intro__lead'>{lead}</p>

            {rest.length > 0 && (
                <details className='editorial-intro__more'>
                    <summary className='editorial-intro__toggle'>
                        <span className='editorial-intro__toggle-more'>Read more</span>
                        <span className='editorial-intro__toggle-less'>Show less</span>
                    </summary>
                    {rest.map(paragraph => (
                        <p className='editorial-intro__paragraph' key={paragraph.slice(0, 40)}>
                            {paragraph}
                        </p>
                    ))}
                    <div className='editorial-intro__links'>
                        <h3 className='editorial-intro__links-heading'>{linksHeading}</h3>
                        <ul className='editorial-intro__links-list'>
                            {links.map(link => (
                                <li className='editorial-intro__links-item' key={link.href}>
                                    <Link className='editorial-intro__link' href={link.href}>{link.label}</Link>
                                    <span className='editorial-intro__link-note'> — {link.note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            )}
        </section>
    )
}

export default EditorialIntro
