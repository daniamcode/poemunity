import { GetServerSidePropsContext } from 'next'
import { getServerSideProps as genreProps } from '../../pages/[genre]'
import * as serverApi from '../lib/serverApi'

jest.mock('../../src/lib/serverApi', () => ({
    serverFetch: jest.fn(async () => ({ poems: [], page: 1, hasMore: false, total: 0 })),
    fetchServerUser: jest.fn(async () => null)
}))

const mockServerFetch = serverApi.serverFetch as jest.Mock

/**
 * Two duplicate-content bugs that shipped, both found on the live site:
 *
 *   1. /Home returned 200 with the same 63 poems as /home, canonicalising to
 *      "https://poemunity.com/Home" — i.e. declaring the variant to be the
 *      original. Every genre times every casing was a distinct indexable URL.
 *   2. /asdfnonsense returned 200 with an "Asdfnonsense poems" heading and its
 *      own self-referencing canonical — a soft 404, unbounded in count.
 *
 * The fixture deliberately gives WRONG implementations a different answer:
 * `love` is a curated category, `legacy-genre` stands for a slug that is NOT in
 * CATEGORIES but still has poems, and `asdfnonsense` is neither. A fix that only
 * consults CATEGORIES passes the first and third cases while 404ing live poems
 * on the second.
 *
 * That middle case is not hypothetical: `anger`, `imagination`, `spirituality`
 * and `sports` were exactly that for months — 168 poems in the database with no
 * CATEGORIES entry, because the 140-category migration wrote all 140 genres and
 * only some reached constants.ts. They have since been ADDED to CATEGORIES, so
 * they no longer serve as the fixture (they now take the known-category path —
 * pinned below); the synthetic slug keeps the case covered for the next drift.
 */
describe('genre page canonicalisation', () => {
    const ctx = (genre: string, query: Record<string, string> = {}) =>
        ({
            req: { cookies: {}, headers: { host: 'poemunity.com' } },
            query,
            params: { genre }
        } as unknown as GetServerSidePropsContext)

    /** Make the poems API report `total` for every call in this test. */
    const withTotal = (total: number) =>
        mockServerFetch.mockResolvedValue({ poems: [], page: 1, hasMore: false, total })

    beforeEach(() => jest.clearAllMocks())

    describe('casing', () => {
        test.each([
            ['Home', '/home'],
            ['HOME', '/home'],
            ['hOmE', '/home'],
            ['Sorrow-And-Grieving', '/sorrow-and-grieving']
        ])('redirects /%s permanently to %s', async (requested, destination) => {
            const result = await genreProps(ctx(requested))

            expect(result).toEqual({ redirect: { destination, permanent: true } })
        })

        test('does not redirect a slug that is already lowercase', async () => {
            const result = await genreProps(ctx('love'))

            expect(result).not.toHaveProperty('redirect')
        })

        test('preserves the search query across the redirect', async () => {
            const result = await genreProps(ctx('Home', { q: 'a b&c' }))

            expect(result).toEqual({
                redirect: { destination: '/home?q=a%20b%26c', permanent: true }
            })
        })

        test('redirects before fetching — a variant costs no API call', async () => {
            await genreProps(ctx('Home'))

            expect(mockServerFetch).not.toHaveBeenCalled()
        })
    })

    describe('unknown slugs', () => {
        test('404s a slug that is not a category and has no poems', async () => {
            withTotal(0)

            const result = await genreProps(ctx('asdfnonsense'))

            expect(result).toEqual({ notFound: true })
        })

        test('404s when the poems API is unreachable', async () => {
            mockServerFetch.mockResolvedValue(null)

            const result = await genreProps(ctx('asdfnonsense'))

            expect(result).toEqual({ notFound: true })
        })

        test('renders an unlisted slug that does have poems', async () => {
            withTotal(77)

            const result = await genreProps(ctx('legacy-genre'))

            expect(result).not.toHaveProperty('notFound')
            expect(result).toHaveProperty('props')
        })

        test('probes without ?q= so a fruitless search is not mistaken for a missing page', async () => {
            withTotal(77)

            await genreProps(ctx('legacy-genre', { q: 'nothingmatchesthis' }))

            // First call is the existence probe; it must be unfiltered, or a
            // genre searched for a term it lacks would 404 instead of showing
            // an empty result.
            expect(mockServerFetch.mock.calls[0][1]).not.toHaveProperty('q')
        })
    })

    describe('curated categories', () => {
        // Regression pin for the four the migration orphaned: they are now in
        // CATEGORIES, so they must take the known path — rendering with no probe
        // even if a query returns nothing.
        test.each(['anger', 'imagination', 'spirituality', 'sports'])(
            '/%s is a known category and needs no probe', async genre => {
                withTotal(0)

                const result = await genreProps(ctx(genre))

                expect(result).toHaveProperty('props')
                expect(mockServerFetch).toHaveBeenCalledTimes(1)
            }
        )

        test('renders even with no poems yet', async () => {
            withTotal(0)

            const result = await genreProps(ctx('love'))

            expect(result).not.toHaveProperty('notFound')
            expect(result).toHaveProperty('props')
        })

        test('costs no extra probe request', async () => {
            withTotal(0)

            await genreProps(ctx('love'))

            expect(mockServerFetch).toHaveBeenCalledTimes(1)
        })
    })
})
