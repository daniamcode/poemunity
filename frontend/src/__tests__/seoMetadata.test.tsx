import { GetServerSidePropsContext } from 'next'
import { render } from '@testing-library/react'
import GenrePage, { getServerSideProps as genreProps } from '../../pages/[genre]'
import AuthorPage from '../../pages/authors/[slug]'

jest.mock('../../src/lib/serverApi', () => ({
    serverFetch: jest.fn(async () => ({ poems: [], page: 1, hasMore: false, total: 0 })),
    fetchServerUser: jest.fn(async () => null)
}))

// The page bodies are irrelevant here — this suite is about what lands in
// <head>. Stubbing them keeps the render free of data fetching and routing.
jest.mock('../components/Dashboard/Dashboard', () => ({
    __esModule: true,
    default: () => <div>dashboard</div>
}))
jest.mock('../components/Authors/AuthorDetail', () => ({
    __esModule: true,
    default: () => <div>author</div>
}))

// next/head renders nothing into the container in a test env, so capture the
// children it is handed and inspect those instead.
const heads: React.ReactNode[] = []
jest.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
        heads.push(children)
        return null
    }
}))

type AnyElement = React.ReactElement<Record<string, unknown>>

// Scan EVERY captured head, not just the last: these pages render two, one for
// the meta tags and one for the JSON-LD, and which comes last is an
// implementation detail no assertion should depend on.
function allTags(): AnyElement[] {
    return (heads.flat(Infinity) as unknown[]).filter(
        (child): child is AnyElement =>
            !!child && typeof child === 'object' && 'props' in (child as object)
    )
}

function metaOf(name: string): string | undefined {
    const match = allTags().find(tag => tag.props.name === name)
    return match ? (match.props.content as string) : undefined
}

function titleOf(): string {
    const match = allTags().find(tag => tag.type === 'title')
    return String(match?.props.children)
}

describe('genre page metadata', () => {
    beforeEach(() => { heads.length = 0 })

    const renderGenre = (props: Partial<Parameters<typeof GenrePage>[0]> = {}) =>
        render(
            <GenrePage
                initialData={{ poems: [], page: 1, hasMore: false, total: 46 }}
                initialUser={null}
                genre='love'
                baseUrl='https://poemunity.com'
                isSearch={false}
                {...props}
            />
        )

    test('the title carries the count', () => {
        renderGenre()

        expect(titleOf()).toBe('46 Love poems | Poemunity')
    })

    test('a multi-word genre slug reads as words', () => {
        renderGenre({ genre: 'love-and-loss' })

        expect(titleOf()).toBe('46 Love and loss poems | Poemunity')
    })

    test('the description names poems from the page', () => {
        renderGenre({
            initialData: {
                poems: [{ title: 'Silence', author: 'Ana Gil' } as never],
                page: 1,
                hasMore: false,
                total: 46
            }
        })

        expect(metaOf('description')).toContain('“Silence” by Ana Gil')
    })

    // Without this, every ?q= anyone ever types becomes an indexable page, and
    // each one claims the genre holds only the number of poems it matched.
    describe('search URLs', () => {
        // noindex,FOLLOW, not nofollow: the query page is not worth indexing but
        // the poems it links to are, and a blanket nofollow there wastes crawl.
        test('are noindex but still followed', () => {
            renderGenre({ isSearch: true })

            expect(metaOf('robots')).toBe('noindex,follow')
        })

        test('the plain genre page is left indexable', () => {
            renderGenre({ isSearch: false })

            expect(metaOf('robots')).toBeUndefined()
        })
    })

    describe('getServerSideProps', () => {
        const ctx = (query: Record<string, string>) =>
            ({
                req: { cookies: {}, headers: { host: 'poemunity.com' } },
                query,
                params: { genre: 'love' }
            } as unknown as GetServerSidePropsContext)

        test('flags a real query as a search', async () => {
            const result = await genreProps(ctx({ q: 'rain' })) as { props: { isSearch: boolean } }

            expect(result.props.isSearch).toBe(true)
        })

        test('does not flag a query below the minimum length', async () => {
            const result = await genreProps(ctx({ q: 'a' })) as { props: { isSearch: boolean } }

            expect(result.props.isSearch).toBe(false)
        })

        test('does not flag a page with no query at all', async () => {
            const result = await genreProps(ctx({})) as { props: { isSearch: boolean } }

            expect(result.props.isSearch).toBe(false)
        })
    })
})

describe('genre JSON-LD', () => {
    beforeEach(() => { heads.length = 0 })

    const scripts = () =>
        allTags().filter(tag => tag.type === 'script')

    test('is emitted on a plain genre page', () => {
        render(
            <GenrePage
                initialData={{ poems: [], page: 1, hasMore: false, total: 46 }}
                initialUser={null}
                genre='love'
                baseUrl='https://poemunity.com'
                isSearch={false}
            />
        )

        expect(scripts()).toHaveLength(1)
    })

    // The markup would describe a filtered subset while claiming to be the
    // genre's collection page — and the page is noindex anyway.
    test('is suppressed on search results', () => {
        render(
            <GenrePage
                initialData={{ poems: [], page: 1, hasMore: false, total: 3 }}
                initialUser={null}
                genre='love'
                baseUrl='https://poemunity.com'
                isSearch
            />
        )

        expect(scripts()).toHaveLength(0)
    })
})

describe('author page metadata', () => {
    beforeEach(() => { heads.length = 0 })

    const renderAuthor = (props: Partial<Parameters<typeof AuthorPage>[0]> = {}) =>
        render(
            <AuthorPage
                initialPoems={{ poems: [], page: 1, hasMore: false, total: 35 } as never}
                initialAuthor={{ name: 'John Doe' } as never}
                initialUser={null}
                slug='john-doe'
                baseUrl='https://poemunity.com'
                {...props}
            />
        )

    test('the title reads "N poems by NAME"', () => {
        renderAuthor()

        expect(titleOf()).toBe('35 poems by John Doe | Poemunity')
    })

    // The bio used to REPLACE the count sentence, so a bio that never mentioned
    // poetry left no sign the page lists poems.
    test('the description keeps the count even when there is a bio', () => {
        renderAuthor({ initialAuthor: { name: 'John Doe', bio: 'Grew up in Cádiz.' } as never })

        const description = metaOf('description')
        expect(description).toContain('35 poems by John Doe')
        expect(description).toContain('Grew up in Cádiz.')
    })

    test('falls back to a name derived from the slug', () => {
        renderAuthor({ initialAuthor: null })

        expect(titleOf()).toBe('35 poems by John Doe | Poemunity')
    })
})
