import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { Poem } from '../../typescript/interfaces'

// Each list cache stores an array of poem ids (its pagination window / order).
// These selectors resolve that id-array through the normalized poemEntities
// store back into Poem[], so consumers keep receiving Poem[] exactly as before.
//
// The resolver is deliberately dual-mode: an entry may be a poem id (the normal
// case) OR an already-materialized Poem object (SSR first paint, or hand-built
// test state that predates normalization). Missing entities are dropped, which
// is also how a removed poem disappears everywhere the instant poemRemoved runs.

const EMPTY_ENTITIES: Record<string, Poem> = {}

type CacheEntry = string | Poem

function selectPoemEntities(state: RootState): Record<string, Poem> {
    return (state.poemEntities?.entities as Record<string, Poem>) ?? EMPTY_ENTITIES
}

function resolve(item: CacheEntry[] | undefined, entities: Record<string, Poem>): Poem[] {
    if (!Array.isArray(item)) {
        return []
    }
    return item
        .map(entry => (typeof entry === 'string' ? entities[entry] : entry))
        .filter((poem): poem is Poem => Boolean(poem))
}

function makeCachePoemsSelector(selectItem: (state: RootState) => CacheEntry[] | undefined) {
    return createSelector([selectItem, selectPoemEntities], resolve)
}

export const selectPoemsListPoems = makeCachePoemsSelector(
    state => state.poemsListQuery?.item as CacheEntry[] | undefined
)
export const selectMyPoemsPoems = makeCachePoemsSelector(
    state => state.myPoemsQuery?.item as CacheEntry[] | undefined
)
export const selectMyFavouritePoemsPoems = makeCachePoemsSelector(
    state => state.myFavouritePoemsQuery?.item as CacheEntry[] | undefined
)
export const selectAuthorPoemsPoems = makeCachePoemsSelector(
    state => state.authorPoemsQuery?.item as CacheEntry[] | undefined
)
export const selectMyDraftsPoems = makeCachePoemsSelector(
    state => state.myDraftsQuery?.item as CacheEntry[] | undefined
)
