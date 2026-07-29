import { renderHook, waitFor } from '@testing-library/react'
import { useNextPoem, poemHref } from './useNextPoem'
import API from '../../../redux/actions/axiosInstance'
import { Poem } from '../../../typescript/interfaces'

jest.mock('../../../redux/actions/axiosInstance')

const mockedAPI = API as jest.MockedFunction<typeof API>

const poem = (over: Partial<Poem> & { id: string }): Poem => ({
    author: 'John Doe',
    date: '2024-01-15T10:30:00.000Z',
    genre: 'love',
    likes: [],
    picture: '',
    poem: 'content',
    title: `Title ${over.id}`,
    userId: 'user-456',
    ...over
})

function mockGet(impl: jest.Mock) {
    mockedAPI.mockReturnValue({ get: impl } as never)
    return impl
}

describe('useNextPoem', () => {
    beforeEach(() => jest.clearAllMocks())

    describe('poemHref', () => {
        test('prefers the slug, falling back to the id', () => {
            expect(poemHref(poem({ id: 'p1', slug: 'a-slug' }))).toBe('/detail/a-slug')
            expect(poemHref(poem({ id: 'p1' }))).toBe('/detail/p1')
        })
    })

    describe('with a server answer from getServerSideProps', () => {
        test('uses it and makes no request', () => {
            const get = mockGet(jest.fn())

            const { result } = renderHook(() =>
                useNextPoem('poem-1', { poem: poem({ id: 'poem-2', title: 'Ode', author: 'Jane Roe' }) })
            )

            expect(result.current).toEqual({ href: '/detail/poem-2', title: 'Ode', author: 'Jane Roe' })
            expect(get).not.toHaveBeenCalled()
        })

        test('a null poem means the collection holds nothing else — no target, no request', () => {
            const get = mockGet(jest.fn())

            const { result } = renderHook(() => useNextPoem('poem-1', { poem: null }))

            expect(result.current).toBeNull()
            expect(get).not.toHaveBeenCalled()
        })
    })

    describe('without a server answer', () => {
        test('fetches the walk itself', async () => {
            const get = mockGet(jest.fn().mockResolvedValue({
                data: { poem: poem({ id: 'poem-9', title: 'Fetched', author: 'Marta Ruiz' }) }
            }))

            const { result } = renderHook(() => useNextPoem('poem-1', null))

            await waitFor(() => expect(result.current).not.toBeNull())
            expect(result.current).toEqual({ href: '/detail/poem-9', title: 'Fetched', author: 'Marta Ruiz' })
            expect(get).toHaveBeenCalledWith('/api/v1/poem/poem-1/next', expect.anything())
        })

        // No dimension, no browsing context, nothing derived from the caches: the
        // request carries the poem id and nothing else.
        test('sends no query parameters — the rule is server-owned', async () => {
            const get = mockGet(jest.fn().mockResolvedValue({ data: { poem: null } }))

            renderHook(() => useNextPoem('poem-1', null))

            await waitFor(() => expect(get).toHaveBeenCalled())
            expect(get.mock.calls[0][1]).not.toHaveProperty('params')
        })

        test('a failed walk renders nothing rather than breaking the page', async () => {
            const get = mockGet(jest.fn().mockRejectedValue(new Error('boom')))

            const { result } = renderHook(() => useNextPoem('poem-1', null))

            await waitFor(() => expect(get).toHaveBeenCalled())
            expect(result.current).toBeNull()
        })

        test('aborts in flight on unmount, so a late answer cannot set state', async () => {
            const get = mockGet(jest.fn(() => new Promise(() => undefined)))

            const { unmount } = renderHook(() => useNextPoem('poem-1', null))
            await waitFor(() => expect(get).toHaveBeenCalled())

            const { signal } = get.mock.calls[0][1]
            expect(signal.aborted).toBe(false)
            unmount()
            expect(signal.aborted).toBe(true)
        })

        test('does not fire without a poem id', () => {
            const get = mockGet(jest.fn())

            renderHook(() => useNextPoem('', null))

            expect(get).not.toHaveBeenCalled()
        })
    })
})
