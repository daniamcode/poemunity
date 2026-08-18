import Link from 'next/link'
import { genreIntro } from '../../data/genreIntros'

interface GenreIntroProps {
    /** Route slug, e.g. `love`. */
    genre: string
    /** Human label, e.g. `Love` — already computed by the caller. */
    label: string
}

/**
 * The original editorial introduction above a genre's poem list.
 *
 * WHY IT IS ON PAGE 1 ONLY (enforced by the caller, not here): repeating 250
 * words of identical prose across all 125 pages of /love is boilerplate, and a
 * paginated set where every page shares most of its text is exactly the
 * near-duplicate shape the self-canonical pagination work exists to avoid. Page
 * 1 is the page that ranks for "love poems"; the rest are for crawling through.
 *
 * WHY IT IS HIDDEN DURING SEARCH (also the caller's job): a `?q=` URL is
 * `noindex` and shows a filtered subset, so an essay about the whole genre sits
 * above results it does not describe — and the SSR'd `?q=` page would otherwise
 * be 250 words of genre prose over three poems, which is the thin-content shape
 * rather than the fix for it.
 *
 * THE `startHere` LINKS ARE NOT DECORATION. Before this, a genre page linked to
 * exactly ten poem pages and nothing else, and poem pages linked onward to one
 * other poem — `docs/SEO_AUDIT.md` measured 16,087 poems arranged as a single
 * linked list. These add four author-page links per genre, chosen rather than
 * ranked, from a page that has some authority to pass.
 *
 * They point at AUTHOR pages deliberately. Poem slugs move when a title is
 * cleaned up (`fix-poem-capitalization.js`, `generate-slugs.js` both rewrite
 * them), and a hand-curated list is exactly the thing nobody remembers to
 * re-check; author slugs are derived from a name that does not change.
 * `genreIntros.test.ts` asserts every one of them resolves.
 */
export function GenreIntro({ genre, label }: GenreIntroProps) {
    const intro = genreIntro(genre)
    // Only 20 of 131 genres have one written, and that is the intended steady
    // state rather than a backlog — a genre with 9 poems does not need 250
    // words about it. No entry renders nothing at all.
    if (!intro) return null

    const headingId = 'genre-intro-heading'
    const [lead, ...rest] = intro.body

    return (
        <section className='genre-intro' aria-labelledby={headingId}>
            <h2 className='genre-intro__heading' id={headingId}>
                {intro.heading ?? `About ${label.toLowerCase()} poetry`}
            </h2>
            {/* THE LEAD IS ALWAYS VISIBLE; THE REST IS BEHIND A DISCLOSURE.
                Fully expanded, this block was 564px tall and pushed the first
                poem to y=766 — on a poetry site, an essay where the poems
                should be. The lead alone is ~150px, so a reader lands on
                context plus poems rather than on an essay. */}
            <p className='genre-intro__paragraph genre-intro__lead'>{lead}</p>

            {/* `<details>`, NOT React state.

                Everything inside is in the SERVER-RENDERED HTML — collapsed is
                a presentation state, not a fetch — which is the whole reason
                this is an acceptable place to put the one text on this site
                that exists nowhere else. Google indexes content inside
                expandable sections normally; content it has to run JS to
                obtain is a different and worse bet.

                And native rather than a state hook because a `useState` toggle
                does nothing until hydration: the button would be inert for the
                first moments on a slow connection, and inert-looking controls
                get clicked twice. `<details>` works with no JS at all, brings
                its own keyboard handling and `aria-expanded` semantics, and
                cannot desynchronise from a re-render. */}
            {rest.length > 0 && (
                <details className='genre-intro__more'>
                    <summary className='genre-intro__toggle'>
                        {/* Two labels swapped by CSS on [open], so the control
                            does not lie about what it will do once expanded —
                            with no JS to keep them in sync. */}
                        <span className='genre-intro__toggle-more'>Read more</span>
                        <span className='genre-intro__toggle-less'>Show less</span>
                    </summary>
                    {rest.map(paragraph => (
                        <p className='genre-intro__paragraph' key={paragraph.slice(0, 40)}>
                            {paragraph}
                        </p>
                    ))}
                    <div className='genre-intro__start'>
                        <h3 className='genre-intro__start-heading'>Start here</h3>
                        <ul className='genre-intro__start-list'>
                            {intro.startHere.map(poet => (
                                <li className='genre-intro__start-item' key={poet.slug}>
                                    <Link className='genre-intro__start-link' href={`/authors/${poet.slug}`}>
                                        {poet.name}
                                    </Link>
                                    <span className='genre-intro__start-note'> — {poet.note}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </details>
            )}
        </section>
    )
}

export default GenreIntro
