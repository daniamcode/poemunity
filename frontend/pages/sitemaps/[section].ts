import { GetServerSideProps } from 'next'
import {
    COMMUNITY_ORIGINS,
    SITEMAP_CACHE_CONTROL,
    SitemapEntry,
    SitemapSection,
    assertOriginsPartitionPoems,
    buildAuthorEntries,
    buildPageEntries,
    buildPoemEntries,
    fetchAllAuthors,
    fetchAllPoems,
    fetchNewestByGenre,
    fetchNewestPoemDate,
    fetchPoemTotal,
    isSitemapSection,
    renderUrlset
} from '../../src/lib/sitemap'
import { sitemapBaseUrl } from '../../src/lib/sitemapRequest'

/**
 * One route for the four child sitemaps, chosen by an allowlist. An unknown
 * name is a 404, never a guess and never an empty urlset — an empty urlset
 * answering 200 at any `/sitemaps/<word>.xml` is an unbounded set of crawlable
 * URLs, the same soft-404 shape `/[genre]` had to be fixed for.
 */
async function buildSection(section: SitemapSection): Promise<SitemapEntry[]> {
    switch (section) {
        case 'pages': {
            // Both facts come from `limit=1` probes rather than a walk of all
            // 16,087 poems: the list is sorted `date` DESC, so one row per
            // genre gives its newest date and its `total` gives whether it has
            // any poems at all. Deriving those by paginating the collection
            // cost 26 seconds and 3.6 MB to produce 136 dates.
            const [newestByGenre, newestOverall] = await Promise.all([
                fetchNewestByGenre(),
                fetchNewestPoemDate()
            ])
            return buildPageEntries(newestByGenre, newestOverall)
        }

        case 'authors':
            return buildAuthorEntries(await fetchAllAuthors())

        case 'poems-community': {
            // The poems that exist ONLY here — 435 of them against 15,652
            // famous ones, and since the famous section was dropped this is the
            // ONLY poem sitemap. That makes the partition check below more
            // load-bearing than it was, not less: `origin` is enumerated by
            // hand in COMMUNITY_ORIGINS because the list endpoint has no "not
            // this one", so a fourth origin added tomorrow would now be in no
            // sitemap at all AND noindexed by nothing. The assertion is what
            // turns that into a loud 500 instead of poems quietly vanishing.
            const perOrigin = await Promise.all(
                COMMUNITY_ORIGINS.map(origin => fetchAllPoems(`&origin=${origin}`))
            )
            const community = perOrigin.flat()

            const [famousTotal, overallTotal] = await Promise.all([
                fetchPoemTotal('&origin=famous'),
                fetchPoemTotal()
            ])
            assertOriginsPartitionPoems(famousTotal, community.length, overallTotal)

            return buildPoemEntries(community)
        }
    }
}

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
    const section = params?.section
    if (!isSitemapSection(section)) {
        return { notFound: true }
    }

    // Built BEFORE a single byte is written. A throw here becomes a 500, which
    // is the whole point of the failure policy in `src/lib/sitemap.ts`: Google
    // retries a 500 and keeps trusting the copy it already has, whereas a 200
    // carrying half the URLs reads as "the other half are gone".
    const entries = await buildSection(section)

    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', SITEMAP_CACHE_CONTROL)
    res.write(renderUrlset(sitemapBaseUrl(req), entries))
    res.end()

    return { props: {} }
}

export default function SectionSitemap() {
    return null
}
