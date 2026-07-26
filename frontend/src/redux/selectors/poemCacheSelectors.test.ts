import {
    selectPoemsListPoems,
    selectMyFavouritePoemsPoems,
    selectAuthorPoemsPoems
} from './poemCacheSelectors'
import { Poem } from '../../typescript/interfaces'

const p1 = { id: 'p1', title: 'One', likes: ['u1'], userId: 'a1' } as unknown as Poem
const p2 = { id: 'p2', title: 'Two', likes: [], userId: 'a2' } as unknown as Poem

// Build a RootState-ish object with the poemEntities store and id-backed caches.
function stateWith(entities: Record<string, Poem>, caches: Record<string, any>) {
    return {
        poemEntities: { ids: Object.keys(entities), entities },
        ...caches
    } as any
}

describe('poem cache selectors — resolve id-arrays through poemEntities', () => {
    test('maps a cache id-array back to full Poem[] in order', () => {
        const state = stateWith(
            { p1, p2 },
            { poemsListQuery: { item: ['p2', 'p1'] } }
        )
        expect(selectPoemsListPoems(state)).toEqual([p2, p1])
    })

    test('a like on the ONE entity is visible in every view that references it', () => {
        const liked = { ...p1, likes: ['u1', 'u2'] }
        const state = stateWith(
            { p1: liked, p2 },
            {
                poemsListQuery: { item: ['p1', 'p2'] },
                authorPoemsQuery: { item: ['p1'] }
            }
        )
        // Same updated entity surfaces everywhere — no per-cache patching.
        expect(selectPoemsListPoems(state)[0].likes).toEqual(['u1', 'u2'])
        expect(selectAuthorPoemsPoems(state)[0].likes).toEqual(['u1', 'u2'])
    })

    test('a removed entity disappears from a cache even if a stale id lingers', () => {
        const state = stateWith(
            { p2 }, // p1 removed from entities
            { poemsListQuery: { item: ['p1', 'p2'] } }
        )
        expect(selectPoemsListPoems(state)).toEqual([p2])
    })

    test('returns [] for an empty / unfetched cache', () => {
        const state = stateWith({ p1 }, { myFavouritePoemsQuery: { item: undefined } })
        expect(selectMyFavouritePoemsPoems(state)).toEqual([])
    })

    test('tolerates a cache that still holds full Poem objects (SSR/first paint)', () => {
        const state = stateWith({}, { poemsListQuery: { item: [p1, p2] } })
        expect(selectPoemsListPoems(state)).toEqual([p1, p2])
    })
})
