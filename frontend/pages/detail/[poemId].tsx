import { GetServerSideProps } from 'next'
import Detail from '../../src/components/Detail/Detail'
import Accordion from '../../src/components/SimpleAccordion'
import AuthorsAccordion from '../../src/components/AuthorsAccordion'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../../src/lib/serverApi'
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
            <SeoHead
                title={title}
                description={description}
                url={url}
                type='article'
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
                                    name: `${capitalizeFirstLetter(initialPoem.genre)} poems`,
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

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
    const poemId = params?.poemId as string
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    // In PARALLEL, not serially: /next resolves the current poem itself, so it
    // does not depend on the first call and must not add a hop to TTFB.
    // serverFetch swallows failures into null, so an absent next simply renders
    // nothing — it can never break the page.
    const [poem, nextPoem, initialUser] = await Promise.all([
        serverFetch<Poem>(`/api/v1/poem/${poemId}`, undefined, token),
        serverFetch<NextPoemResponse>(`/api/v1/poem/${poemId}/next`, undefined, token),
        fetchServerUser(token)
    ])
    return { props: { initialPoem: poem, initialNextPoem: nextPoem, initialUser, baseUrl, poemId } }
}
