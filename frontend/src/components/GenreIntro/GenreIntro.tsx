import EditorialIntro from '../EditorialIntro/EditorialIntro'
import { genreIntro } from '../../data/genreIntros'

interface GenreIntroProps {
    /** Route slug, e.g. `love`. */
    genre: string
    /** Human label, e.g. `Love` — already computed by the caller. */
    label: string
}

/**
 * The genre page's editorial introduction — a data adapter over EditorialIntro,
 * which owns the disclosure, the SSR guarantees and the markup.
 *
 * WHERE IT RENDERS is the caller's job, not this component's, and each gate is
 * load-bearing: page 1 only (repeating 250 words across 125 paginated URLs is
 * boilerplate), never on `?q=` (that URL is noindex and shows a filtered subset
 * the essay does not describe), and never without a genre. See Dashboard.tsx.
 *
 * THE HEADING TEMPLATE FITS ONLY 20 OF THE 132 GENRES; the other 112 carry an
 * explicit `heading`. Two separate reasons, both worth knowing before adding a
 * genre. "About <x> poetry" needs <x> to read as a modifier — it works for
 * love, nature and war, and not for "About suicide poetry" or "About sister
 * poetry", which are the ones this shipped with. And `toLowerCase()` flattens
 * PROPER NOUNS: America, Christmas, Halloween and Thanksgiving all rendered
 * lowercase. The lowercase is still needed (capitalizeFirstLetter hands us
 * "Love", and "About Love poetry" is wrong), so the fix is per-genre data
 * rather than cleverer string handling.
 */
export function GenreIntro({ genre, label }: GenreIntroProps) {
    const intro = genreIntro(genre)
    // Eleven categories have none, and that is the intended steady state rather
    // than a backlog: they are the eleven holding ZERO poems, where prose would
    // be an essay over nothing.
    if (!intro) return null

    return (
        <EditorialIntro
            variant='genre'
            heading={intro.heading ?? `About ${label.toLowerCase()} poetry`}
            body={intro.body}
            linksHeading='Start here'
            links={intro.startHere.map(poet => ({
                href: `/authors/${poet.slug}`,
                label: poet.name,
                note: poet.note
            }))}
        />
    )
}

export default GenreIntro
