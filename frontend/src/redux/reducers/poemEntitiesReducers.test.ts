import {
    poemEntitiesReducer,
    poemUpserted,
    poemsUpserted,
    poemUpdated,
    poemRemoved,
    selectPoemEntityById,
    selectAllPoemEntities
} from './poemEntitiesReducers'
import { Poem } from '../../typescript/interfaces'

const initial = poemEntitiesReducer(undefined, { type: '@@INIT' })

const poemA = {
    id: 'p1',
    author: 'Jane Doe',
    date: '2024-01-01',
    genre: 'love',
    likes: ['u1'],
    picture: 'jane.jpg',
    poem: 'body A',
    title: 'Title A',
    userId: 'author-1'
} as Poem

const poemB = {
    id: 'p2',
    author: 'John Roe',
    date: '2024-01-02',
    genre: 'nature',
    likes: [],
    picture: 'john.jpg',
    poem: 'body B',
    title: 'Title B',
    userId: 'author-2'
} as Poem

describe('poemEntities reducer', () => {
    test('starts empty', () => {
        expect(initial).toEqual({ ids: [], entities: {} })
    })

    test('poemUpserted adds a single poem', () => {
        const state = poemEntitiesReducer(initial, poemUpserted(poemA))
        expect(state.ids).toEqual(['p1'])
        expect(state.entities['p1']).toEqual(poemA)
    })

    test('poemsUpserted adds many poems', () => {
        const state = poemEntitiesReducer(initial, poemsUpserted([poemA, poemB]))
        expect(state.ids).toEqual(['p1', 'p2'])
        expect(state.entities['p2']).toEqual(poemB)
    })

    test('upsert overwrites an existing poem (no duplicate id)', () => {
        const seeded = poemEntitiesReducer(initial, poemUpserted(poemA))
        const replaced = poemEntitiesReducer(seeded, poemUpserted({ ...poemA, title: 'Renamed' }))
        expect(replaced.ids).toEqual(['p1'])
        expect(replaced.entities['p1']?.title).toBe('Renamed')
    })

    test('poemUpdated merges partial changes (like toggle propagates from one place)', () => {
        const seeded = poemEntitiesReducer(initial, poemUpserted(poemA))
        const state = poemEntitiesReducer(seeded, poemUpdated({ id: 'p1', changes: { likes: ['u1', 'u2'] } }))
        expect(state.entities['p1']).toEqual({ ...poemA, likes: ['u1', 'u2'] })
    })

    test('poemUpdated for an unknown id is a no-op', () => {
        const seeded = poemEntitiesReducer(initial, poemUpserted(poemA))
        const state = poemEntitiesReducer(seeded, poemUpdated({ id: 'nope', changes: { title: 'X' } }))
        expect(state).toEqual(seeded)
    })

    test('poemRemoved deletes the poem (single source of truth for delete)', () => {
        const seeded = poemEntitiesReducer(initial, poemsUpserted([poemA, poemB]))
        const state = poemEntitiesReducer(seeded, poemRemoved('p1'))
        expect(state.ids).toEqual(['p2'])
        expect(state.entities['p1']).toBeUndefined()
    })
})

describe('poemEntities selectors', () => {
    const seeded = poemEntitiesReducer(initial, poemsUpserted([poemA, poemB]))
    const rootState = { poemEntities: seeded } as any

    test('selectPoemEntityById returns the entity', () => {
        expect(selectPoemEntityById(rootState, 'p2')).toEqual(poemB)
    })

    test('selectPoemEntityById returns undefined for a missing id', () => {
        expect(selectPoemEntityById(rootState, 'ghost')).toBeUndefined()
    })

    test('selectAllPoemEntities returns every poem', () => {
        expect(selectAllPoemEntities(rootState)).toEqual([poemA, poemB])
    })
})
