import { GetServerSidePropsContext } from 'next'
import { getServerSideProps as indexProps } from '../../pages/index'
import { getServerSideProps as genreProps } from '../../pages/[genre]'
import * as serverApi from '../lib/serverApi'
import { SEARCH_MIN_LENGTH } from '../data/constants'

// The two backend-availability helpers come from `requireActual`, not stubs:
// they are pure functions, and mocking them out would silently disable the 503
// guard the routes depend on — the mock would be testing a different route than
// the one that ships.
jest.mock('../../src/lib/serverApi', () => ({
    ...jest.requireActual('../../src/lib/serverApi'),
    serverFetch: jest.fn(async () => ({ poems: [], page: 1, hasMore: false, total: 0 })),
    serverFetchResult: jest.fn(async () => ({ status: 200, data: { poems: [], page: 1, hasMore: false, total: 0 } })),
    fetchServerUser: jest.fn(async () => null)
}))

// The routes fetch their PRIMARY data through `serverFetchResult` — they need
// the status to tell "no such genre" from "the backend is down" (see
// backendUnavailable.test.ts). `serverFetch` is still used for secondary data
// that may legitimately be absent.
const mockServerFetch = serverApi.serverFetchResult as jest.Mock

// A ?q= URL has to be searched SERVER-side. The client deliberately skips its
// first fetch when it was seeded from SSR (usePoemsList's isSeeded guard), so
// if the server ignored the query the page rendered the search box filled in
// next to the complete, unfiltered list — which is exactly what shipped and had
// to be fixed.
describe('search in getServerSideProps', () => {
    const ctx = (query: Record<string, string>, params?: Record<string, string>) =>
        ({
            req: { cookies: {}, headers: { host: 'poemunity.com' } },
            query,
            params
        } as unknown as GetServerSidePropsContext)

    const paramsOf = (call: number = 0) => mockServerFetch.mock.calls[call][1]

    beforeEach(() => jest.clearAllMocks())

    describe.each([
        ['dashboard', (query: Record<string, string>) => indexProps(ctx(query)), undefined],
        ['genre page', (query: Record<string, string>) => genreProps(ctx(query, { genre: 'love' })), 'love']
    ])('%s', (_label, run, expectedGenre) => {
        test('fetches the search results, not the full list', async () => {
            await run({ q: 'Shake' })

            expect(paramsOf()).toMatchObject({ q: 'Shake', page: 1, limit: 10 })
            if (expectedGenre) expect(paramsOf()).toMatchObject({ genre: expectedGenre })
        })

        test('sends no q at all when there is no query', async () => {
            await run({})

            expect(paramsOf()).not.toHaveProperty('q')
        })

        test('trims the query before sending it', async () => {
            await run({ q: '  Shake  ' })

            expect(paramsOf().q).toBe('Shake')
        })

        test('ignores a query below the minimum length, matching the client', async () => {
            await run({ q: 'a'.repeat(SEARCH_MIN_LENGTH - 1) })

            expect(paramsOf()).not.toHaveProperty('q')
        })

        test('ignores a whitespace-only query', async () => {
            await run({ q: '   ' })

            expect(paramsOf()).not.toHaveProperty('q')
        })

        // Next gives an array when a param repeats (?q=a&q=b). Treating that
        // array as a string would send "a,b" to the backend.
        test('ignores a repeated q param rather than sending a joined string', async () => {
            await run({ q: ['a', 'b'] as unknown as string })

            expect(paramsOf()).not.toHaveProperty('q')
        })

        test('still returns initialData so the client keeps skipping its first fetch', async () => {
            const result = await run({ q: 'Shake' })

            expect((result as { props: Record<string, unknown> }).props.initialData).not.toBeUndefined()
        })
    })
})
