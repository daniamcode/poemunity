import { GetServerSideProps } from 'next'
import AuthorDetail, { AuthorProfile } from '../../src/components/Authors/AuthorDetail'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetch, serverFetchResult, fetchServerUser, ServerUser } from '../../src/lib/serverApi'
import { InitialAuthorPoemsData } from '../../src/components/Authors/useAuthorPoems'
import { JsonLd } from '../../src/components/JsonLd'
import { Breadcrumbs } from '../../src/components/Breadcrumbs'
import { authorStructuredData } from '../../src/utils/structuredData'
import { authorTitle, authorDescription } from '../../src/utils/seo'
import { PAGINATION_LIMIT } from '../../src/data/constants'
import { PAGE_PARAM, buildPageHref, pageCount, parsePageParam } from '../../src/utils/pagination'

interface PageProps {
    initialPoems: InitialAuthorPoemsData | null
    initialAuthor: AuthorProfile | null
    initialUser: ServerUser | null
    slug: string
    baseUrl: string
    /** 1-based page from `?page=`. Absent means page 1. */
    currentPage?: number
}

export default function AuthorDetailPage({
    initialPoems,
    initialAuthor,
    slug,
    baseUrl,
    currentPage = 1
}: PageProps) {
    const authorName = initialAuthor?.name
        || (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Author')
    const total = initialPoems?.total ?? 0
    const image = initialAuthor?.picture || undefined
    const totalPages = initialPoems?.totalPages ?? pageCount(total, PAGINATION_LIMIT)
    // Self-canonical per page, never back to page 1 — same rule as the genre
    // lists. Page 3 of a poet holds poems page 1 does not, so folding it into
    // page 1 declares it a duplicate of a page it shares nothing with, and the
    // links on a folded-away URL are dropped.
    const url = `${baseUrl}${buildPageHref(`/authors/${slug}`, currentPage)}`
    const description = authorDescription(authorName, total, initialAuthor?.bio, currentPage, totalPages)

    return (
        <>
            <SeoHead
                title={authorTitle(authorName, total, currentPage)}
                description={description}
                image={image}
                url={url}
            />
            <JsonLd
                id='author-collection'
                data={authorStructuredData({
                    name: authorName,
                    description,
                    url,
                    baseUrl,
                    bio: initialAuthor?.bio,
                    image,
                    authorType: initialAuthor?.type,
                    poems: initialPoems?.poems
                })}
            />
            <Breadcrumbs
                baseUrl={baseUrl}
                crumbs={[
                    { name: 'Poemunity', path: '/' },
                    { name: 'Authors', path: '/authors' },
                    { name: authorName }
                ]}
            />
            <AuthorDetail
                initialPoems={initialPoems ?? undefined}
                initialAuthor={initialAuthor}
                currentPage={currentPage}
            />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req, query }) => {
    const slug = params?.slug as string
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`

    // `?page=` used to be ignored here, unlike /[genre] and /: the page rendered
    // its author's first 10 poems and stopped. 408 authors have more than 10,
    // and 3,381 poems — 21% of the collection — sat past page 1 of their author
    // page with no URL on this route that reached them.
    //
    // Same three rules as the lists: page 1 is the clean URL, junk and `?page=1`
    // redirect onto it rather than rendering a second address for the same
    // poems, and a page past the end is a 404 below.
    const parsed = parsePageParam(query[PAGE_PARAM])
    if (parsed.kind === 'redirect' && query[PAGE_PARAM] !== undefined) {
        return {
            redirect: { destination: `/authors/${slug}`, permanent: false }
        }
    }
    const currentPage = parsed.kind === 'ok' ? parsed.page : 1

    const [initialPoems, authorResult] = await Promise.all([
        serverFetch<InitialAuthorPoemsData>(
            '/api/v1/poems',
            { page: currentPage, limit: PAGINATION_LIMIT, author: slug },
            token
        ),
        serverFetchResult<AuthorProfile>(`/api/v1/authors/${slug}`, undefined, token)
    ])

    // Same rule as the poem page, and the same reason (status, not `!author`,
    // so an outage cannot 404 every poet at once). It matters more here: with no
    // author the page DERIVES a display name from the slug, so
    // /authors/no-such-poet-xyz answered 200 with the title "Poems by No Such
    // Poet Xyz" — an unbounded space of URLs each claiming to be a real poet.
    if (authorResult.status === 404) {
        return { notFound: true }
    }

    // A page past the end is a 404, not a heading over an empty list — the
    // soft-404 shape, and unbounded. Page 1 is exempt: a real poet with nothing
    // published yet is a real page that says so.
    if (currentPage > 1 && !initialPoems?.poems?.length) {
        return { notFound: true }
    }

    return {
        props: {
            initialPoems,
            initialAuthor: authorResult.data,
            initialUser: await fetchServerUser(token),
            slug,
            baseUrl,
            currentPage
        }
    }
}
