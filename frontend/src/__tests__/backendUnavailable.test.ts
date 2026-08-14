import { GetServerSidePropsContext } from 'next'
import { getServerSideProps as poemProps } from '../../pages/detail/[poemId]'
import { getServerSideProps as authorProps } from '../../pages/authors/[slug]'
import { getServerSideProps as genreProps } from '../../pages/[genre]'
import { getServerSideProps as indexProps } from '../../pages/index'
import * as serverApi from '../lib/serverApi'

jest.mock('../../src/lib/serverApi', () => {
    const actual = jest.requireActual('../../src/lib/serverApi')
    return {
        ...actual,
        serverFetch: jest.fn(),
        serverFetchResult: jest.fn(),
        fetchServerUser: jest.fn(async () => null)
    }
})

const mockResult = serverApi.serverFetchResult as jest.Mock
const mockFetch = serverApi.serverFetch as jest.Mock

/**
 * WHEN THE BACKEND IS DOWN, SAY 503 — NOT 200 OVER AN EMPTY PAGE.
 *
 * This is the confirmed cause of 1,025 soft 404s in Search Console, all dated
 * to the crawl surge that followed the 7 Aug 2026 sitemap submission. Point the
 * app at a dead backend and request any poem and it answered:
 *
 *     HTTP 200 · <title>Poem | Poemunity</title> · empty description
 *     · self-referencing canonical · no poem anywhere in the HTML
 *
 * The routes had already reasoned about half of it — `notFound` is gated on a
 * 404 STATUS rather than on `!data`, so an outage cannot deindex the site — but
 * that left two branches where there are three. "The record does not exist",
 * "the backend is unreachable" and "here is the record" are different answers,
 * and only the middle one was being told as 200.
 *
 * Every test here asserts on the STATUS CODE, because the markup is identical
 * either way: that is precisely why this shipped and survived. A test that
 * rendered the page and checked for a poem would pass against the bug.
 */
const makeRes = () => ({ statusCode: 200, setHeader: jest.fn() })

const ctx = (res: ReturnType<typeof makeRes>, params: Record<string, string> = {}) => ({
    req: { cookies: {}, headers: { host: 'poemunity.com' } },
    res,
    query: {},
    params
}) as unknown as GetServerSidePropsContext

beforeEach(() => {
    jest.clearAllMocks()
    mockFetch.mockResolvedValue(null)
})

describe.each([
    // status 0 is a request that never completed at all — DNS, timeout,
    // connection refused. It is the most common shape of "backend is down" and
    // the easiest one to forget, because it is not an HTTP status.
    ['a dropped connection', 0],
    ['a 500', 500],
    ['a 502 from the platform', 502],
    ['a 503', 503],
    ['a 504 gateway timeout', 504]
])('%s', (_label, status) => {
    test('the poem page answers 503, not 200', async () => {
        mockResult.mockResolvedValue({ data: null, status })
        const res = makeRes()

        await poemProps(ctx(res, { poemId: 'christmas-trees-robert-frost' }))

        expect(res.statusCode).toBe(503)
        expect(res.setHeader).toHaveBeenCalledWith('Retry-After', '120')
    })

    test('the author page answers 503', async () => {
        mockResult.mockResolvedValue({ data: null, status })
        const res = makeRes()

        await authorProps(ctx(res, { slug: 'ada-brine' }))

        expect(res.statusCode).toBe(503)
    })

    test('the genre page answers 503', async () => {
        mockResult.mockResolvedValue({ data: null, status })
        const res = makeRes()

        await genreProps(ctx(res, { genre: 'love' }))

        expect(res.statusCode).toBe(503)
    })

    test('the homepage answers 503', async () => {
        mockResult.mockResolvedValue({ data: null, status })
        const res = makeRes()

        await indexProps(ctx(res))

        expect(res.statusCode).toBe(503)
    })
})

describe('what must NOT become a 503', () => {
    test('a 404 is still notFound — an outage and a missing poem are different answers', async () => {
        mockResult.mockResolvedValue({ data: null, status: 404 })
        const res = makeRes()

        const result = await poemProps(ctx(res, { poemId: 'no-such-poem' }))

        expect(result).toEqual({ notFound: true })
        expect(res.statusCode).toBe(200)
    })

    test('a poem that loads normally is a plain 200', async () => {
        mockResult.mockResolvedValue({
            data: { id: 'p1', slug: 'aubade', title: 'Aubade', poem: 'verse', author: 'Ada' },
            status: 200
        })
        const res = makeRes()

        await poemProps(ctx(res, { poemId: 'aubade' }))

        expect(res.statusCode).toBe(200)
        expect(res.setHeader).not.toHaveBeenCalledWith('Retry-After', expect.anything())
    })

    test('an EMPTY genre still renders 200 — nothing is wrong with it', async () => {
        // The distractor: "no poems came back" and "the backend is down" produce
        // the same empty page, and only the second is a failure. A fix keyed on
        // the DATA rather than the status would 503 every empty category.
        mockResult.mockResolvedValue({
            data: { poems: [], page: 1, hasMore: false, total: 0 },
            status: 200
        })
        const res = makeRes()

        await genreProps(ctx(res, { genre: 'wedding' }))

        expect(res.statusCode).toBe(200)
    })
})

describe('an outage must not 404 anything', () => {
    test('a paginated URL is 503, not the past-the-end 404', async () => {
        // `?page=2` with no poems normally means past the end, which is a real
        // 404. During an outage every page looks past-the-end — and 404ing the
        // whole paginated URL space is an invitation to deindex it.
        mockResult.mockResolvedValue({ data: null, status: 0 })
        const res = makeRes()

        const result = await indexProps({
            req: { cookies: {}, headers: { host: 'poemunity.com' } },
            res,
            query: { page: '2' },
            params: {}
        } as unknown as GetServerSidePropsContext)

        expect(res.statusCode).toBe(503)
        expect(result).not.toEqual({ notFound: true })
    })

    test('an unknown genre slug is 503, not a 404 the probe could not justify', async () => {
        mockResult.mockResolvedValue({ data: null, status: 500 })
        const res = makeRes()

        const result = await genreProps(ctx(res, { genre: 'some-legacy-genre' }))

        expect(res.statusCode).toBe(503)
        expect(result).not.toEqual({ notFound: true })
    })
})
