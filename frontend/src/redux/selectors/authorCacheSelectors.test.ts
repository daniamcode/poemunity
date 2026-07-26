import { selectTopAuthors, selectAuthorsByLetter } from './authorCacheSelectors'
import type { RootState } from '../store'

// Build a minimal RootState slice for the selectors under test.
function makeState(listKey: 'topAuthorsQuery' | 'authorsByLetterQuery', list: any, entities: any): RootState {
    return {
        [listKey]: { item: list, isFetching: false, isError: false },
        authorEntities: {
            ids: Object.keys(entities),
            entities
        }
    } as unknown as RootState
}

describe('author cache selectors resolve through authorEntities', () => {
    const cachedAuthor = { id: 'a1', name: 'Old Name', slug: 'old-name', count: 7, picture: 'old.jpg' }

    test('entity name/picture/slug win over the cached copy (rename propagates)', () => {
        const state = makeState('topAuthorsQuery', [cachedAuthor], {
            a1: { id: 'a1', name: 'New Name', slug: 'new-name', picture: 'new.jpg' }
        })

        const [resolved] = selectTopAuthors(state)

        expect(resolved.name).toBe('New Name')
        expect(resolved.slug).toBe('new-name')
        expect(resolved.picture).toBe('new.jpg')
        // List-specific data is preserved from the cache, not the entity.
        expect(resolved.count).toBe(7)
    })

    test('falls back to the cached author when no entity exists', () => {
        const state = makeState('topAuthorsQuery', [cachedAuthor], {})

        const [resolved] = selectTopAuthors(state)

        expect(resolved.name).toBe('Old Name')
        expect(resolved.picture).toBe('old.jpg')
    })

    test('keeps cached fields the entity does not carry', () => {
        // Entity has a name but no picture/slug — cache should fill those in.
        const state = makeState('topAuthorsQuery', [cachedAuthor], {
            a1: { id: 'a1', name: 'Renamed' }
        })

        const [resolved] = selectTopAuthors(state)

        expect(resolved.name).toBe('Renamed')
        expect(resolved.slug).toBe('old-name')
        expect(resolved.picture).toBe('old.jpg')
    })

    test('selectAuthorsByLetter resolves the by-letter cache the same way', () => {
        const state = makeState('authorsByLetterQuery', [cachedAuthor], {
            a1: { id: 'a1', name: 'Letter Name', slug: 'letter-name' }
        })

        const [resolved] = selectAuthorsByLetter(state)

        expect(resolved.name).toBe('Letter Name')
        expect(resolved.count).toBe(7)
    })

    test('returns an empty array when the cache is not populated', () => {
        const state = makeState('topAuthorsQuery', undefined, {})

        expect(selectTopAuthors(state)).toEqual([])
    })
})
