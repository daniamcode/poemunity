import { GetServerSidePropsContext } from 'next'
import { getServerSideProps as poemProps } from '../../pages/detail/[poemId]'
import { getServerSideProps as authorProps } from '../../pages/authors/[slug]'
import * as serverApi from '../lib/serverApi'

jest.mock('../../src/lib/serverApi', () => ({
    serverFetch: jest.fn(async () => null),
    serverFetchResult: jest.fn(async () => ({ data: null, status: 200 })),
    fetchServerUser: jest.fn(async () => null)
}))

const mockResult = serverApi.serverFetchResult as jest.Mock

/**
 * Soft 404s on the two record pages.
 *
 * Both used to answer HTTP 200 for anything the API refused, rendering the page
 * shell with a null record and a canonical pointing at itself:
 *
 *   /detail/1-dani        — someone else's DRAFT. Its words never leaked (the
 *                           API 404s and there is nothing to render), but a 200
 *                           still confirmed the slug exists, and every withdrawn
 *                           poem stayed an indexable URL.
 *   /authors/no-such-poet — worse, because with no author the page DERIVES a
 *                           name from the slug: "Poems by No Such Poet".
 *                           An unbounded space of URLs each claiming a real poet.
 *
 * The fix keys on the STATUS, and that distinction is what these tests are
 * really for. `serverFetch` returns null for a 500 and a dropped connection as
 * well as a 404, so the obvious `if (!record) return notFound` would turn a
 * backend blip into a site-wide 404 and invite Google to deindex everything.
 * Each block below therefore pairs the 404 case with a 500 and a network
 * failure that must NOT 404 — a wrong implementation gets those two wrong while
 * passing the first.
 */
describe('record pages answer 404 rather than an empty 200', () => {
    beforeEach(() => jest.clearAllMocks())

    const ctx = (params: Record<string, string>) =>
        ({
            req: { cookies: {}, headers: { host: 'poemunity.com' } },
            query: {},
            params
        } as unknown as GetServerSidePropsContext)

    describe('poem detail', () => {
        const run = () => poemProps(ctx({ poemId: '1-dani' }))

        test('404s a poem the API will not serve', async () => {
            mockResult.mockResolvedValue({ data: null, status: 404 })

            expect(await run()).toEqual({ notFound: true })
        })

        test('renders a poem it can fetch', async () => {
            mockResult.mockResolvedValue({ data: { id: 'p1', title: 'Real' }, status: 200 })

            const result = await run()

            expect(result).not.toHaveProperty('notFound')
            expect(result).toHaveProperty('props')
        })

        test.each([
            ['a 500 from the backend', 500],
            ['a request that never completed', 0]
        ])('does NOT 404 on %s', async (_label, status) => {
            mockResult.mockResolvedValue({ data: null, status })

            const result = await run()

            expect(result).not.toHaveProperty('notFound')
        })
    })

    describe('author page', () => {
        const run = () => authorProps(ctx({ slug: 'no-such-poet-xyz' }))

        test('404s an author that does not exist', async () => {
            mockResult.mockResolvedValue({ data: null, status: 404 })

            expect(await run()).toEqual({ notFound: true })
        })

        test('renders an author it can fetch', async () => {
            mockResult.mockResolvedValue({ data: { id: 'a1', name: 'Real Poet' }, status: 200 })

            const result = await run()

            expect(result).not.toHaveProperty('notFound')
            expect(result).toHaveProperty('props')
        })

        test.each([
            ['a 500 from the backend', 500],
            ['a request that never completed', 0]
        ])('does NOT 404 on %s', async (_label, status) => {
            mockResult.mockResolvedValue({ data: null, status })

            const result = await run()

            expect(result).not.toHaveProperty('notFound')
        })
    })
})
