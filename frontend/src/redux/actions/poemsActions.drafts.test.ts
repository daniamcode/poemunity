import axios from 'axios'
import { getMyDraftsAction, insertPoemIntoCaches, movePoemBetweenDraftAndPublished } from './poemsActions'
import { getTypes } from './commonActions'
import { ACTIONS } from '../reducers/poemsReducers'
import { AppDispatch } from '../store'
import store from '../store/index'
import { makePoem } from '../../test-utils/fixtures'

jest.mock('axios', () => {
    const mockGetFn = jest.fn()
    const mockAxiosInstance = { get: mockGetFn, post: jest.fn(), put: jest.fn(), delete: jest.fn(), patch: jest.fn() }
    return {
        __esModule: true,
        default: {
            create: jest.fn(() => mockAxiosInstance),
            isCancel: jest.fn(() => false),
            __mockGet: mockGetFn
        }
    }
})
jest.mock('../store/index')

const mockGet = (axios as any).__mockGet

// Collect the id-array each cache was left holding, keyed by its action type.
function idsByCache(dispatch: jest.Mock): Record<string, string[]> {
    const result: Record<string, string[]> = {}
    dispatch.mock.calls.forEach(([action]) => {
        if (action && typeof action.type === 'string' && action.payload?.poems) {
            result[action.type] = action.payload.poems
        }
    })
    return result
}

const fulfilled = (actionType: string) => getTypes(actionType).fulfilledAction

describe('getMyDraftsAction', () => {
    let dispatch: AppDispatch

    beforeEach(() => {
        dispatch = jest.fn() as unknown as AppDispatch
        jest.clearAllMocks()
        mockGet.mockResolvedValue({ data: { poems: [], total: 0, page: 1, hasMore: false, totalPages: 0 } })
    })

    // The server scopes drafts by the SESSION. Sending a userId would suggest
    // the client picks whose drafts to read, which is exactly the shape of the
    // bug this feature must not have.
    test('asks for status=draft and never names an author', async () => {
        await getMyDraftsAction({ params: { page: 1, limit: 10 } })(dispatch)

        const [, config] = mockGet.mock.calls[0]
        expect(config.params).toMatchObject({ status: 'draft', page: 1, limit: 10 })
        expect(config.params.userId).toBeUndefined()
        expect(config.params.likedBy).toBeUndefined()
    })
})

describe('insertPoemIntoCaches — a new draft is private', () => {
    let dispatch: jest.Mock

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
        ;(store.getState as jest.Mock).mockReturnValue({
            poemsListQuery: { item: ['old-1'], page: 1, hasMore: false, total: 1, totalPages: 1 },
            myPoemsQuery: { item: ['old-1'], page: 1, hasMore: false, total: 1, totalPages: 1 },
            myDraftsQuery: { item: [], page: 1, hasMore: false, total: 0, totalPages: 0 }
        })
    })

    test('a created draft joins the drafts list and NO public list', () => {
        // makePoem keeps id and slug deliberately different — the caches are
        // addressed by id, the URLs by slug.
        const draft = makePoem({ id: 'draft-id-1', slug: 'a-draft-slug', status: 'draft' })

        insertPoemIntoCaches({ response: draft })(dispatch as unknown as AppDispatch)

        const caches = idsByCache(dispatch)
        expect(caches[fulfilled(ACTIONS.MY_DRAFTS)]).toEqual(['draft-id-1'])
        expect(caches[fulfilled(ACTIONS.POEMS_LIST)]).toBeUndefined()
        expect(caches[fulfilled(ACTIONS.MY_POEMS)]).toBeUndefined()
    })

    test('a created published poem joins the public lists and NOT drafts', () => {
        const poem = makePoem({ id: 'published-id-1', slug: 'a-published-slug', status: 'published' })

        insertPoemIntoCaches({ response: poem })(dispatch as unknown as AppDispatch)

        const caches = idsByCache(dispatch)
        expect(caches[fulfilled(ACTIONS.POEMS_LIST)]).toEqual(['published-id-1', 'old-1'])
        expect(caches[fulfilled(ACTIONS.MY_POEMS)]).toEqual(['published-id-1', 'old-1'])
        expect(caches[fulfilled(ACTIONS.MY_DRAFTS)]).toBeUndefined()
    })
})

describe('movePoemBetweenDraftAndPublished', () => {
    let dispatch: jest.Mock

    // Distractors in both directions: the poem starts present in the lists it
    // must LEAVE and absent from the ones it must JOIN, and every list holds a
    // second id that must survive untouched.
    const stateWithDraft = {
        poemsListQuery: { item: ['other-1'], page: 1, hasMore: false, total: 1, totalPages: 1 },
        myPoemsQuery: { item: ['other-1'], page: 1, hasMore: false, total: 1, totalPages: 1 },
        authorPoemsQuery: { item: ['other-1'], page: 1, hasMore: false, total: 1, totalPages: 1 },
        myFavouritePoemsQuery: { item: ['other-1'], page: 1, hasMore: false, total: 1, totalPages: 1 },
        myDraftsQuery: { item: ['moving-id', 'other-2'], page: 1, hasMore: false, total: 2, totalPages: 1 }
    }

    const stateWithPublished = {
        poemsListQuery: { item: ['moving-id', 'other-1'], page: 1, hasMore: false, total: 2, totalPages: 1 },
        myPoemsQuery: { item: ['moving-id', 'other-1'], page: 1, hasMore: false, total: 2, totalPages: 1 },
        authorPoemsQuery: { item: ['moving-id', 'other-1'], page: 1, hasMore: false, total: 2, totalPages: 1 },
        myFavouritePoemsQuery: { item: ['moving-id', 'other-1'], page: 1, hasMore: false, total: 2, totalPages: 1 },
        myDraftsQuery: { item: ['other-2'], page: 1, hasMore: false, total: 1, totalPages: 1 }
    }

    beforeEach(() => {
        dispatch = jest.fn()
        jest.clearAllMocks()
    })

    test('publishing moves the id out of drafts and into the public lists', () => {
        ;(store.getState as jest.Mock).mockReturnValue(stateWithDraft)

        movePoemBetweenDraftAndPublished({ poemId: 'moving-id', status: 'published' })(
            dispatch as unknown as AppDispatch
        )

        const caches = idsByCache(dispatch)
        expect(caches[fulfilled(ACTIONS.MY_DRAFTS)]).toEqual(['other-2'])
        expect(caches[fulfilled(ACTIONS.POEMS_LIST)]).toEqual(['moving-id', 'other-1'])
        expect(caches[fulfilled(ACTIONS.MY_POEMS)]).toEqual(['moving-id', 'other-1'])
        expect(caches[fulfilled(ACTIONS.AUTHOR_POEMS)]).toEqual(['moving-id', 'other-1'])
    })

    test('withdrawing removes the id from every public list, including favourites', () => {
        ;(store.getState as jest.Mock).mockReturnValue(stateWithPublished)

        movePoemBetweenDraftAndPublished({ poemId: 'moving-id', status: 'draft' })(
            dispatch as unknown as AppDispatch
        )

        const caches = idsByCache(dispatch)
        expect(caches[fulfilled(ACTIONS.POEMS_LIST)]).toEqual(['other-1'])
        expect(caches[fulfilled(ACTIONS.MY_POEMS)]).toEqual(['other-1'])
        expect(caches[fulfilled(ACTIONS.AUTHOR_POEMS)]).toEqual(['other-1'])
        // A withdrawn poem is unreadable, so it cannot stay in a favourites list.
        expect(caches[fulfilled(ACTIONS.MY_FAVOURITE_POEMS)]).toEqual(['other-1'])
        expect(caches[fulfilled(ACTIONS.MY_DRAFTS)]).toEqual(['moving-id', 'other-2'])
    })

    test('totals move with the membership', () => {
        ;(store.getState as jest.Mock).mockReturnValue(stateWithDraft)

        movePoemBetweenDraftAndPublished({ poemId: 'moving-id', status: 'published' })(
            dispatch as unknown as AppDispatch
        )

        const totals: Record<string, number> = {}
        dispatch.mock.calls.forEach(([action]) => {
            if (action?.payload?.poems) totals[action.type] = action.payload.total
        })
        expect(totals[fulfilled(ACTIONS.MY_DRAFTS)]).toBe(1)
        expect(totals[fulfilled(ACTIONS.POEMS_LIST)]).toBe(2)
    })
})
