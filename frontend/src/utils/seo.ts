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

/** "46 Love poems" · "1 Love poem" · "Love poems" when the genre is empty. */
export function genreTitle(label: string, total: number): string {
    return `${countPrefix(total)}${label} ${poemWord(total)}`
}

/** "35 poems by John Doe" · "1 poem by John Doe" · "Poems by John Doe". */
export function authorTitle(name: string, total: number): string {
    const prefix = countPrefix(total)
    const word = prefix ? poemWord(total) : 'Poems'
    return `${prefix}${word} by ${name}`
}

/**
 * Names actual poems from the page, so each genre gets a genuinely different
 * description instead of one sentence with a word swapped. Near-duplicate
 * descriptions across a dozen genres are treated as low value and usually
 * rewritten by the search engine anyway.
 *
 * The samples come from data the page already fetched — no extra query.
 */
export function genreDescription(label: string, total: number, poems: Poem[] = []): string {
    const lower = label.toLowerCase()
    const opening = total > 0
        ? `Read ${total} ${lower} ${poemWord(total)} on ${SITE}`
        : `Read ${lower} poems on ${SITE}`

    const samples = poems
        .filter(poem => poem?.title && poem?.author)
        .slice(0, 2)
        .map(poem => `“${poem.title}” by ${poem.author}`)

    const middle = samples.length > 0 ? `, including ${samples.join(' and ')}` : ''

    return `${opening}${middle}. Discover, like and share community poetry.`
}

/**
 * The count sentence leads and the bio follows, rather than the bio replacing
 * it: a bio that never mentions poetry would otherwise leave the description
 * with no indication that the page lists poems at all.
 *
 * Over-length text is cut by SeoHead, so the count survives truncation and the
 * bio is what gets clipped.
 */
export function authorDescription(name: string, total: number, bio?: string): string {
    const lead = total > 0
        ? `${total} ${poemWord(total)} by ${name} on ${SITE}.`
        : `Poems by ${name} on ${SITE}.`

    const trimmedBio = bio?.trim()
    return trimmedBio ? `${lead} ${trimmedBio}` : `${lead} Read, like and share their poetry.`
}
