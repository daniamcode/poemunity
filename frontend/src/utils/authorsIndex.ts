/**
 * URLs for the author index (`/authors?letter=B&origin=famous`).
 *
 * The alphabet used to be 26 `<button onClick>` handlers, so there was NO URL
 * anywhere on the site for "authors starting with B" — the index server-rendered
 * letter A and every other letter existed only as client state. 3,364 author
 * pages, and 3,100-odd of them sat behind a click a crawler cannot perform.
 */

export const LETTER_PARAM = 'letter'
export const ORIGIN_PARAM = 'origin'

/** Letter A is the CLEAN URL, the same rule `?page=1` follows. */
export const DEFAULT_LETTER = 'A'
export const DEFAULT_ORIGIN = 'all'

export const AUTHOR_ORIGINS = ['all', 'famous', 'user', 'ai'] as const
export type AuthorOrigin = (typeof AUTHOR_ORIGINS)[number]

export type ParsedLetter =
    | { kind: 'ok', letter: string }
    /** Absent, `?letter=A`, or junk — all answered by redirecting to `/authors`. */
    | { kind: 'redirect' }

/**
 * A single A-Z letter, uppercased.
 *
 * Lowercase is a REDIRECT rather than a silent uppercase, because `?letter=b`
 * and `?letter=B` would otherwise be two URLs listing the same authors — the
 * same duplication `/LOVE` → `/love` exists to prevent. Anything that is not one
 * ASCII letter redirects too; the index only ever offers A-Z, so a longer or
 * non-alphabetic value is not a page anyone can navigate to.
 */
export function parseLetterParam(value: unknown): ParsedLetter {
    if (typeof value !== 'string' || value === '') return { kind: 'redirect' }
    if (!/^[A-Z]$/.test(value)) return { kind: 'redirect' }
    if (value === DEFAULT_LETTER) return { kind: 'redirect' }
    return { kind: 'ok', letter: value }
}

/** An unknown origin falls back to `all` rather than 404ing — it only filters. */
export function parseOriginParam(value: unknown): AuthorOrigin {
    return (AUTHOR_ORIGINS as readonly string[]).includes(value as string)
        ? (value as AuthorOrigin)
        : DEFAULT_ORIGIN
}

/** Both defaults are omitted, so one view of the index has one address. */
export function buildAuthorsHref(letter: string, origin: string = DEFAULT_ORIGIN): string {
    const params = new URLSearchParams()
    if (letter && letter !== DEFAULT_LETTER) params.set(LETTER_PARAM, letter)
    if (origin && origin !== DEFAULT_ORIGIN) params.set(ORIGIN_PARAM, origin)

    const qs = params.toString()
    return qs ? `/authors?${qs}` : '/authors'
}
