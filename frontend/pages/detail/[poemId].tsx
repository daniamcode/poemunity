import { GetServerSideProps } from 'next'
import Detail from '../../src/components/Detail/Detail'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetch, buildServerUser, ServerUser } from '../../src/lib/serverApi'
import { Poem } from '../../src/typescript/interfaces'

interface PageProps {
    initialPoem: Poem | null
    initialUser: ServerUser | null
    baseUrl: string
    poemId: string
}

export default function DetailPage({ initialPoem, baseUrl, poemId }: PageProps) {
    const title = initialPoem?.title
        ? `${initialPoem.title} by ${initialPoem.author}`
        : 'Poem'
    const description = initialPoem?.poem || ''
    const image = initialPoem?.picture || undefined

    return (
        <>
            <SeoHead
                title={title}
                description={description}
                image={image}
                url={`${baseUrl}/detail/${poemId}`}
                type='article'
            />
            <Detail initialPoem={initialPoem ?? undefined} />
        </>
    )
}

export const getServerSideProps: GetServerSideProps = async ({ params, req }) => {
    const poemId = params?.poemId as string
    const token = req.cookies?.token
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'
    const baseUrl = `${protocol}://${req.headers.host}`
    const poem = await serverFetch<Poem>(`/api/v1/poem/${poemId}`, undefined, token)
    return { props: { initialPoem: poem, initialUser: token ? buildServerUser(token) : null, baseUrl, poemId } }
}
