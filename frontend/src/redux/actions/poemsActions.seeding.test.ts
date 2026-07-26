import { getPoemsListAction } from './poemsActions'
import * as commonActions from './commonActions'
import { authorsUpserted } from '../reducers/authorEntitiesReducers'
import { poemsUpserted } from '../reducers/poemEntitiesReducers'
import { poemsListQuery } from '../reducers/poemsReducers'
import { Poem } from '../../typescript/interfaces'

// poemsActions imports the axios instance and the store singleton at module load;
// stub both so importing the module under test has no side effects.
jest.mock('axios', () => ({ __esModule: true, default: { create: () => ({}) } }))
jest.mock('../store/index')

const poemA = {
    id: 'p1',
    userId: 'author-1',
    author: 'Jane Doe',
    picture: 'jane.jpg',
    authorSlug: 'jane-doe',
    authorType: 'user'
} as unknown as Poem

const poemB = {
    id: 'p2',
    userId: 'author-2',
    author: 'John Roe',
    picture: 'john.jpg',
    authorSlug: 'john-roe',
    authorType: 'famous'
} as unknown as Poem

// Run the action, capture the (wrapped) success callback handed to getAction,
// invoke it with a fetch payload, and return what got dispatched.
function seedFrom(action: (dispatch: any) => void, payload: unknown) {
    const dispatch = jest.fn()
    const spy = jest.spyOn(commonActions, 'getAction').mockImplementation(() => undefined as any)

    action(dispatch)

    const wrapped = spy.mock.calls[0][0].callbacks!
    wrapped.success!(payload)

    spy.mockRestore()
    return dispatch
}

describe('poem fetches seed the authorEntities store', () => {
    test('paginated payload ({ poems }) upserts one author per poem', () => {
        const dispatch = seedFrom(getPoemsListAction({ params: {}, options: { fetch: true } }), {
            poems: [poemA, poemB],
            page: 1
        })

        expect(dispatch).toHaveBeenCalledWith(
            authorsUpserted([
                { id: 'author-1', name: 'Jane Doe', picture: 'jane.jpg', slug: 'jane-doe', type: 'user' },
                { id: 'author-2', name: 'John Roe', picture: 'john.jpg', slug: 'john-roe', type: 'famous' }
            ])
        )
    })

    test('plain array payload (Poem[]) also seeds authors', () => {
        const dispatch = seedFrom(getPoemsListAction({ params: {}, options: { fetch: true } }), [poemA])

        expect(dispatch).toHaveBeenCalledWith(
            authorsUpserted([{ id: 'author-1', name: 'Jane Doe', picture: 'jane.jpg', slug: 'jane-doe', type: 'user' }])
        )
    })

    test('empty / missing poems does not dispatch a seed', () => {
        const dispatchEmpty = seedFrom(getPoemsListAction({ params: {}, options: { fetch: true } }), [])
        const seededEmpty = dispatchEmpty.mock.calls.some(
            (c: any[]) => c[0]?.type === authorsUpserted([]).type
        )
        expect(seededEmpty).toBe(false)

        const dispatchNull = seedFrom(getPoemsListAction({ params: {}, options: { fetch: true } }), null)
        const seededNull = dispatchNull.mock.calls.some(
            (c: any[]) => c[0]?.type === authorsUpserted([]).type
        )
        expect(seededNull).toBe(false)
    })

    test('paginated payload upserts the full poems into poemEntities', () => {
        const dispatch = seedFrom(getPoemsListAction({ params: {}, options: { fetch: true } }), {
            poems: [poemA, poemB],
            page: 1
        })

        expect(dispatch).toHaveBeenCalledWith(poemsUpserted([poemA, poemB]))
    })

    test('plain array payload also upserts the full poems into poemEntities', () => {
        const dispatch = seedFrom(getPoemsListAction({ params: {}, options: { fetch: true } }), [poemA])

        expect(dispatch).toHaveBeenCalledWith(poemsUpserted([poemA]))
    })

    test('the fulfilled cache reducer stores only ids (not full poems)', () => {
        const state = poemsListQuery(undefined, {
            type: 'poems-list_fulfilled',
            payload: { poems: [poemA, poemB], page: 1, hasMore: false, total: 2, totalPages: 1 }
        })
        // Single source of truth: the cache holds ids; full poems live in poemEntities.
        expect(state.item).toEqual(['p1', 'p2'])
    })

    test('the caller\'s own success callback still runs after seeding', () => {
        const dispatch = jest.fn()
        const userSuccess = jest.fn()
        const spy = jest.spyOn(commonActions, 'getAction').mockImplementation(() => undefined as any)

        getPoemsListAction({ params: {}, options: { fetch: true }, callbacks: { success: userSuccess } })(dispatch)
        const wrapped = spy.mock.calls[0][0].callbacks!
        wrapped.success!([poemA])

        expect(userSuccess).toHaveBeenCalledWith([poemA])
        spy.mockRestore()
    })
})
