import { GetServerSideProps } from 'next'
import Detail from '../../src/components/Detail/Detail'
import Accordion from '../../src/components/SimpleAccordion'
import AuthorsAccordion from '../../src/components/AuthorsAccordion'
import { SeoHead } from '../../src/components/SeoHead'
import {
    serverFetch,
    serverFetchResult,
    fetchServerUser,
    ServerUser,
    isBackendUnavailable,
    markBackendUnavailable
} from '../../src/lib/serverApi'
import { NextPoemResponse } from '../../src/components/Detail/hooks/useNextPoem'
import { JsonLd } from '../../src/components/JsonLd'
import { Breadcrumbs } from '../../src/components/Breadcrumbs'
import { categoryToSlug } from '../../src/data/constants'
import capitalizeFirstLetter from '../../src/utils/capitalizeFirstLetter'
import { poemStructuredData } from '../../src/utils/structuredData'
import { poemTitle, poemDescription } from '../../src/utils/seo'
import { Poem } from '../../src/typescript/interfaces'

interface PageProps {
    initialPoem: Poem | null
    initialNextPoem: NextPoemResponse | null
    initialUser: ServerUser | null
    baseUrl: string
    poemId: string
}

export default function DetailPage({ initialPoem, initialNextPoem, baseUrl, poemId }: PageProps) {
    const title = poemTitle(initialPoem?.title ?? '', initialPoem?.author)
    const description = poemDescription(initialPoem?.poem ?? '')
    // A poem is reachable by BOTH its id and its slug, so the two URLs are
    // duplicates of each other. Canonicalise to the slug — which is also what
    // the sitemap emits — instead of to whichever form the visitor happened to
    // arrive on, which is what a bare `poemId` would do.
    const canonicalId = initialPoem?.slug || poemId
    const url = `${baseUrl}/detail/${canonicalId}`

    return (
        <>
            {/* No `image`: it used to pass the AUTHOR'S AVATAR, a ~44px profile
                picture, as the 1200x630 social card — which crops to mush or is
                rejected outright. SeoHead's site card is the better default
                until there is a real per-poem image. */}
            {/* FAMOUS POEMS ARE noindex,follow — 15,652 of 16,087 of them.
                They are verbatim copies of poems that exist on
                poetryfoundation.org and poets.org, the originals, on far older
                domains, so these pages cannot win a search result against their
                own source however they are marked up. Google agrees already:
                17,349 URLs sit in Search Console as "Discovered — currently not
                indexed". See docs/SEO_AUDIT.md.

                THIS IS A PER-POEM TEST, NOT A PER-ROUTE ONE, and that is the
                whole subtlety. The same route serves the 19 human-written poems
                and the 416 AI ones — the only pages this exercise exists to
                rescue — so a `noIndex` on the route would delete exactly what it
                is trying to save. Hence `origin === 'famous'` rather than
                anything simpler.

                An ALLOWLIST-shaped test on purpose: an origin added later is
                indexable until somebody decides otherwise, which is the failure
                that can be noticed. `!== 'user'` would silently deindex it.

                `follow`, never `nofollow`. These pages still carry the author
                link and the next-poem card, and the audit measured the link
                graph as the weakest thing here: 16,087 poems form a single
                linked list. Deindexing them must not also cut the paths through
                them.

                NOT a deletion — every poem stays readable, linked and in every
                genre list. The only thing withdrawn is the request to rank it. */}
            <SeoHead
                title={title}
                description={description}
                url={url}
                type='article'
                noIndex={initialPoem?.origin === 'famous'}
                followLinks={initialPoem?.origin === 'famous'}
            />
            {initialPoem && (
                <JsonLd id='poem' data={poemStructuredData({ poem: initialPoem, url, baseUrl })} />
            )}
            {/* The rail lives at PAGE level, not inside Detail: Detail is
                rendered directly by its own tests and snapshots, and pulling
                the authors fetch into them would make component tests depend on
                navigation data they do not care about. */}
            <div className='poem-page'>
                <div className='poem-page__accordion'>
                    <Accordion />
                    <AuthorsAccordion />
                </div>
                <div className='poem-page__content'>
                    {/* Poemunity > Love > The moon and the sun. The middle crumb
                        is the poem's own genre, which is also the list it would
                        appear in — so the trail matches how the site is browsed,
                        not just how the URL is shaped. */}
                    <Breadcrumbs
                        baseUrl={baseUrl}
                        crumbs={[
                            { name: 'Poemunity', path: '/' },
                            ...(initialPoem?.genre
                                ? [{
                                    name: capitalizeFirstLetter(initialPoem.genre),
                                    path: `/${categoryToSlug(initialPoem.genre)}`
                                }]
                                : []),
                            { name: initialPoem?.title || 'Poem' }
                        ]}
                    />
                    <Detail initialPoem={initialPoem ?? undefined} initialNextPoem={initialNextPoem} />
                </div>
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req, res }) => {
    const poemId = params?.poemId as string
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    // In PARALLEL, not serially: /next resolves the current poem itself, so it
    // does not depend on the first call and must not add a hop to TTFB.
    // serverFetch swallows failures into null, so an absent next simply renders
    // nothing — it can never break the page.
    const [poemResult, nextPoem, initialUser] = await Promise.all([
        serverFetchResult<Poem>(`/api/v1/poem/${poemId}`, undefined, token),
        serverFetch<NextPoemResponse>(`/api/v1/poem/${poemId}/next`, undefined, token),
        fetchServerUser(token)
    ])

    // A poem the backend will not serve is a 404, not a 200 holding an empty
    // page. This used to render the shell with `initialPoem: null` — HTTP 200,
    // generic title, and a canonical pointing at itself — for anything the API
    // refused: a poem that never existed, and a DRAFT belonging to someone else.
    // The draft's words never leaked (the API 404s and there is no payload to
    // render), but answering 200 still confirmed the slug, and let every guessed
    // or withdrawn URL become an indexable page.
    //
    // Gated on the STATUS, not on `!poem`. The two are not the same: serverFetch
    // returns null for a 500 or a dropped connection too, so a `!poem` check
    // would hard-404 every poem on the site during a backend blip and invite
    // Google to deindex the lot.
    if (poemResult.status === 404) {
        return { notFound: true }
    }

    // ...and a backend that did not answer at all is a 503, not a 200 holding
    // an empty page. Gated on the status for the same reason `notFound` is: a
    // 404 is an answer, an outage is not.
    //
    // This is the confirmed cause of 1,025 soft 404s (see markBackendUnavailable).
    // The reasoning above stopped at two branches — 404 or render-what-we-have —
    // and rendering nothing at 200 is exactly what Google files as a soft 404.
    if (isBackendUnavailable(poemResult.status)) {
        markBackendUnavailable(res)
    }

    return {
        props: { initialPoem: poemResult.data, initialNextPoem: nextPoem, initialUser, baseUrl, poemId }
    }
}
