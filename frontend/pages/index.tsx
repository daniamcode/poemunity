import { GetServerSideProps } from 'next'
import Dashboard from '../src/components/Dashboard/Dashboard'
import { SeoHead } from '../src/components/SeoHead'
import { serverFetch, buildServerUser, ServerUser } from '../src/lib/serverApi'
import { InitialPoemsData } from '../src/components/List/hooks/usePoemsList'
import { ORDER_BY_LIKES } from '../src/data/constants'

interface PageProps {
    initialData: InitialPoemsData | null
    initialUser: ServerUser | null
    baseUrl: string
}

export default function IndexPage({ initialData, baseUrl }: PageProps) {
    return (
        <>
            <SeoHead
                title='Poemunity'
                description={
                    'Discover, read and share poems. ' +
                    'Browse by genre, explore famous and community poets, and publish your own work.'
                }
                url={baseUrl}
            />
            <Dashboard initialData={initialData ?? undefined} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    const data = await serverFetch<InitialPoemsData>('/api/v1/poems', {
        page: 1,
        limit: 10,
        orderBy: ORDER_BY_LIKES
    }, token)
    return { props: { initialData: data, initialUser: token ? buildServerUser(token) : null, baseUrl } }
}
