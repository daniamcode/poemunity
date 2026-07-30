import { GetServerSidePropsContext } from 'next'
import { render, screen } from '@testing-library/react'
import GenrePage, { getServerSideProps as genreProps } from '../../pages/[genre]'
import AuthorPage from '../../pages/authors/[slug]'
import DetailPage from '../../pages/detail/[poemId]'

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
jest.mock('../components/Detail/Detail', () => ({
    __esModule: true,
    default: () => <div>detail</div>
}))
// The poem page carries the Categories/Authors rail, and those pull from the
// redux store — irrelevant to <head>, so keep them out of the render entirely.
jest.mock('../components/SimpleAccordion', () => ({
    __esModule: true,
    default: () => <div>categories</div>
}))
jest.mock('../components/AuthorsAccordion', () => ({
    __esModule: true,
    default: () => <div>authors</div>
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

function propOf(attr: string, value: string, read: string): string | undefined {
    const match = allTags().find(tag => tag.props[attr] === value)
    return match ? (match.props[read] as string) : undefined
}

function linkOf(rel: string): string | undefined {
    return propOf('rel', rel, 'href')
}

// There are now two ld+json blocks per page (the page entity and the
// breadcrumb trail), so assert on WHICH types are present rather than counting.
function jsonLdTypes(): string[] {
    return allTags()
        .filter(tag => tag.type === 'script')
        .map(tag => {
            const html = (tag.props.dangerouslySetInnerHTML as { __html: string }).__html
            return JSON.parse(html)['@type'] as string
        })
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

        expect(jsonLdTypes()).toContain('CollectionPage')
    })

    // The markup would describe a filtered subset while claiming to be the
    // genre's collection page — and the page is noindex anyway. The breadcrumb
    // trail stays: it describes where the reader is, which is still true.
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

        expect(jsonLdTypes()).not.toContain('CollectionPage')
        expect(jsonLdTypes()).toContain('BreadcrumbList')
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

describe('breadcrumbs on the listing pages', () => {
    beforeEach(() => { heads.length = 0 })

    const trail = () => screen.getAllByRole('listitem').map(li => li.textContent)

    test('a genre page reads Poemunity > <genre> poems', () => {
        render(
            <GenrePage
                initialData={{ poems: [], page: 1, hasMore: false, total: 46 }}
                initialUser={null}
                genre='love'
                baseUrl='https://poemunity.com'
                isSearch={false}
            />
        )

        expect(trail()).toEqual(['Poemunity', 'Love poems'])
    })

    test('an author page reads Poemunity > Authors > <name>', () => {
        render(
            <AuthorPage
                initialPoems={{ poems: [], page: 1, hasMore: false, total: 35 } as never}
                initialAuthor={{ name: 'John Doe' } as never}
                initialUser={null}
                slug='john-doe'
                baseUrl='https://poemunity.com'
            />
        )

        expect(trail()).toEqual(['Poemunity', 'Authors', 'John Doe'])
    })
})

describe('poem page metadata', () => {
    beforeEach(() => { heads.length = 0 })

    const POEM = {
        id: '68f2abc',
        slug: 'the-moon-and-the-sun-moon14',
        title: 'The moon and the sun',
        author: 'Moon14',
        authorSlug: 'moon14',
        poem: 'I miss you like\n\nthe moon misses the sun',
        genre: 'love',
        date: '2024-01-15T10:30:00.000Z',
        likes: ['a', 'b'],
        picture: 'https://poemunity.com/avatars/moon14.jpg',
        userId: 'u1'
    }

    const renderPoem = (poem: Record<string, unknown> | null = POEM, poemId = POEM.slug) =>
        render(
            <DetailPage
                initialPoem={poem as never}
                initialNextPoem={null}
                initialUser={null}
                baseUrl='https://poemunity.com'
                poemId={poemId}
            />
        )

    test('the title names the poem and its poet', () => {
        renderPoem()

        expect(titleOf()).toBe('The moon and the sun by Moon14 | Poemunity')
    })

    test('the description is the poem, flattened onto one line', () => {
        renderPoem()

        expect(metaOf('description')).toBe('I miss you like the moon misses the sun')
    })

    // A poem resolves by BOTH its id and its slug, so the two URLs duplicate
    // each other. The canonical used to echo whichever form the visitor arrived
    // on, so an id URL declared ITSELF canonical and disagreed with the sitemap,
    // which emits slugs.
    describe('canonical URL', () => {
        test('points at the slug even when reached by id', () => {
            renderPoem(POEM, '68f2abc')

            expect(linkOf('canonical')).toBe('https://poemunity.com/detail/the-moon-and-the-sun-moon14')
        })

        test('falls back to the id for a poem with no slug', () => {
            renderPoem({ ...POEM, slug: undefined }, '68f2abc')

            expect(linkOf('canonical')).toBe('https://poemunity.com/detail/68f2abc')
        })
    })

    // It used to pass the author's ~44px avatar as the 1200x630 social card.
    test('does not pass the author avatar as the social image', () => {
        renderPoem()

        expect(propOf('property', 'og:image', 'content')).not.toContain('avatars/moon14.jpg')
    })

    test('the breadcrumb trail runs through the poem\'s own genre', () => {
        renderPoem()

        expect(screen.getAllByRole('listitem').map(li => li.textContent))
            .toEqual(['Poemunity', 'Love poems', 'The moon and the sun'])
        expect(screen.getByRole('link', { name: 'Love poems' })).toHaveAttribute('href', '/love')
    })

    test('the trail skips the genre crumb when the poem has none', () => {
        renderPoem({ ...POEM, genre: '' })

        expect(screen.getAllByRole('listitem').map(li => li.textContent))
            .toEqual(['Poemunity', 'The moon and the sun'])
    })

    describe('JSON-LD', () => {
        test('is emitted for a poem', () => {
            renderPoem()

            expect(jsonLdTypes()).toContain('Poem')
        })

        test('is skipped when the poem could not be loaded', () => {
            renderPoem(null)

            expect(jsonLdTypes()).not.toContain('Poem')
        })
    })
})
