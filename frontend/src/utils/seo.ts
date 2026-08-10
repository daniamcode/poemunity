import { Poem } from '../typescript/interfaces'

/**
 * Titles and descriptions for the two page types that list poems.
 *
 * Word order deliberately differs between them, because it mirrors how people
 * actually search: "love poems" is the phrase itself, so the count leads and the
 * phrase stays intact ("46 Love poems"); nobody searches "John Doe poems", they
 * search "poems by John Doe". Keyword-dense phrasing reads like a product
 * listing when the subject is a person.
 */

const SITE = 'Poemunity'

/**
 * A count is only worth showing when it says something. `0` reads worse than no
 * number at all, and `1 poems` reads worse still.
 */
function countPrefix(total: number): string {
    return total > 0 ? `${total} ` : ''
}

function poemWord(total: number): string {
    return total === 1 ? 'poem' : 'poems'
}

/**
 * "46 Love poems" · "1 Love poem" · "Love poems" when the genre is empty.
 *
 * Page 2 and beyond carry the page number, because they are separate indexable
 * URLs and 125 pages sharing one title is 125 pages Google reads as the same
 * page. Page 1 stays clean — the number would be noise on the URL people
 * actually search for and link to.
 */
export function genreTitle(label: string, total: number, page = 1): string {
    const base = `${countPrefix(total)}${label} ${poemWord(total)}`
    return page > 1 ? `${base} — page ${page}` : base
}

/**
 * "35 poems by John Doe" · "1 poem by John Doe" · "Poems by John Doe".
 *
 * Page 2 and beyond carry the page number for the same reason genre titles do:
 * they are separate self-canonical URLs, and nine pages sharing one title read
 * as nine copies of one page.
 */
export function authorTitle(name: string, total: number, page = 1): string {
    const prefix = countPrefix(total)
    const word = prefix ? poemWord(total) : 'Poems'
    const base = `${prefix}${word} by ${name}`
    return page > 1 ? `${base} — page ${page}` : base
}

/**
 * Names actual poems from the page, so each genre gets a genuinely different
 * description instead of one sentence with a word swapped. Near-duplicate
 * descriptions across a dozen genres are treated as low value and usually
 * rewritten by the search engine anyway.
 *
 * The samples come from data the page already fetched — no extra query.
 */
export function genreDescription(
    label: string,
    total: number,
    poems: Poem[] = [],
    page = 1,
    totalPages = 1
): string {
    const lower = label.toLowerCase()
    const opening = total > 0
        ? `Read ${total} ${lower} ${poemWord(total)} on ${SITE}`
        : `Read ${lower} poems on ${SITE}`

    const samples = poems
        .filter(poem => poem?.title && poem?.author)
        .slice(0, 2)
        .map(poem => `“${poem.title}” by ${poem.author}`)

    const middle = samples.length > 0 ? `, including ${samples.join(' and ')}` : ''

    // The sample poems already differ per page, so the description is not a
    // duplicate — but naming the page says so outright, and it is what a
    // searcher landing on page 7 needs to understand where they are.
    const tail = page > 1 ? ` Page ${page} of ${totalPages}.` : ''

    return `${opening}${middle}. Discover, like and share community poetry.${tail}`
}

/**
 * The count sentence leads and the bio follows, rather than the bio replacing
 * it: a bio that never mentions poetry would otherwise leave the description
 * with no indication that the page lists poems at all.
 *
 * Over-length text is cut by SeoHead, so the count survives truncation and the
 * bio is what gets clipped.
 */
export function authorDescription(
    name: string,
    total: number,
    bio?: string,
    page = 1,
    totalPages = 1
): string {
    const lead = total > 0
        ? `${total} ${poemWord(total)} by ${name} on ${SITE}.`
        : `Poems by ${name} on ${SITE}.`

    // Named outright rather than left to the bio, which is identical on every
    // page of an author — without this, pages 2..9 of a prolific poet carry a
    // description indistinguishable from page 1's.
    const tail = page > 1 ? ` Page ${page} of ${totalPages}.` : ''

    const trimmedBio = bio?.trim()
    return trimmedBio
        ? `${lead} ${trimmedBio}${tail}`
        : `${lead} Read, like and share their poetry.${tail}`
}

/**
 * "The Sound of Rain by Marta Ruiz" — deliberately NOT given a count or any
 * other decoration. People search a poem's title alongside its poet, so the
 * plain phrase is the strongest thing this title can be.
 */
export function poemTitle(title: string, author?: string): string {
    const name = title?.trim() || 'Poem'
    const by = author?.trim()
    return by ? `${name} by ${by}` : name
}

/** Longest a description can be before search engines start truncating it. */
const DESCRIPTION_LIMIT = 155

/**
 * The poem itself, flattened into one line.
 *
 * A poem is mostly line breaks, and they travel into the meta tag verbatim as
 * whitespace runs. Collapsing them is what turns the opening stanza into a
 * readable sentence. The cut then lands on a word boundary rather than mid-word,
 * which is the difference between "the moon misses the sun…" and "the moon miss…".
 */
export function poemDescription(text: string, fallback = ''): string {
    const flat = String(text || '').replace(/\s+/g, ' ').trim()
    if (!flat) return fallback
    if (flat.length <= DESCRIPTION_LIMIT) return flat

    const clipped = flat.slice(0, DESCRIPTION_LIMIT - 1)
    const lastSpace = clipped.lastIndexOf(' ')
    // A single unbroken run longer than the limit has no boundary to fall back
    // on, so keep the hard cut rather than returning nothing.
    return `${(lastSpace > 0 ? clipped.slice(0, lastSpace) : clipped).replace(/[,;:.\s]+$/, '')}…`
}
