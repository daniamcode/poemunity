import { GetServerSideProps } from 'next'
import { EmbedPoem } from '../../src/components/Embed/EmbedPoem'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetchResult, isBackendUnavailable, markBackendUnavailable } from '../../src/lib/serverApi'
import { poemTitle, poemDescription } from '../../src/utils/seo'
import { SITE_URL } from '../../src/lib/siteUrl'
import { Poem } from '../../src/typescript/interfaces'

interface PageProps {
    initialPoem: Poem | null
    poemId: string
    /**
     * Tells `_app.tsx` to drop the entire site shell. Set here in
     * `getServerSideProps` rather than derived from the router, so the markup
     * the browser hydrates has no header in it to begin with — a shell removed
     * one frame after hydration would flash navigation inside every embedded
     * poem on somebody else's page.
     */
    chromeless: true
}

/**
 * THE FRAME TARGET — this page exists to be loaded inside an `<iframe>` on a
 * third-party website, and nothing else.
 *
 * Everything that would be dead weight at 420px is stripped: no header, no
 * accordion rails, no comments, no breadcrumbs, no footer (the disclosure that
 * normally lives in the footer rides on the byline instead — see EmbedPoem).
 *
 * TWO DECISIONS THAT ARE NOT FREE CHOICES:
 *
 * 1. **NO AUTH TOKEN IS SENT.** Deliberately, and it is a privacy guarantee
 *    rather than an optimisation. An embed is by construction public — once
 *    the snippet is pasted, anyone can load it — so a draft must never be
 *    embeddable *by anybody*, including its own author. Calling the endpoint
 *    without credentials is what enforces that: the API answers 404 for a
 *    draft it cannot attribute, and `notFound` fires. Passing `req.cookies.token`
 *    would let an author hand a private poem to the public web with one copy.
 *
 * 2. **`noindex,follow`, with a canonical to the poem's real page.** Sixteen
 *    thousand near-duplicate pages in an index that already struggles to get
 *    1,761 URLs crawled would be a straight loss of crawl budget, and split
 *    ranking signals between `/detail/x` and `/embed/x` for no gain. `follow`
 *    rather than `nofollow` because the one thing this page links to is the
 *    poem it came from. The link that actually matters is not this one — it is
 *    the anchor emitted by the THIRD-PARTY page, which is unaffected by how we
 *    mark this.
 */
export default function EmbedPage({ initialPoem, poemId }: PageProps) {
    if (!initialPoem) {
        // Reached only when the backend did not answer — a missing poem is a
        // 404 above. A blank white box inside somebody else's page reads as a
        // broken embed, so say what happened and keep the attribution route.
        return (
            <>
                <SeoHead title='Poemunity' noIndex followLinks />
                <p className='embed__unavailable' role='status'>
                    This poem is temporarily unavailable.
                </p>
            </>
        )
    }

    const canonicalUrl = `${SITE_URL}/detail/${initialPoem.slug || poemId}`

    return (
        <>
            <SeoHead
                title={poemTitle(initialPoem.title, initialPoem.author)}
                description={poemDescription(initialPoem.poem)}
                url={canonicalUrl}
                noIndex
                followLinks
            />
            <EmbedPoem poem={initialPoem} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
    const poemId = params?.poemId as string

    // No `token`, on purpose — see the docblock above.
    const poemResult = await serverFetchResult<Poem>(`/api/v1/poem/${poemId}`)

    // The same two gates the detail page uses, and for the same reasons. A 404
    // is an answer about a real URL and becomes `notFound`; a 500 or a dropped
    // connection is not, and rendering the unavailable state at 200 instead of
    // letting every outage hard-404 the URL space.
    if (poemResult.status === 404) {
        return { notFound: true }
    }

    if (isBackendUnavailable(poemResult.status)) {
        markBackendUnavailable(res)
    }

    return {
        props: {
            initialPoem: poemResult.data,
            poemId,
            chromeless: true
        }
    }
}
