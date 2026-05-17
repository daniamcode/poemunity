import { GetServerSideProps } from 'next'
import { MUST_HAVE_CATEGORIES, categoryToSlug } from '../src/data/constants'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200'

async function fetchAllPoems(): Promise<{ id: string; slug?: string }[]> {
    const poems: { id: string; slug?: string }[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
        try {
            const res = await fetch(`${API}/api/v1/poems?page=${page}&limit=100`)
            if (!res.ok) break
            const data = await res.json()
            if (!data.poems?.length) break
            poems.push(...data.poems.map((p: any) => ({ id: p.id, slug: p.slug })))
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

function buildSitemap(
    baseUrl: string,
    poems: { id: string; slug?: string }[],
    authors: { slug: string }[]
): string {
    const staticPages = [
        { path: '/', priority: '1.0', changefreq: 'daily' },
        { path: '/authors', priority: '0.8', changefreq: 'daily' }
    ]

    const genrePages = MUST_HAVE_CATEGORIES.map(cat => ({
        path: `/${categoryToSlug(cat)}`,
        priority: '0.7',
        changefreq: 'weekly'
    }))

    const poemPages = poems.map(p => ({
        path: `/detail/${p.id}`,
        priority: '0.6',
        changefreq: 'monthly'
    }))

    const authorPages = authors.map(a => ({
        path: `/authors/${a.slug}`,
        priority: '0.6',
        changefreq: 'weekly'
    }))

    const all = [...staticPages, ...genrePages, ...poemPages, ...authorPages]

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`

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
