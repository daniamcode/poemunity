import { CATEGORIES, categoryToSlug } from '../data/constants'

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'

/** Simultaneous requests allowed against the backend. See `mapWithConcurrency`. */
export const FETCH_CONCURRENCY = 16

/**
 * THE SITEMAP IS SPLIT BY CONTENT TYPE, BEHIND AN INDEX.
 *
 * It used to be one 19,587-URL file, and Search Console reports coverage PER
 * SUBMITTED SITEMAP — so "N of 19,587 indexed" was the only number available and
 * it answered nothing. Which class is stuck? Split, and within days GSC says so
 * for each one separately.
 *
 * The famous/community split is the one that earns its place. 15,652 of the
 * 16,087 poems are famous ones that exist verbatim on hundreds of other sites,
 * against 435 that exist only here. Those two groups have completely different
 * prospects in search, and averaging them into one number hides the only
 * comparison worth making.
 *
 * This is a diagnostic, not a ranking trick. Splitting a sitemap does not make
 * Google index faster — it makes Google tell you WHY it isn't.
 */
export const SITEMAP_SECTIONS = ['pages', 'authors', 'poems-community', 'poems-famous'] as const

export type SitemapSection = (typeof SITEMAP_SECTIONS)[number]

/**
 * Allowlist, so `/sitemaps/<anything>.xml` cannot mint an infinite supply of
 * 200-answering URLs for a crawler to wander into. Same reasoning as the
 * allowlists on the poem write routes: an unknown name is a 404, not a guess.
 */
export function isSitemapSection(value: unknown): value is SitemapSection {
    return typeof value === 'string' && (SITEMAP_SECTIONS as readonly string[]).includes(value)
}

/**
 * Poem origins that are NOT `famous` — i.e. everything written on Poemunity,
 * by a person or by a labelled AI persona.
 *
 * Enumerated by hand because the list endpoint filters `origin` by equality and
 * has no "not this one". That makes this the one place a whole class of poems
 * can silently vanish from the sitemap: add a fourth origin tomorrow and it
 * belongs to no section. `assertOriginsPartitionPoems` below is the guard, and
 * it runs on the community section rather than the famous one on purpose —
 * `famous` is defined positively and cannot be wrong, this list is defined by
 * omission and can.
 */
export const COMMUNITY_ORIGINS = ['user', 'ai'] as const

export interface SitemapPoem {
    id: string
    slug?: string
    /** ISO string. Drives `<lastmod>` for the poem, its genre and the homepage. */
    date?: string
    genre?: string
}

export interface SitemapEntry {
    path: string
    priority: string
    changefreq: string
    lastmod?: string
}

/** W3C date, which is what the sitemap spec asks for. */
export function asLastmod(iso?: string): string | undefined {
    if (!iso) return undefined
    const t = Date.parse(iso)
    return Number.isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10)
}

/**
 * XML text escaping. Poem slugs and author slugs are derived from user input,
 * and an `&` in a URL closes nothing but makes the document ill-formed — a
 * crawler that fails to parse the file discards every URL in it, not just the
 * bad one.
 */
function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
}

export function renderUrlset(baseUrl: string, entries: SitemapEntry[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entry => {
    const lastmod = asLastmod(entry.lastmod)
    return `  <url>
    <loc>${escapeXml(baseUrl + entry.path)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
}).join('\n')}
</urlset>`
}

export function renderSitemapIndex(baseUrl: string, sections: readonly SitemapSection[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sections.map(section => `  <sitemap>
    <loc>${escapeXml(`${baseUrl}/sitemaps/${section}.xml`)}</loc>
  </sitemap>`).join('\n')}
</sitemapindex>`
}

// ---------------------------------------------------------------------------
// Fetching
//
// EVERY FAILURE HERE THROWS. It used to `break` out of the pagination loop and
// return what it had, which meant a timeout on page 90 of 157 published a
// sitemap missing 6,700 URLs, silently, with a 200 and a 24-hour cache header.
// URLs disappearing from a sitemap is a NEGATIVE signal — it reads as "these
// pages are gone" — so a partial sitemap is strictly worse than no response at
// all. A throw becomes a 500, which Google retries while continuing to trust
// the copy it already has.
// ---------------------------------------------------------------------------

/**
 * `Promise.all` over a bounded number of workers.
 *
 * The genre fan-out is 136 requests. Firing them all at once at a serverless
 * backend that may be cold is how a fetch-everything sitemap turns into a
 * self-inflicted burst — and now that a single failed request fails the whole
 * response (by design), being gentler with the backend is what keeps that
 * strictness from becoming flakiness.
 */
export async function mapWithConcurrency<T, R>(
    items: readonly T[],
    limit: number,
    fn: (item: T) => Promise<R>
): Promise<R[]> {
    const results = new Array<R>(items.length)
    let next = 0

    const worker = async (): Promise<void> => {
        while (next < items.length) {
            const index = next++
            results[index] = await fn(items[index])
        }
    }

    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
    return results
}

interface PoemsPage {
    poems: any[]
    total: number
    hasMore: boolean
}

async function fetchPoemsPage(query: string): Promise<PoemsPage> {
    const url = `${API}/api/v1/poems?${query}`
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error(`sitemap: ${url} answered ${res.status}`)
    }
    const data = await res.json()
    if (!Array.isArray(data?.poems) || typeof data?.total !== 'number') {
        throw new Error(`sitemap: ${url} returned an unrecognised body`)
    }
    return data as PoemsPage
}

/** `total` for a filter, at the cost of one row. */
export async function fetchPoemTotal(filter = ''): Promise<number> {
    const page = await fetchPoemsPage(`page=1&limit=1${filter}`)
    return page.total
}

/**
 * Newest poem date anywhere, at the cost of one row — the list is sorted `date`
 * DESC, so row one holds it. Drives `<lastmod>` on the homepage and the author
 * index, which are as fresh as the newest thing they show.
 */
export async function fetchNewestPoemDate(): Promise<string | undefined> {
    const page = await fetchPoemsPage('page=1&limit=1')
    return page.poems[0]?.date as string | undefined
}

const PAGE_SIZE = 100

/**
 * Every poem matching `filter` (an already-encoded `&key=value` suffix, or '').
 *
 * Page 1 reports `total`, which gives the page COUNT up front — so the rest are
 * fetched concurrently instead of one after another. The famous section is 157
 * pages, and walking them sequentially against a serverless backend was ~30
 * seconds of pure round-trip latency. That is not just slow: a fetch-everything
 * route that takes half a minute is a route that eventually hits a platform
 * timeout, which is the failure the count check below exists to catch.
 *
 * That check is not belt-and-braces. `hasMore` going false one page early is
 * exactly the failure the old `break` produced, and no individual request can
 * see it — only comparing the collected count against the `total` the server
 * itself reported can.
 */
export async function fetchAllPoems(filter = ''): Promise<SitemapPoem[]> {
    const toPoem = (p: any): SitemapPoem => ({ id: p.id, slug: p.slug, date: p.date, genre: p.genre })

    const first = await fetchPoemsPage(`page=1&limit=${PAGE_SIZE}${filter}`)
    const total = first.total
    const pageCount = Math.ceil(total / PAGE_SIZE)

    const rest = await mapWithConcurrency(
        Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => i + 2),
        FETCH_CONCURRENCY,
        async page => {
            const data = await fetchPoemsPage(`page=${page}&limit=${PAGE_SIZE}${filter}`)
            return data.poems.map(toPoem)
        }
    )

    const poems = [...first.poems.map(toPoem), ...rest.flat()]

    if (poems.length !== total) {
        throw new Error(
            `sitemap: paginating '${filter || 'all poems'}' collected ${poems.length} of ${total} poems`
        )
    }
    return poems
}

export async function fetchAllAuthors(): Promise<{ slug: string }[]> {
    const lettersRes = await fetch(`${API}/api/v1/authors/letters`)
    if (!lettersRes.ok) {
        throw new Error(`sitemap: /authors/letters answered ${lettersRes.status}`)
    }
    const letters: string[] = await lettersRes.json()

    const perLetter = await mapWithConcurrency(letters, FETCH_CONCURRENCY, async letter => {
        const res = await fetch(`${API}/api/v1/authors?letter=${encodeURIComponent(letter)}`)
        if (!res.ok) {
            throw new Error(`sitemap: /authors?letter=${letter} answered ${res.status}`)
        }
        return res.json()
    })
    return perLetter.flat().filter((a: any) => a?.slug)
}

/**
 * The sections partition the poems: famous + community must equal everything.
 * Fails loudly if a new `origin` appears, because the alternative is that its
 * poems are in no sitemap at all and nobody finds out.
 */
export function assertOriginsPartitionPoems(famous: number, community: number, overall: number): void {
    if (famous + community !== overall) {
        throw new Error(
            `sitemap: origins do not partition the collection — famous ${famous} + community ${community} ` +
            `!= ${overall} total. A new poem origin is missing from COMMUNITY_ORIGINS.`
        )
    }
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

export function buildPoemEntries(poems: SitemapPoem[]): SitemapEntry[] {
    return poems.map(p => ({
        path: `/detail/${p.slug || p.id}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: p.date
    }))
}

export function buildAuthorEntries(authors: { slug: string }[]): SitemapEntry[] {
    // No `lastmod`: the authors endpoint carries no date, and inventing one is
    // the lie the whole lastmod policy exists to avoid.
    return authors.map(a => ({
        path: `/authors/${a.slug}`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: undefined
    }))
}

/**
 * Static pages plus the genre pages, given the newest poem date per genre slug.
 *
 * `lastmod` IS ONLY EMITTED WHERE IT IS TRUE. The temptation is to stamp
 * everything with today's date; that is worse than omitting it, because a
 * sitemap whose every entry claims to have changed today teaches Google to
 * ignore the field — and then the one page that really did change loses its
 * signal too. Privacy and Terms get none for that reason.
 *
 * ONLY genres that actually hold a poem are listed. Eleven categories hold none
 * — Easter, Graduation, Wedding — and advertising them sent Google to crawl
 * eleven pages with a heading and nothing under it, which is the shape it files
 * as a soft 404. They still answer 200 for anyone following a category link;
 * they are simply not advertised until they have something to show, at which
 * point they reappear here on their own.
 *
 * A genre is PRESENT IN THE MAP if and only if it has poems — an undated poem
 * puts the slug in the map with `undefined`, which lists the page without
 * claiming a date. Testing the value instead of the key would drop a real
 * genre for the sole reason that its poems have no timestamps.
 */
export function buildPageEntries(
    newestByGenre: Map<string, string | undefined>,
    newestOverall?: string
): SitemapEntry[] {
    const staticPages: SitemapEntry[] = [
        { path: '/', priority: '1.0', changefreq: 'daily', lastmod: newestOverall },
        { path: '/authors', priority: '0.8', changefreq: 'daily', lastmod: newestOverall },
        { path: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: undefined },
        { path: '/terms', priority: '0.3', changefreq: 'yearly', lastmod: undefined }
    ]

    const genrePages: SitemapEntry[] = CATEGORIES
        .map(categoryToSlug)
        .filter(slug => newestByGenre.has(slug))
        .map(slug => ({
            path: `/${slug}`,
            priority: '0.7',
            changefreq: 'weekly',
            lastmod: newestByGenre.get(slug)
        }))

    return [...staticPages, ...genrePages]
}

/**
 * Newest poem date per genre, asked of the server one genre at a time.
 *
 * 136 parallel `limit=1` requests, NOT a walk of all 16,087 poems. The list is
 * sorted `date` DESC, so row one of a genre is its newest poem and `total` says
 * whether the genre has any at all — which is precisely the two facts this
 * section needs. Paginating the whole collection to derive them took 26 seconds
 * and 3.6 MB to produce 136 dates.
 *
 * Undated poems sort LAST under `date: -1` (BSON orders null/missing lowest),
 * so row one is a real date whenever the genre has one — and when every poem in
 * a genre is undated, the genre is still listed, just without a claim.
 */
export async function fetchNewestByGenre(): Promise<Map<string, string | undefined>> {
    const slugs = Array.from(new Set(CATEGORIES.map(categoryToSlug)))

    const results = await mapWithConcurrency(slugs, FETCH_CONCURRENCY, async slug => {
        const data = await fetchPoemsPage(`page=1&limit=1&genre=${encodeURIComponent(slug)}`)
        return { slug, total: data.total, date: data.poems[0]?.date as string | undefined }
    })

    const newestByGenre = new Map<string, string | undefined>()
    for (const { slug, total, date } of results) {
        if (total > 0) newestByGenre.set(slug, date)
    }
    return newestByGenre
}
