import React from 'react'
import { GetServerSidePropsContext } from 'next'
import { render } from '@testing-library/react'
import AuthorPage, { getServerSideProps as authorProps } from '../../pages/authors/[slug]'
import * as serverApi from '../lib/serverApi'
import { makePoem } from '../test-utils/fixtures'

/**
 * PAGINATED AUTHOR URLS.
 *
 * `/authors/<slug>` rendered its author's first 10 poems and stopped, and
 * `?page=` was ignored — unlike `/[genre]` and `/`, which were fixed first.
 * Measured against the live collection: 408 authors have more than 10 poems and
 * 3,381 poems (21% of everything here) sat past page 1 of their author page.
 *
 * The rules are the list pages' rules, and each one fails silently:
 *
 *   ONE PAGE OF RESULTS HAS ONE ADDRESS — `?page=1` and junk redirect to the
 *   clean URL instead of rendering a second copy of the same poems.
 *
 *   A PAGE PAST THE END IS A 404 — an in-range-looking URL over an empty list
 *   is the soft-404 shape, and there are infinitely many of them.
 *
 *   EACH PAGE CANONICALISES TO ITSELF — page 3 holds poems page 1 does not, and
 *   the links on a URL Google has folded away are dropped, which is the entire
 *   reason these URLs exist.
 */

// The two backend-availability helpers come from `requireActual`, not stubs:
// they are pure functions, and mocking them out would silently disable the 503
// guard the routes depend on — the mock would be testing a different route than
// the one that ships.
jest.mock('../../src/lib/serverApi', () => ({
    ...jest.requireActual('../../src/lib/serverApi'),
    serverFetch: jest.fn(async () => ({ poems: [], page: 1, hasMore: false, total: 0 })),
    serverFetchResult: jest.fn(async () => ({ status: 200, data: { id: 'a1', name: 'Ada Brine' } })),
    fetchServerUser: jest.fn(async () => null)
}))

const mockServerFetch = serverApi.serverFetch as jest.Mock

// next/head renders nothing into the container under jsdom, so capture what it
// is handed and inspect that instead.
const heads: React.ReactNode[] = []
jest.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
        heads.push(children)
        return null
    }
}))

jest.mock('../components/Authors/AuthorDetail', () => ({
    __esModule: true,
    default: () => <div>author detail</div>
}))

type AnyElement = React.ReactElement<Record<string, unknown>>

function allTags(): AnyElement[] {
    return (heads.flat(Infinity) as unknown[]).filter(
        (child): child is AnyElement =>
            !!child && typeof child === 'object' && 'props' in (child as object)
    )
}

const linkOf = (rel: string) =>
    allTags().find(tag => tag.props.rel === rel)?.props.href as string | undefined

const metaOf = (name: string) =>
    allTags().find(tag => tag.props.name === name)?.props.content as string | undefined

const titleOf = () => String(allTags().find(tag => tag.type === 'title')?.props.children)

describe('the author route honours ?page=', () => {
    const ctx = (query: Record<string, string> = {}) =>
        ({
            req: { cookies: {}, headers: { host: 'poemunity.com' } },
            query,
            params: { slug: 'ada-brine' }
        } as unknown as GetServerSidePropsContext)

    /** A page of poems, so "past the end" is distinguishable from "in range". */
    const withPoems = (count: number, total = 85) =>
        mockServerFetch.mockResolvedValue({
            poems: Array.from({ length: count }, (_, i) => makePoem({ id: `p${i}` })),
            page: 1,
            hasMore: true,
            total,
            totalPages: Math.ceil(total / 10)
        })

    beforeEach(() => {
        jest.clearAllMocks()
        withPoems(10)
    })

    test('fetches the page the URL names, not page 1', async () => {
        await authorProps(ctx({ page: '4' }))

        // The bug this replaces: `page: 1` was hardcoded here, so /authors/x?page=4
        // returned byte-identical poems to /authors/x.
        expect(mockServerFetch).toHaveBeenCalledWith(
            '/api/v1/poems',
            expect.objectContaining({ page: 4, author: 'ada-brine' }),
            undefined
        )
    })

    test('passes the page down to the component', async () => {
        const result = await authorProps(ctx({ page: '4' })) as { props: { currentPage: number } }

        expect(result.props.currentPage).toBe(4)
    })

    test('an unpaged URL is page 1', async () => {
        const result = await authorProps(ctx()) as { props: { currentPage: number } }

        expect(result.props.currentPage).toBe(1)
        expect(mockServerFetch).toHaveBeenCalledWith(
            '/api/v1/poems',
            expect.objectContaining({ page: 1 }),
            undefined
        )
    })

    test('?page=1 redirects to the clean URL rather than rendering it', async () => {
        const result = await authorProps(ctx({ page: '1' }))

        expect(result).toEqual({
            redirect: { destination: '/authors/ada-brine', permanent: false }
        })
    })

    test.each(['0', '-2', 'abc', '1.5', '02', '1e3'])(
        'junk (?page=%s) redirects instead of silently serving page 1',
        async value => {
            const result = await authorProps(ctx({ page: value }))

            expect(result).toEqual({
                redirect: { destination: '/authors/ada-brine', permanent: false }
            })
        }
    )

    test('a page past the end is a 404, not a heading over nothing', async () => {
        withPoems(0)

        expect(await authorProps(ctx({ page: '9999' }))).toEqual({ notFound: true })
    })

    test('but page 1 of an author with no poems is a real page', async () => {
        // The distractor: a 404 rule keyed on "no poems" alone would delete the
        // page of every poet who has not published yet.
        withPoems(0, 0)

        const result = await authorProps(ctx()) as { props: { currentPage: number } }
        expect(result.props.currentPage).toBe(1)
    })
})

describe('what a paginated author page tells search engines', () => {
    beforeEach(() => { heads.length = 0 })

    const renderPage = (currentPage?: number) =>
        render(
            <AuthorPage
                initialPoems={{ poems: [], page: currentPage ?? 1, hasMore: true, total: 85, totalPages: 9 } as never}
                initialAuthor={{ name: 'Ada Brine' } as never}
                initialUser={null}
                slug='ada-brine'
                baseUrl='https://poemunity.com'
                currentPage={currentPage}
            />
        )

    test('page 3 canonicalises to ITSELF, never back to page 1', () => {
        // Folding it into page 1 declares it a duplicate of a page it shares no
        // poems with — and Google drops the links on a URL it has folded away.
        renderPage(3)

        expect(linkOf('canonical')).toBe('https://poemunity.com/authors/ada-brine?page=3')
    })

    test('page 1 canonicalises to the clean URL, with no ?page=1', () => {
        renderPage(1)

        expect(linkOf('canonical')).toBe('https://poemunity.com/authors/ada-brine')
    })

    test('the title carries the page number, so nine pages are not one title', () => {
        renderPage(3)

        expect(titleOf()).toBe('85 poems by Ada Brine — page 3 | Poemunity')
    })

    test('page 1 keeps the clean title people actually search', () => {
        renderPage(1)

        expect(titleOf()).toBe('85 poems by Ada Brine | Poemunity')
    })

    test('the description says which page it is', () => {
        renderPage(3)

        expect(metaOf('description')).toContain('Page 3 of 9')
    })

    test('every page stays indexable — they are not duplicates of each other', () => {
        renderPage(3)

        expect(metaOf('robots')).toBeUndefined()
    })
})

