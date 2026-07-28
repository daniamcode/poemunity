import { GetServerSideProps } from 'next'
import Dashboard from '../src/components/Dashboard/Dashboard'
import { SeoHead } from '../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../src/lib/serverApi'
import { InitialPoemsData } from '../src/components/List/hooks/usePoemsList'
import { ORDER_BY_LIKES, SEARCH_MIN_LENGTH } from '../src/data/constants'

interface PageProps {
    initialData: InitialPoemsData | null
    initialUser: ServerUser | null
    baseUrl: string
}

export default function IndexPage({ initialData, baseUrl }: PageProps) {
    return (
        <>
            <SeoHead
                title='Your poem community'
                description={
                    'Poemunity is a poem community — discover, read and share poems. ' +
                    'Browse by genre, explore famous and community poets, and publish your own work.'
                }
                url={baseUrl}
            />
            <Dashboard initialData={initialData ?? undefined} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    // A shared or linked search URL must render its results server-side. The
    // client deliberately skips its first fetch when seeded from SSR, so if the
    // server ignored ?q= the page would show the search box filled in beside
    // the complete, unfiltered list.
    const q = typeof query.q === 'string' ? query.q.trim() : ''
    const data = await serverFetch<InitialPoemsData>('/api/v1/poems', {
        page: 1,
        limit: 10,
        orderBy: ORDER_BY_LIKES,
        ...(q.length >= SEARCH_MIN_LENGTH && { q })
    }, token)
    return { props: { initialData: data, initialUser: await fetchServerUser(token), baseUrl } }
}
