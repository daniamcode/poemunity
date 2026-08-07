/**
 * Paginated list URLs (`?page=N`).
 *
 * The lists load with infinite scroll, which no crawler performs — so a genre
 * page exposed exactly the 10 poems it server-rendered and poems 11..1,247 had
 * no URL that reached them at all. `?page=` was accepted by nobody: the genre
 * route hardcoded `page: 1`, so `/love?page=2` returned byte-identical poems to
 * `/love`. Of 16,087 poems, a crawl from the homepage reached 11% within five
 * clicks.
 *
 * Infinite scroll stays. This adds the URLs underneath it.
 */

export const PAGE_PARAM = 'page'

/**
 * Page 1 is the CLEAN URL, never `?page=1`.
 *
 * Both would render the same poems, and two URLs for one page of results is
 * exactly the duplication the canonical rules elsewhere exist to prevent. The
 * server redirects `?page=1` rather than rendering it, so only one of the two
 * ever answers 200.
 */
export function buildPageHref(
    basePath: string,
    page: number,
    query: Record<string, string | undefined> = {}
): string {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        if (value) params.set(key, value)
    }
    if (page > 1) params.set(PAGE_PARAM, String(page))

    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
}

export type ParsedPage =
    /** A usable page number. */
    | { kind: 'ok', page: number }
    /** Absent, `?page=1`, or junk — all answered by redirecting to the clean URL. */
    | { kind: 'redirect' }

/**
 * What `?page=` means, before any data is fetched.
 *
 * Junk (`?page=abc`, `?page=0`, `?page=-3`, `?page=1.5`) is a REDIRECT to the
 * clean URL, not a 404 and not a silent fallback to page 1. Silently rendering
 * page 1 is what the genre route used to do, and it mints a limitless supply of
 * distinct URLs all serving the same poems. A redirect collapses them onto the
 * one URL that should exist.
 *
 * Out-of-range (`?page=9999` of 125) cannot be judged here — it needs the total
 * — and is a 404 at the call site, for the same reason: an in-range-looking page
 * that renders an empty list is a soft 404, and there are infinitely many.
 */
export function parsePageParam(value: unknown): ParsedPage {
    if (value === undefined || value === null || value === '') return { kind: 'redirect' }
    if (Array.isArray(value)) return { kind: 'redirect' }

    const raw = String(value)
    // `Number()` alone accepts '1.5', ' 2 ', '0x3' and '1e3'; each would be a
    // separate URL serving a page it does not name.
    if (!/^[1-9]\d*$/.test(raw)) return { kind: 'redirect' }

    const page = Number(raw)
    if (page === 1) return { kind: 'redirect' }
    return { kind: 'ok', page }
}

/** Total pages for a result count, at least 1 so an empty list still has page 1. */
export function pageCount(total: number, limit: number): number {
    if (!Number.isFinite(total) || total <= 0) return 1
    return Math.max(1, Math.ceil(total / limit))
}

/**
 * The page numbers to render as links, with `null` marking an elided run.
 *
 * A windowed list rather than prev/next alone: with only prev/next, page 125 of
 * a genre sits 124 hops from page 1 and no crawler walks that far. First and
 * last are always present, so any page is reachable in a couple of hops.
 */
export function pageWindow(current: number, total: number, radius = 2): (number | null)[] {
    if (total <= 1) return [1]

    const wanted = new Set<number>([1, total])
    for (let page = current - radius; page <= current + radius; page++) {
        if (page >= 1 && page <= total) wanted.add(page)
    }

    const pages = Array.from(wanted).sort((a, b) => a - b)
    const out: (number | null)[] = []
    let previous = 0
    for (const page of pages) {
        // A gap of exactly one page renders as that page, not an ellipsis —
        // "1 … 3" is longer than "1 2 3" and hides a link for no reason.
        if (previous && page - previous === 2) out.push(previous + 1)
        else if (previous && page - previous > 2) out.push(null)
        out.push(page)
        previous = page
    }
    return out
}
