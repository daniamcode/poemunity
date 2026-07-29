import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { useNextPoem } from './useNextPoem'
import { rootReducer } from '../../../redux/reducers/rootReducer'
import { poemsUpserted } from '../../../redux/reducers/poemEntitiesReducers'
import { listContextSet } from '../../../redux/reducers/listContextReducers'
import { getTypes } from '../../../redux/actions/commonActions'
import { ACTIONS } from '../../../redux/reducers/poemsReducers'
import { getPoemsListAction } from '../../../redux/actions/poemsActions'
import API from '../../../redux/actions/axiosInstance'
import { Poem } from '../../../typescript/interfaces'

jest.mock('../../../redux/actions/poemsActions', () => ({
    getPoemsListAction: jest.fn(() => ({ type: 'noop' }))
}))

const mockGet = jest.fn(() => new Promise(() => undefined))
jest.mock('../../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

const mockGetPoemsListAction = getPoemsListAction as jest.Mock
const mockAPI = API as unknown as jest.Mock

const poem = (id: string, over: Partial<Poem> = {}): Poem => ({
    id,
    author: 'John Doe',
    date: '2024-01-15T10:30:00.000Z',
    genre: 'love',
    likes: [],
    picture: '',
    poem: 'content',
    title: `Title ${id}`,
    userId: 'user-1',
    ...over
})

function makeStore() {
    return configureStore({ reducer: rootReducer })
}

function seed(
    store: ReturnType<typeof makeStore>,
    action: string,
    poems: Poem[],
    meta: { hasMore?: boolean, page?: number } = {}
) {
    store.dispatch(poemsUpserted(poems))
    const { fulfilledAction } = getTypes(action)
    const page = meta.page ?? 1
    store.dispatch({
        type: fulfilledAction,
        payload: {
            poems,
            page,
            hasMore: meta.hasMore ?? false,
            total: poems.length,
            totalPages: meta.hasMore ? page + 1 : page
        }
    })
}

function renderNextPoem(store: ReturnType<typeof makeStore>, currentId: string) {
    return renderHook(() => useNextPoem(currentId, null), {
        wrapper: ({ children }: { children: React.ReactNode }) => (
            <Provider store={store}>{children}</Provider>
        )
    })
}

describe('useNextPoem', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockAPI.mockReturnValue({ get: mockGet })
    })

    describe('load more at the tail of the cached list', () => {
        test('fetches the next page with the recorded browsing context when hasMore', () => {
            const store = makeStore()
            // The list records the query that produced its window; the cache
            // itself keeps only ids + page/hasMore.
            store.dispatch(listContextSet({ page: 1, limit: 10, orderBy: 'likes', genre: 'love', q: 'lo' }))
            seed(store, ACTIONS.POEMS_LIST, [poem('a'), poem('tail')], { hasMore: true, page: 2 })

            renderNextPoem(store, 'tail')

            expect(mockGetPoemsListAction).toHaveBeenCalledTimes(1)
            expect(mockGetPoemsListAction).toHaveBeenCalledWith({
                // page advances; every other filter — including the active
                // search — is carried through verbatim.
                params: { page: 3, limit: 10, orderBy: 'likes', genre: 'love', q: 'lo' },
                options: { fetch: true, reset: false }
            })
        })

        test('does not fetch when the list has no more pages', () => {
            const store = makeStore()
            store.dispatch(listContextSet({ page: 1, limit: 10, orderBy: 'likes' }))
            seed(store, ACTIONS.POEMS_LIST, [poem('a'), poem('tail')], { hasMore: false })

            renderNextPoem(store, 'tail')

            expect(mockGetPoemsListAction).not.toHaveBeenCalled()
        })

        test('does not fetch when the poem is mid-list', () => {
            const store = makeStore()
            store.dispatch(listContextSet({ page: 1, limit: 10, orderBy: 'likes' }))
            seed(store, ACTIONS.POEMS_LIST, [poem('a'), poem('mid'), poem('b')], { hasMore: true })

            const { result } = renderNextPoem(store, 'mid')

            expect(mockGetPoemsListAction).not.toHaveBeenCalled()
            expect(result.current?.href).toBe('/detail/b')
        })

        test('does not fetch without a recorded browsing context', () => {
            const store = makeStore()
            seed(store, ACTIONS.POEMS_LIST, [poem('a'), poem('tail')], { hasMore: true })

            renderNextPoem(store, 'tail')

            expect(mockGetPoemsListAction).not.toHaveBeenCalled()
        })
    })

    describe('the author-dimension walk', () => {
        test('asks the server for the author dimension when reading an author page', async () => {
            const store = makeStore()
            seed(store, ACTIONS.AUTHOR_POEMS, [poem('a'), poem('tail')])

            renderNextPoem(store, 'tail')

            await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))
            expect(mockGet).toHaveBeenCalledWith(
                '/api/v1/poem/tail/next',
                expect.objectContaining({ params: { dimension: 'author' } })
            )
        })

        test('adopts the server answer once it lands', async () => {
            const store = makeStore()
            seed(store, ACTIONS.AUTHOR_POEMS, [poem('a'), poem('tail')])
            mockGet.mockReturnValueOnce(
                Promise.resolve({ data: { poem: poem('by-them', { author: 'Marta Ruiz' }), scope: 'same-bucket' } }) as never
            )

            const { result } = renderNextPoem(store, 'tail')

            await waitFor(() => expect(result.current?.href).toBe('/detail/by-them'))
            expect(result.current?.dimension).toBe('author')
            expect(result.current?.scope).toBe('same-bucket')
        })

        test('a failed walk is not an error state — the control simply stays put', async () => {
            const store = makeStore()
            seed(store, ACTIONS.AUTHOR_POEMS, [poem('a'), poem('tail')])
            mockGet.mockReturnValueOnce(Promise.reject(new Error('offline')) as never)

            const { result } = renderNextPoem(store, 'tail')

            await waitFor(() => expect(mockGet).toHaveBeenCalled())
            expect(result.current).toBeNull()
        })

        test('does NOT re-ask the server for the genre dimension — SSR already defaulted to it', () => {
            const store = makeStore()
            store.dispatch(listContextSet({ page: 1, genre: 'love' }))
            seed(store, ACTIONS.POEMS_LIST, [poem('a'), poem('tail')])

            renderNextPoem(store, 'tail')

            expect(mockGet).not.toHaveBeenCalled()
        })
    })
})
