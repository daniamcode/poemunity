import { buildSitemap } from '../../pages/sitemap.xml'

/**
 * `<lastmod>` in the sitemap.
 *
 * There were 19,598 URLs and not one timestamp, so Google had no signal that
 * any page had changed — which is why resubmitting the sitemap after the SSR
 * fix would have achieved nothing. A resubmit prompts DISCOVERY of new URLs,
 * and none of these were new.
 *
 * The rule these tests exist to hold: `lastmod` is emitted ONLY where it is
 * TRUE. Stamping every entry with today's date is worse than omitting the
 * field — a sitemap that claims everything changed today teaches Google to
 * ignore it, and then the one page that really did change loses its signal too.
 */
const BASE = 'https://poemunity.com'

const poem = (id: string, date: string, genre = 'Love', slug?: string) =>
    ({ id, slug: slug ?? `${id}-slug`, date, genre })

/** All <url> blocks, keyed by path, with their lastmod (or null). */
function entries(xml: string): Map<string, string | null> {
    const out = new Map<string, string | null>()
    for (const block of xml.split('<url>').slice(1)) {
        const loc = block.match(/<loc>([^<]*)<\/loc>/)?.[1] ?? ''
        const lastmod = block.match(/<lastmod>([^<]*)<\/lastmod>/)?.[1] ?? null
        out.set(loc.replace(BASE, ''), lastmod)
    }
    return out
}

describe('sitemap <lastmod>', () => {
    test('a poem carries its own date', () => {
        const xml = buildSitemap(BASE, [poem('p1', '2026-03-04T10:00:00.000Z', 'Love', 'aubade')], [])

        expect(entries(xml).get('/detail/aubade')).toBe('2026-03-04')
    })

    test('a genre is as fresh as its NEWEST poem, not its first or last', () => {
        // The distractor: order the input so "first" and "last" both give the
        // wrong answer. An implementation taking either would fail here.
        const xml = buildSitemap(BASE, [
            poem('p1', '2026-01-01T00:00:00.000Z'),
            poem('p2', '2026-09-09T00:00:00.000Z'),
            poem('p3', '2026-05-05T00:00:00.000Z')
        ], [])

        expect(entries(xml).get('/love')).toBe('2026-09-09')
    })

    test('genres are bucketed case-insensitively', () => {
        // The database holds mixed spellings. Bucketing on the raw value splits
        // one genre into several and hands each a too-old date — the same trap
        // AGENTS.md records for the genre lists.
        const xml = buildSitemap(BASE, [
            poem('p1', '2026-01-01T00:00:00.000Z', 'love'),
            poem('p2', '2026-08-08T00:00:00.000Z', 'Love'),
            poem('p3', '2026-04-04T00:00:00.000Z', 'LOVE')
        ], [])

        expect(entries(xml).get('/love')).toBe('2026-08-08')
    })

    test('a genre with no poems is not listed at all', () => {
        // It used to be listed with no lastmod. Worse than that: eleven
        // categories hold no poems, and advertising them sent Google to crawl
        // eleven pages with a heading and nothing under it — the shape it files
        // as a soft 404. They reappear on their own once they have a poem.
        const xml = buildSitemap(BASE, [poem('p1', '2026-01-01T00:00:00.000Z', 'Love')], [])

        expect(entries(xml).has('/death')).toBe(false)
        expect(entries(xml).has('/love')).toBe(true)
    })

    test('the homepage is as fresh as the newest poem anywhere', () => {
        const xml = buildSitemap(BASE, [
            poem('p1', '2026-01-01T00:00:00.000Z', 'Love'),
            poem('p2', '2026-07-07T00:00:00.000Z', 'Death')
        ], [])

        expect(entries(xml).get('/')).toBe('2026-07-07')
    })

    describe('pages whose date is genuinely unknown get none', () => {
        const xml = () => buildSitemap(BASE, [poem('p1', '2026-01-01T00:00:00.000Z')], [{ slug: 'ada-brine' }])

        test('author pages — the authors endpoint carries no date', () => {
            expect(entries(xml()).get('/authors/ada-brine')).toBeNull()
        })

        test('privacy and terms', () => {
            expect(entries(xml()).get('/privacy')).toBeNull()
            expect(entries(xml()).get('/terms')).toBeNull()
        })
    })

    describe('bad data does not produce bad timestamps', () => {
        test('an unparseable date is omitted, not emitted raw', () => {
            const xml = buildSitemap(BASE, [{ id: 'p1', slug: 'x', date: 'not-a-date', genre: 'Love' }], [])

            expect(entries(xml).get('/detail/x')).toBeNull()
            expect(xml).not.toContain('not-a-date')
        })

        test('a poem with no date at all is omitted', () => {
            const xml = buildSitemap(BASE, [{ id: 'p1', slug: 'x', genre: 'Love' }], [])

            expect(entries(xml).get('/detail/x')).toBeNull()
        })

        test('an undated poem does not poison its genre', () => {
            const xml = buildSitemap(BASE, [
                { id: 'p1', slug: 'x', genre: 'Love' },
                poem('p2', '2026-06-06T00:00:00.000Z', 'Love')
            ], [])

            expect(entries(xml).get('/love')).toBe('2026-06-06')
        })
    })

    test('NOT everything is stamped — that is the whole point', () => {
        // A "fix" that emitted today's date everywhere would satisfy the naive
        // reading of "add lastmod" and destroy the signal. This fails against it.
        const xml = buildSitemap(BASE, [poem('p1', '2026-01-01T00:00:00.000Z', 'Love')], [{ slug: 'ada-brine' }])
        // `Array.from`, NOT a spread: this project's TS target compiles a
        // spread of a Map iterator to an empty array at runtime, so
        // `[...map.values()]` silently yields nothing and every `.some()` on it
        // returns false. The assertion below passed vacuously until this was
        // caught — the same downlevel-iteration trap as spreading a NodeList.
        const all = Array.from(entries(xml).values())

        expect(all.some(v => v === null)).toBe(true)
        expect(all.some(v => v !== null)).toBe(true)
        // And nothing claims to be from today.
        expect(xml).not.toContain(new Date().toISOString().slice(0, 10))
    })

    test('the XML stays valid — one lastmod per url, before changefreq', () => {
        const xml = buildSitemap(BASE, [poem('p1', '2026-01-01T00:00:00.000Z')], [])

        expect(xml).toMatch(/<loc>[^<]*<\/loc>\s*<lastmod>[\d-]+<\/lastmod>\s*<changefreq>/)
        expect((xml.match(/<lastmod>/g) || []).length)
            .toBe((xml.match(/<\/lastmod>/g) || []).length)
    })
})
