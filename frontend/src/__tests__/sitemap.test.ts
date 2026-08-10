import {
    COMMUNITY_ORIGINS,
    SITEMAP_CACHE_CONTROL,
    SITEMAP_SECTIONS,
    assertOriginsPartitionPoems,
    buildAuthorEntries,
    buildPageEntries,
    buildPoemEntries,
    fetchAllAuthors,
    fetchAllPoems,
    fetchNewestByGenre,
    fetchNewestPoemDate,
    isSitemapSection,
    mapWithConcurrency,
    renderSitemapIndex,
    renderUrlset
} from '../lib/sitemap'

/**
 * The sitemap.
 *
 * Two things are under test here and they fail in opposite directions.
 *
 * `<lastmod>` is emitted ONLY where it is TRUE. Stamping every entry with
 * today's date satisfies the naive reading of "add lastmod" and destroys the
 * signal — a sitemap claiming everything changed today teaches Google to ignore
 * the field, and then the one page that really did change loses its signal too.
 *
 * And a sitemap NEVER ships partial. The fetchers used to `break` out of the
 * pagination loop on any failure and return what they had, so a timeout on page
 * 90 of 157 published a 200 — cached for a day — that silently dropped 6,700
 * URLs. URLs vanishing from a sitemap reads as "those pages are gone", so half
 * a sitemap is worse than none. Everything below that asserts `rejects` is
 * pinning that: the response must fail, not shrink.
 */
const BASE = 'https://poemunity.com'

const poem = (id: string, date?: string, slug?: string) =>
    ({ id, slug: slug ?? `${id}-slug`, date, genre: 'love' })

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

const okJson = (body: unknown) => ({ ok: true, status: 200, json: async () => body })
const failed = (status: number) => ({ ok: false, status, json: async () => ({}) })

/** A `GET /poems` page as the backend shapes it. */
const poemsPage = (poems: unknown[], total: number, hasMore: boolean) =>
    okJson({ poems, total, hasMore, page: 1, limit: 100, totalPages: 1 })

let fetchMock: jest.Mock

beforeEach(() => {
    fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch
})

describe('<lastmod> is emitted only where it is true', () => {
    test('a poem carries its own date', () => {
        const xml = renderUrlset(BASE, buildPoemEntries([poem('p1', '2026-03-04T10:00:00.000Z', 'aubade')]))

        expect(entries(xml).get('/detail/aubade')).toBe('2026-03-04')
    })

    test('an unparseable date is omitted, not emitted raw', () => {
        const xml = renderUrlset(BASE, buildPoemEntries([poem('p1', 'not-a-date', 'x')]))

        expect(entries(xml).get('/detail/x')).toBeNull()
        expect(xml).not.toContain('not-a-date')
    })

    test('a poem with no date at all is omitted', () => {
        const xml = renderUrlset(BASE, buildPoemEntries([poem('p1', undefined, 'x')]))

        expect(entries(xml).get('/detail/x')).toBeNull()
    })

    test('author pages get none — the authors endpoint carries no date', () => {
        const xml = renderUrlset(BASE, buildAuthorEntries([{ slug: 'ada-brine' }]))

        expect(entries(xml).get('/authors/ada-brine')).toBeNull()
    })

    test('privacy and terms get none; the homepage gets the newest poem date', () => {
        const xml = renderUrlset(BASE, buildPageEntries(new Map(), '2026-07-07T00:00:00.000Z'))
        const found = entries(xml)

        expect(found.get('/')).toBe('2026-07-07')
        expect(found.get('/authors')).toBe('2026-07-07')
        expect(found.get('/privacy')).toBeNull()
        expect(found.get('/terms')).toBeNull()
    })

    test('NOT everything is stamped — that is the whole point', () => {
        const xml = renderUrlset(BASE, [
            ...buildPageEntries(new Map([['love', '2026-01-01T00:00:00.000Z']]), '2026-01-01T00:00:00.000Z'),
            ...buildAuthorEntries([{ slug: 'ada-brine' }])
        ])
        // `Array.from`, NOT a spread: this project's TS target compiles a spread
        // of a Map iterator to an empty array at runtime, so `[...map.values()]`
        // silently yields nothing and every `.some()` on it returns false. The
        // assertion below passed vacuously until that was caught.
        const all = Array.from(entries(xml).values())

        expect(all.some(v => v === null)).toBe(true)
        expect(all.some(v => v !== null)).toBe(true)
        expect(xml).not.toContain(new Date().toISOString().slice(0, 10))
    })

    test('the XML stays valid — one lastmod per url, before changefreq', () => {
        const xml = renderUrlset(BASE, buildPoemEntries([poem('p1', '2026-01-01T00:00:00.000Z')]))

        expect(xml).toMatch(/<loc>[^<]*<\/loc>\s*<lastmod>[\d-]+<\/lastmod>\s*<changefreq>/)
        expect((xml.match(/<lastmod>/g) || []).length)
            .toBe((xml.match(/<\/lastmod>/g) || []).length)
    })

    test('an & in a slug is escaped, not emitted raw', () => {
        // One ill-formed entry makes the whole document unparseable, and a
        // crawler that cannot parse the file discards every URL in it.
        const xml = renderUrlset(BASE, buildPoemEntries([poem('p1', undefined, 'me-&-you')]))

        expect(xml).toContain('/detail/me-&amp;-you')
        expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/)
    })
})

describe('genre pages', () => {
    test('a genre with no poems is not listed at all', () => {
        // Eleven categories hold none, and advertising them sent Google to crawl
        // eleven pages with a heading and nothing under it — the shape it files
        // as a soft 404.
        const xml = renderUrlset(BASE, buildPageEntries(new Map([['love', '2026-01-01T00:00:00.000Z']])))
        const found = entries(xml)

        expect(found.has('/death')).toBe(false)
        expect(found.has('/love')).toBe(true)
    })

    test('a genre whose poems are all undated is STILL listed, just without a date', () => {
        // Presence is the map KEY, freshness is its VALUE. Testing the value
        // instead would delete a real genre page from the sitemap for the sole
        // reason that its poems carry no timestamps.
        const xml = renderUrlset(BASE, buildPageEntries(new Map([['love', undefined]])))

        expect(entries(xml).has('/love')).toBe(true)
        expect(entries(xml).get('/love')).toBeNull()
    })
})

describe('fetchNewestByGenre — one probe per genre, not a walk of every poem', () => {
    /** Answers `total`/newest-date per genre slug; every other genre is empty. */
    const withGenres = (byGenre: Record<string, { total: number, date?: string }>) => {
        fetchMock.mockImplementation(async (url: string) => {
            const slug = decodeURIComponent(new URL(url).searchParams.get('genre') || '')
            const hit = byGenre[slug]
            if (!hit) return poemsPage([], 0, false)
            return poemsPage(hit.total ? [{ id: 'x', date: hit.date }] : [], hit.total, false)
        })
    }

    test('asks for exactly one row per genre', async () => {
        withGenres({ love: { total: 3, date: '2026-09-09T00:00:00.000Z' } })
        await fetchNewestByGenre()

        for (const call of fetchMock.mock.calls) {
            expect(new URL(call[0]).searchParams.get('limit')).toBe('1')
        }
    })

    test('takes the newest date, which is row one of a date-DESC list', async () => {
        withGenres({ love: { total: 3, date: '2026-09-09T00:00:00.000Z' } })

        expect(await fetchNewestByGenre()).toEqual(expect.any(Map))
        expect((await fetchNewestByGenre()).get('love')).toBe('2026-09-09T00:00:00.000Z')
    })

    test('a genre with total 0 is absent from the map', async () => {
        withGenres({ love: { total: 3, date: '2026-09-09T00:00:00.000Z' } })
        const map = await fetchNewestByGenre()

        expect(map.has('love')).toBe(true)
        expect(map.has('death')).toBe(false)
    })

    test('a genre with poems but no dates is PRESENT with an undefined date', async () => {
        // The distractor for `if (date)` instead of `if (total > 0)`: a real
        // genre whose poems are undated must still be advertised.
        withGenres({ love: { total: 3, date: undefined } })
        const map = await fetchNewestByGenre()

        expect(map.has('love')).toBe(true)
        expect(map.get('love')).toBeUndefined()
    })

    test('one failing genre fails the whole sitemap', async () => {
        fetchMock.mockImplementation(async (url: string) => (
            String(url).includes('genre=love') ? failed(503) : poemsPage([], 0, false)
        ))

        await expect(fetchNewestByGenre()).rejects.toThrow(/503/)
    })
})

describe('fetchAllPoems fails loudly rather than shipping a partial sitemap', () => {
    /** `n` poems spread over pages of 100, keyed by the requested page number. */
    const paginate = (n: number, override: Record<number, unknown> = {}) => {
        fetchMock.mockImplementation(async (url: string) => {
            const page = Number(new URL(url).searchParams.get('page'))
            if (page in override) return override[page]
            const rows = Math.max(0, Math.min(100, n - (page - 1) * 100))
            return poemsPage(
                Array.from({ length: rows }, (_, i) => ({ id: `p${(page - 1) * 100 + i}` })),
                n,
                page * 100 < n
            )
        })
    }

    test('collects every page on the happy path', async () => {
        paginate(250)

        expect(await fetchAllPoems()).toHaveLength(250)
    })

    test('pages after the first go out concurrently, not one after another', async () => {
        // 157 sequential round-trips against a serverless backend was ~30s, and
        // a fetch-everything route that slow eventually hits a platform timeout.
        paginate(500)
        await fetchAllPoems()

        const pages = fetchMock.mock.calls.map(c => Number(new URL(c[0]).searchParams.get('page')))
        expect(pages).toHaveLength(5)
        expect(new Set(pages)).toEqual(new Set([1, 2, 3, 4, 5]))
    })

    test('a failed page THROWS instead of returning the pages before it', async () => {
        // This is the bug. The old loop `break`ed here and returned the pages it
        // already had, with a 200 and a 24-hour cache header.
        paginate(900, { 4: failed(504) })

        await expect(fetchAllPoems()).rejects.toThrow(/504/)
    })

    test('a network error throws rather than being swallowed', async () => {
        paginate(900)
        const ok = fetchMock.getMockImplementation()!
        fetchMock.mockImplementation(async (url: string) => {
            if (new URL(url).searchParams.get('page') === '3') throw new Error('socket hang up')
            return ok(url)
        })

        await expect(fetchAllPoems()).rejects.toThrow('socket hang up')
    })

    test('a short page is caught by the count check', async () => {
        // Every request succeeded, so nothing threw — one of them just returned
        // fewer rows than it owed. Only the server's own `total` disagrees, and
        // no single response can see it.
        paginate(250, { 2: poemsPage([{ id: 'x' }], 250, true) })

        await expect(fetchAllPoems()).rejects.toThrow(/collected 151 of 250/)
    })

    test('an unrecognised body is a failure, not an empty sitemap', async () => {
        fetchMock.mockResolvedValueOnce(okJson({ error: 'nope' }))

        await expect(fetchAllPoems()).rejects.toThrow(/unrecognised body/)
    })

    test('the origin filter reaches the backend', async () => {
        fetchMock.mockResolvedValueOnce(poemsPage([{ id: 'a' }], 1, false))
        await fetchAllPoems('&origin=famous')

        expect(fetchMock.mock.calls[0][0]).toContain('origin=famous')
    })
})

describe('fetchAllAuthors', () => {
    test('flattens every letter', async () => {
        fetchMock
            .mockResolvedValueOnce(okJson(['a', 'b']))
            .mockResolvedValue(okJson([{ slug: 'ada-brine' }]))

        expect(await fetchAllAuthors()).toHaveLength(2)
    })

    test('a failed letter throws rather than dropping those authors', async () => {
        fetchMock
            .mockResolvedValueOnce(okJson(['a', 'b']))
            .mockResolvedValueOnce(okJson([{ slug: 'ada-brine' }]))
            .mockResolvedValueOnce(failed(500))

        await expect(fetchAllAuthors()).rejects.toThrow(/500/)
    })

    test('a failed letters index throws', async () => {
        fetchMock.mockResolvedValueOnce(failed(502))

        await expect(fetchAllAuthors()).rejects.toThrow(/502/)
    })
})

describe('fetchNewestPoemDate', () => {
    test('is row one of the date-DESC list', async () => {
        fetchMock.mockResolvedValueOnce(poemsPage([{ id: 'a', date: '2026-07-07T00:00:00.000Z' }], 9, true))

        expect(await fetchNewestPoemDate()).toBe('2026-07-07T00:00:00.000Z')
    })

    test('an empty collection yields no date rather than throwing', async () => {
        fetchMock.mockResolvedValueOnce(poemsPage([], 0, false))

        expect(await fetchNewestPoemDate()).toBeUndefined()
    })
})

describe('the sections partition the poems', () => {
    test('famous + community == everything is fine', () => {
        expect(() => assertOriginsPartitionPoems(15652, 435, 16087)).not.toThrow()
    })

    test('a fourth origin nobody added to COMMUNITY_ORIGINS fails the build', () => {
        // Without this, the new origin's poems belong to no sitemap section and
        // nothing anywhere reports it.
        expect(() => assertOriginsPartitionPoems(15652, 435, 16200))
            .toThrow(/COMMUNITY_ORIGINS/)
    })

    test('famous is not one of the community origins', () => {
        expect(COMMUNITY_ORIGINS).not.toContain('famous')
    })
})

describe('the section allowlist', () => {
    test('accepts exactly the four sections', () => {
        for (const section of SITEMAP_SECTIONS) {
            expect(isSitemapSection(section)).toBe(true)
        }
    })

    test.each(['poems', 'POEMS-FAMOUS', '', 'pages ', '../sitemap', undefined, null, 42])(
        'rejects %p',
        value => {
            expect(isSitemapSection(value)).toBe(false)
        }
    )
})

describe('the sitemap index', () => {
    test('lists every section as an absolute child URL', () => {
        const xml = renderSitemapIndex(BASE, SITEMAP_SECTIONS)

        for (const section of SITEMAP_SECTIONS) {
            expect(xml).toContain(`<loc>${BASE}/sitemaps/${section}.xml</loc>`)
        }
    })

    test('is a sitemapindex, not a urlset — the two are different documents', () => {
        const xml = renderSitemapIndex(BASE, SITEMAP_SECTIONS)

        expect(xml).toContain('<sitemapindex')
        expect(xml).not.toContain('<urlset')
        expect(xml).not.toContain('<url>')
    })
})

describe('mapWithConcurrency', () => {
    test('keeps results in input order regardless of completion order', async () => {
        const delays = [30, 0, 15, 0]
        const out = await mapWithConcurrency(delays, 4, async ms => {
            await new Promise(resolve => setTimeout(resolve, ms))
            return ms
        })

        expect(out).toEqual(delays)
    })

    test('never runs more than `limit` at once', async () => {
        let running = 0
        let peak = 0

        await mapWithConcurrency(Array.from({ length: 20 }, (_, i) => i), 3, async () => {
            running++
            peak = Math.max(peak, running)
            await new Promise(resolve => setTimeout(resolve, 1))
            running--
        })

        expect(peak).toBe(3)
    })

    test('a single rejection rejects the whole map', async () => {
        await expect(
            mapWithConcurrency([1, 2, 3], 2, async n => {
                if (n === 2) throw new Error('boom')
                return n
            })
        ).rejects.toThrow('boom')
    })
})

/**
 * THE CACHE HEADER.
 *
 * `stale-while-revalidate` was sent with no value, and a valueless directive is
 * dropped in normalisation — only `public` reached the CDN, so `poems-famous.xml`
 * regenerated in full on every crawl (`x-vercel-cache: MISS`, `age: 0`) despite
 * costing 157 backend round-trips to build.
 *
 * Asserting on the STRING is the point. The header parses fine either way, the
 * XML is byte-identical either way, and nothing in a test suite or a build can
 * see the difference — only a response header on the deployed site can.
 */
describe('the sitemap cache header', () => {
    test('gives stale-while-revalidate a value, or the CDN drops it', () => {
        expect(SITEMAP_CACHE_CONTROL).toMatch(/stale-while-revalidate=\d+/)
    })

    test('is publicly cacheable and stays fresh for a day', () => {
        expect(SITEMAP_CACHE_CONTROL).toMatch(/(^|,\s*)public(,|$)/)
        expect(SITEMAP_CACHE_CONTROL).toMatch(/s-maxage=86400/)
    })

    test('may serve a stale copy for longer than it stays fresh', () => {
        // The window only means anything if it outlasts freshness — equal
        // values would expire together and a crawler would get the 500 the
        // stale copy exists to prevent.
        const fresh = Number(/s-maxage=(\d+)/.exec(SITEMAP_CACHE_CONTROL)?.[1])
        const stale = Number(/stale-while-revalidate=(\d+)/.exec(SITEMAP_CACHE_CONTROL)?.[1])

        expect(stale).toBeGreaterThan(fresh)
    })

    test('the index route actually sends it', async () => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { getServerSideProps } = require('../../pages/sitemap.xml')
        const res = { setHeader: jest.fn(), write: jest.fn(), end: jest.fn() }

        await getServerSideProps({
            req: { headers: { host: 'poemunity.com' } },
            res
        })

        expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', SITEMAP_CACHE_CONTROL)
    })
})
