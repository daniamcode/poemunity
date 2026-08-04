import { GetServerSideProps } from 'next'
import { CATEGORIES, categoryToSlug } from '../src/data/constants'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'

interface SitemapPoem {
    id: string
    slug?: string
    /** ISO string. Drives `<lastmod>` for the poem, its genre and the homepage. */
    date?: string
    genre?: string
}

async function fetchAllPoems(): Promise<SitemapPoem[]> {
    const poems: SitemapPoem[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
        try {
            const res = await fetch(`${API}/api/v1/poems?page=${page}&limit=100`)
            if (!res.ok) break
            const data = await res.json()
            if (!data.poems?.length) break
            poems.push(...data.poems.map((p: any) => ({ id: p.id, slug: p.slug, date: p.date, genre: p.genre })))
            hasMore = data.hasMore
            page++
        } catch {
            break
        }
    }
    return poems
}

async function fetchAllAuthors(): Promise<{ slug: string }[]> {
    try {
        const lettersRes = await fetch(`${API}/api/v1/authors/letters`)
        if (!lettersRes.ok) return []
        const letters: string[] = await lettersRes.json()

        const perLetter = await Promise.all(
            letters.map(letter =>
                fetch(`${API}/api/v1/authors?letter=${letter}`)
                    .then(r => r.ok ? r.json() : [])
                    .catch(() => [])
            )
        )
        return perLetter.flat().filter((a: any) => a.slug)
    } catch {
        return []
    }
}

/** The later of two ISO strings, ignoring anything unparseable. */
function newer(a?: string, b?: string): string | undefined {
    const ta = a ? Date.parse(a) : NaN
    const tb = b ? Date.parse(b) : NaN
    if (Number.isNaN(ta)) return Number.isNaN(tb) ? undefined : b
    if (Number.isNaN(tb)) return a
    return ta >= tb ? a : b
}

/** W3C date, which is what the sitemap spec asks for. */
function asLastmod(iso?: string): string | undefined {
    if (!iso) return undefined
    const t = Date.parse(iso)
    return Number.isNaN(t) ? undefined : new Date(t).toISOString().slice(0, 10)
}

export function buildSitemap(
    baseUrl: string,
    poems: SitemapPoem[],
    authors: { slug: string }[]
): string {
    // `lastmod` IS ONLY EMITTED WHERE IT IS TRUE.
    //
    // The temptation is to stamp everything with today's date. That is worse
    // than omitting it: a sitemap whose every entry claims to have changed today
    // tells Google nothing, and it learns to ignore the field — so the one page
    // that really did change loses its signal too. Author pages get none,
    // because the authors endpoint carries no date and inventing one would be
    // exactly that lie. Privacy and Terms get none for the same reason.
    //
    // Everything else comes free from the poems already in memory: each poem
    // knows its own date, a genre is as fresh as its newest poem, and the
    // homepage as fresh as the newest poem anywhere.
    const newestOverall = poems.reduce<string | undefined>((acc, p) => newer(acc, p.date), undefined)

    const newestByGenre = new Map<string, string | undefined>()
    for (const poem of poems) {
        if (!poem.genre) continue
        // Through categoryToSlug, which lowercases — the database holds mixed
        // spellings ("Love", "love"), and bucketing on the raw value would split
        // one genre into several and hand each a too-old date.
        const slug = categoryToSlug(poem.genre)
        newestByGenre.set(slug, newer(newestByGenre.get(slug), poem.date))
    }
    const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'daily', lastmod: newestOverall },
        { path: '/authors', priority: '0.8', changefreq: 'daily', lastmod: newestOverall },
        { path: '/privacy', priority: '0.3', changefreq: 'yearly', lastmod: undefined },
        { path: '/terms', priority: '0.3', changefreq: 'yearly', lastmod: undefined }
    ]

    const genrePages = CATEGORIES.map(cat => {
        const slug = categoryToSlug(cat)
        return { path: `/${slug}`, priority: '0.7', changefreq: 'weekly', lastmod: newestByGenre.get(slug) }
    })

    const poemPages = poems.map(p => ({
        path: `/detail/${p.slug || p.id}`,
        priority: '0.6',
        changefreq: 'monthly',
        lastmod: p.date
    }))

    const authorPages = authors.map(a => ({
        path: `/authors/${a.slug}`,
        priority: '0.6',
        changefreq: 'weekly',
        lastmod: undefined as string | undefined
    }))

    const all = [...staticPages, ...genrePages, ...poemPages, ...authorPages]

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(p => {
    const lastmod = asLastmod(p.lastmod)
    return `  <url>
    <loc>${baseUrl}${p.path}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
}).join('\n')}
</urlset>`
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    // Always emit canonical apex URLs in production/preview; use the real host only for local dev
    const host = req.headers.host || ''
    const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = isLocal
        ? `${protocol}://${host}`
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://poemunity.com').replace(/\/+$/, '')

    const [poems, authors] = await Promise.all([fetchAllPoems(), fetchAllAuthors()])

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate')
    res.write(buildSitemap(baseUrl, poems, authors))
    res.end()

    return { props: {} }
}

export default function Sitemap() {
    return null
}
