import { GetServerSideProps } from 'next'
import Detail from '../../src/components/Detail/Detail'
import { SeoHead } from '../../src/components/SeoHead'
import { serverFetch, fetchServerUser, ServerUser } from '../../src/lib/serverApi'
import { NextPoemResponse } from '../../src/components/Detail/hooks/useNextPoem'
import { Poem } from '../../src/typescript/interfaces'

interface PageProps {
    initialPoem: Poem | null
    initialNextPoem: NextPoemResponse | null
    initialUser: ServerUser | null
    baseUrl: string
    poemId: string
}

export default function DetailPage({ initialPoem, initialNextPoem, baseUrl, poemId }: PageProps) {
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
            <Detail initialPoem={initialPoem ?? undefined} initialNextPoem={initialNextPoem} />
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
