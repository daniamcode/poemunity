import {
    authorEntitiesReducer,
    authorUpserted,
    authorsUpserted,
    authorUpdated,
    selectAuthorEntityById,
    selectAllAuthorEntities,
    AuthorEntity
} from './authorEntitiesReducers'

const initial = authorEntitiesReducer(undefined, { type: '@@INIT' })

const jane: AuthorEntity = { id: 'user-1', name: 'Jane Doe', picture: 'jane.jpg', slug: 'jane-doe', type: 'user' }
const john: AuthorEntity = { id: 'user-2', name: 'John Roe', picture: 'john.jpg', slug: 'john-roe', type: 'user' }

describe('authorEntities reducer', () => {
    test('starts empty', () => {
        expect(initial).toEqual({ ids: [], entities: {} })
    })

    test('authorUpserted adds a single author', () => {
        const state = authorEntitiesReducer(initial, authorUpserted(jane))
        expect(state.ids).toEqual(['user-1'])
        expect(state.entities['user-1']).toEqual(jane)
    })

    test('authorsUpserted adds many authors', () => {
        const state = authorEntitiesReducer(initial, authorsUpserted([jane, john]))
        expect(state.ids).toEqual(['user-1', 'user-2'])
        expect(state.entities['user-2']).toEqual(john)
    })

    test('upsert overwrites an existing author (no duplicate id)', () => {
        const seeded = authorEntitiesReducer(initial, authorUpserted(jane))
        const renamed = authorEntitiesReducer(seeded, authorUpserted({ ...jane, name: 'Jane Smith' }))
        expect(renamed.ids).toEqual(['user-1'])
        expect(renamed.entities['user-1']?.name).toBe('Jane Smith')
    })

    test('authorUpdated merges partial changes (drift fix: name + picture propagate)', () => {
        const seeded = authorEntitiesReducer(initial, authorUpserted(jane))
        const state = authorEntitiesReducer(
            seeded,
            authorUpdated({ id: 'user-1', changes: { name: 'Jane New', picture: 'new.jpg' } })
        )
        expect(state.entities['user-1']).toEqual({ ...jane, name: 'Jane New', picture: 'new.jpg' })
    })

    test('authorUpdated for an unknown id is a no-op', () => {
        const seeded = authorEntitiesReducer(initial, authorUpserted(jane))
        const state = authorEntitiesReducer(seeded, authorUpdated({ id: 'nope', changes: { name: 'X' } }))
        expect(state).toEqual(seeded)
    })
})

describe('authorEntities selectors', () => {
    const seeded = authorEntitiesReducer(initial, authorsUpserted([jane, john]))
    const rootState = { authorEntities: seeded } as any

    test('selectAuthorEntityById returns the entity', () => {
        expect(selectAuthorEntityById(rootState, 'user-2')).toEqual(john)
    })

    test('selectAuthorEntityById returns undefined for a missing id', () => {
        expect(selectAuthorEntityById(rootState, 'ghost')).toBeUndefined()
    })

    test('selectAllAuthorEntities returns every author', () => {
        expect(selectAllAuthorEntities(rootState)).toEqual([jane, john])
    })
})
