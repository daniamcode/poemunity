import { getTopAuthorsAction, getAuthorsByLetterAction } from './authorsActions'
import * as commonActions from './commonActions'
import { authorsUpserted } from '../reducers/authorEntitiesReducers'

// authorsActions imports the axios instance and store singleton at module load;
// stub both so importing the module under test has no side effects.
jest.mock('axios', () => ({ __esModule: true, default: { create: () => ({}) } }))
jest.mock('../store/index')

// Run the action, capture the wrapped success callback handed to getAction,
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

const authorsPayload = [
    { id: 'a1', name: 'Jane Doe', slug: 'jane-doe', picture: 'jane.jpg', count: 4 },
    { id: 'a2', name: 'John Roe', slug: 'john-roe', count: 2 }
]

describe('author fetches seed the authorEntities store', () => {
    test('getTopAuthorsAction upserts one entity per author (id-keyed, list fields dropped)', () => {
        const dispatch = seedFrom(getTopAuthorsAction({ params: { limit: 10 } }), authorsPayload)

        expect(dispatch).toHaveBeenCalledWith(
            authorsUpserted([
                { id: 'a1', name: 'Jane Doe', picture: 'jane.jpg', slug: 'jane-doe', type: undefined },
                { id: 'a2', name: 'John Roe', picture: undefined, slug: 'john-roe', type: undefined }
            ])
        )
    })

    test('getAuthorsByLetterAction also seeds the entities', () => {
        const dispatch = seedFrom(getAuthorsByLetterAction({ letter: 'j' }), authorsPayload)

        expect(dispatch).toHaveBeenCalledWith(
            authorsUpserted([
                { id: 'a1', name: 'Jane Doe', picture: 'jane.jpg', slug: 'jane-doe', type: undefined },
                { id: 'a2', name: 'John Roe', picture: undefined, slug: 'john-roe', type: undefined }
            ])
        )
    })

    test('authors without an id are skipped, and an empty list dispatches nothing', () => {
        const dispatch = seedFrom(getTopAuthorsAction(), [])
        const seeded = dispatch.mock.calls.some((c: any[]) => c[0]?.type === authorsUpserted([]).type)
        expect(seeded).toBe(false)
    })

    test("the caller's own success callback still runs after seeding", () => {
        const userSuccess = jest.fn()
        const dispatch = jest.fn()
        const spy = jest.spyOn(commonActions, 'getAction').mockImplementation(() => undefined as any)

        getTopAuthorsAction({ callbacks: { success: userSuccess } })(dispatch)
        const wrapped = spy.mock.calls[0][0].callbacks!
        wrapped.success!(authorsPayload)

        expect(userSuccess).toHaveBeenCalledWith(authorsPayload)
        spy.mockRestore()
    })
})
