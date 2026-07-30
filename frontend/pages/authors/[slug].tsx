import { GetServerSideProps } from 'next'
import AuthorDetail, { AuthorProfile } from '../../src/components/Authors/AuthorDetail'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../../src/lib/serverApi'
import { InitialAuthorPoemsData } from '../../src/components/Authors/useAuthorPoems'
import { JsonLd } from '../../src/components/JsonLd'
import { Breadcrumbs } from '../../src/components/Breadcrumbs'
import { authorStructuredData } from '../../src/utils/structuredData'
import { authorTitle, authorDescription } from '../../src/utils/seo'

interface PageProps {
    initialPoems: InitialAuthorPoemsData | null
    initialAuthor: AuthorProfile | null
    initialUser: ServerUser | null
    slug: string
    baseUrl: string
}

export default function AuthorDetailPage({ initialPoems, initialAuthor, slug, baseUrl }: PageProps) {
    const authorName = initialAuthor?.name
        || (slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Author')
    const total = initialPoems?.total ?? 0
    const image = initialAuthor?.picture || undefined
    const url = `${baseUrl}/authors/${slug}`
    const description = authorDescription(authorName, total, initialAuthor?.bio)

    return (
        <>
            <SeoHead
                title={authorTitle(authorName, total)}
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
            />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
    const slug = params?.slug as string
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    const [initialPoems, initialAuthor] = await Promise.all([
        serverFetch<InitialAuthorPoemsData>('/api/v1/poems', { page: 1, limit: 10, author: slug }, token),
        serverFetch<AuthorProfile>(`/api/v1/authors/${slug}`, undefined, token)
    ])
    return { props: { initialPoems, initialAuthor, initialUser: await fetchServerUser(token), slug, baseUrl } }
}
