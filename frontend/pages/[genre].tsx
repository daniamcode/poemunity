import { GetServerSideProps } from 'next'
import Dashboard from '../src/components/Dashboard/Dashboard'
import { SeoHead } from '../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../src/lib/serverApi'
import { InitialPoemsData } from '../src/components/List/hooks/usePoemsList'
import capitalizeFirstLetter from '../src/utils/capitalizeFirstLetter'
import { genreTitle, genreDescription } from '../src/utils/seo'
import { ORDER_BY_LIKES, SEARCH_MIN_LENGTH } from '../src/data/constants'

interface PageProps {
    initialData: InitialPoemsData | null
    initialUser: ServerUser | null
    genre: string
    baseUrl: string
    /** Whether this render is a search result rather than the genre itself. */
    isSearch: boolean
}

export default function GenrePage({ initialData, genre, baseUrl, isSearch }: PageProps) {
    const label = capitalizeFirstLetter(genre.replace(/-/g, ' '))
    const total = initialData?.total ?? 0

    return (
        <>
            {/* Search URLs are noindex,follow with a canonical back to the clean
                genre page. Three separate jobs: noindex keeps an unbounded set of
                thin ?q= pages out of the index, `follow` still lets the crawler
                use the links on them, and the canonical consolidates any signal
                onto /love. The count would be wrong on them anyway — `total` is
                the FILTERED total, so an indexed ?q= page would claim the genre
                holds 3 poems. */}
            <SeoHead
                title={genreTitle(label, total)}
                description={genreDescription(label, total, initialData?.poems)}
                url={`${baseUrl}/${genre}`}
                noIndex={isSearch}
                followLinks={isSearch}
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
    return {
        props: {
            initialData: data,
            initialUser: await fetchServerUser(token),
            genre,
            baseUrl,
            isSearch: q.length >= SEARCH_MIN_LENGTH
        }
    }
}
