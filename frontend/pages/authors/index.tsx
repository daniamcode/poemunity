import { GetServerSideProps } from 'next'
import AuthorsIndex from '../../src/components/Authors/AuthorsIndex'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetch, buildServerUser, ServerUser } from '../../src/lib/serverApi'
import { Author } from '../../src/typescript/interfaces'

interface PageProps {
    initialLetters: string[] | null
    initialAuthors: Author[] | null
    initialUser: ServerUser | null
    baseUrl: string
}

export default function AuthorsIndexPage({ initialLetters, initialAuthors, baseUrl }: PageProps) {
    return (
        <>
            <SeoHead
                title='Poetry Authors'
                description='Browse famous poets, AI-generated authors and community writers. Explore their poems on Poemunity.'
                url={`${baseUrl}/authors`}
            />
            <AuthorsIndex
                initialLetters={initialLetters ?? undefined}
                initialAuthors={initialAuthors ?? undefined}
            />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    const [initialLetters, initialAuthors] = await Promise.all([
        serverFetch<string[]>('/api/v1/authors/letters', undefined, token),
        serverFetch<Author[]>('/api/v1/authors', { letter: 'A' }, token)
    ])
    return { props: { initialLetters, initialAuthors, initialUser: token ? buildServerUser(token) : null, baseUrl } }
}
