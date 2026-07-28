import { GetServerSideProps } from 'next'
import Dashboard from '../src/components/Dashboard/Dashboard'
import { SeoHead } from '../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../src/lib/serverApi'
import { InitialPoemsData } from '../src/components/List/hooks/usePoemsList'
import capitalizeFirstLetter from '../src/utils/capitalizeFirstLetter'
import { ORDER_BY_LIKES, SEARCH_MIN_LENGTH } from '../src/data/constants'

interface PageProps {
    initialData: InitialPoemsData | null
    initialUser: ServerUser | null
    genre: string
    baseUrl: string
}

export default function GenrePage({ initialData, genre, baseUrl }: PageProps) {
    const label = capitalizeFirstLetter(genre.replace(/-/g, ' '))
    return (
        <>
            <SeoHead
                title={`${label} poems`}
                description={
                    `Read and discover ${label} poems. ` +
                    `Explore our community of poets sharing their ${label.toLowerCase()} verses.`
                }
                url={`${baseUrl}/${genre}`}
            />
            <Dashboard initialData={initialData ?? undefined} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req, query }) => {
    const genre = params?.genre as string
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    // See the note in pages/index.tsx: ?q= has to be honoured server-side or the
    // seeded search box renders next to an unfiltered list.
    const q = typeof query.q === 'string' ? query.q.trim() : ''
    const data = await serverFetch<InitialPoemsData>('/api/v1/poems', {
        page: 1,
        limit: 10,
        genre,
        orderBy: ORDER_BY_LIKES,
        ...(q.length >= SEARCH_MIN_LENGTH && { q })
    }, token)
    return { props: { initialData: data, initialUser: await fetchServerUser(token), genre, baseUrl } }
}
