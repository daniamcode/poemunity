import { GetServerSideProps } from 'next'
import { SITEMAP_CACHE_CONTROL, SITEMAP_SECTIONS, renderSitemapIndex } from '../src/lib/sitemap'
import { sitemapBaseUrl } from '../src/lib/sitemapRequest'

/**
 * `/sitemap.xml` is now a SITEMAP INDEX, not a urlset.
 *
 * The URL is unchanged on purpose — it is what `robots.txt` advertises and what
 * Search Console already has on file, and an index is a valid thing to find at
 * either. Google follows it to the four children in `SITEMAP_SECTIONS` and
 * reports coverage for each one separately, which is the entire point of the
 * split (see the note in `src/lib/sitemap.ts`).
 *
 * Deliberately does NO fetching. This file is the discovery entry point for
 * everything else, so it must not be able to fail for a reason that belongs to
 * one section — a 500 here costs Google every URL on the site, while a 500 on
 * `poems-famous.xml` costs it that section until the next crawl.
 */
export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    res.setHeader('Content-Type', 'application/xml')
    res.setHeader('Cache-Control', SITEMAP_CACHE_CONTROL)
    res.write(renderSitemapIndex(sitemapBaseUrl(req), SITEMAP_SECTIONS))
    res.end()

    return { props: {} }
}

export default function SitemapIndex() {
    return null
}
