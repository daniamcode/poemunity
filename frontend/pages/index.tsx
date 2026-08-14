import { GetServerSideProps } from 'next'
import Dashboard from '../src/components/Dashboard/Dashboard'
import { SeoHead } from '../src/components/SeoHead'
import {
    serverFetchResult,
    fetchServerUser,
    ServerUser,
    isBackendUnavailable,
    markBackendUnavailable
} from '../src/lib/serverApi'
import { InitialPoemsData } from '../src/components/List/hooks/usePoemsList'
import { ORDER_BY_LIKES, PAGINATION_LIMIT, SEARCH_MIN_LENGTH } from '../src/data/constants'
import { PAGE_PARAM, buildPageHref, parsePageParam } from '../src/utils/pagination'
import { JsonLd } from '../src/components/JsonLd'
import { websiteStructuredData, organizationStructuredData } from '../src/utils/structuredData'

interface PageProps {
    initialData: InitialPoemsData | null
    initialUser: ServerUser | null
    baseUrl: string
    /** 1-based page from `?page=`. Absent means page 1. */
    currentPage?: number
}

export default function IndexPage({ initialData, baseUrl, currentPage = 1 }: PageProps) {
    return (
        <>
            <SeoHead
                title={currentPage > 1 ? `Poems — page ${currentPage}` : 'Your poem community'}
                description={
                    'Poemunity is a poem community — discover, read and share poems. ' +
                    'Browse by genre, explore famous and community poets, and publish your own work.'
                }
                // Self-canonical per page: page 2 holds different poems, and
                // pointing it at the homepage would declare it a duplicate of a
                // page it shares nothing with — taking its links with it.
                url={`${baseUrl}${buildPageHref('/', currentPage)}`}
            />
            {/* Page 1 only. `WebSite` and `Organization` describe the site, not
                this page, and a SearchAction repeated on page 47 of the list
                would assert the same entity at 125 URLs. */}
            {currentPage === 1 && (
                <>
                    <JsonLd id='website' data={websiteStructuredData(baseUrl)} />
                    <JsonLd id='organization' data={organizationStructuredData(baseUrl)} />
                </>
            )}
            <Dashboard initialData={initialData ?? undefined} currentPage={currentPage} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res, query }) => {
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    // A shared or linked search URL must render its results server-side. The
    // client deliberately skips its first fetch when seeded from SSR, so if the
    // server ignored ?q= the page would show the search box filled in beside
    // the complete, unfiltered list.
    const q = typeof query.q === 'string' ? query.q.trim() : ''
    const search = q.length >= SEARCH_MIN_LENGTH ? q : ''

    // See src/utils/pagination.ts. Junk and ?page=1 redirect to `/` rather than
    // rendering, so one page of results never has two addresses.
    const parsed = parsePageParam(query[PAGE_PARAM])
    if (parsed.kind === 'redirect' && query[PAGE_PARAM] !== undefined) {
        return {
            redirect: { destination: buildPageHref('/', 1, { q: search || undefined }), permanent: false }
        }
    }
    const currentPage = parsed.kind === 'ok' ? parsed.page : 1

    const result = await serverFetchResult<InitialPoemsData>('/api/v1/poems', {
        page: currentPage,
        limit: PAGINATION_LIMIT,
        orderBy: ORDER_BY_LIKES,
        ...(search && { q: search })
    }, token)
    const data = result.data

    // BEFORE the past-the-end check below, which is the point. "No poems came
    // back" and "the backend is down" are not the same fact, and the 404 below
    // reads the first from the second: during an outage every `?page=2` would
    // answer 404 and invite Google to deindex it. A 503 says try again.
    if (isBackendUnavailable(result.status)) {
        markBackendUnavailable(res)
        return { props: { initialData: null, initialUser: await fetchServerUser(token), baseUrl, currentPage } }
    }

    // A page past the end is a 404, not a heading over nothing — see the same
    // note on the genre route.
    if (currentPage > 1 && !data?.poems?.length) {
        return { notFound: true }
    }

    return { props: { initialData: data, initialUser: await fetchServerUser(token), baseUrl, currentPage } }
}
