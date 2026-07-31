import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { AuthorEntity } from '../reducers/authorEntitiesReducers'

// The two follow caches store author IDS. These selectors resolve them through
// the normalized authorEntities store, which is why a rename, an avatar change
// or a follow/unfollow performed anywhere else in the app is reflected in the
// tabs without either list refetching.
//
// An id with no entity is dropped rather than rendered as a blank row — the
// same rule the poem cache selectors use, and it is also how an author removed
// from the store disappears from both tabs at once.

const EMPTY_ENTITIES: Record<string, AuthorEntity> = {}
const EMPTY_LIST: AuthorEntity[] = []

function selectAuthorEntities(state: RootState): Record<string, AuthorEntity> {
    return (state.authorEntities?.entities as Record<string, AuthorEntity>) ?? EMPTY_ENTITIES
}

function resolve(ids: string[] | undefined, entities: Record<string, AuthorEntity>): AuthorEntity[] {
    if (!Array.isArray(ids) || ids.length === 0) {
        return EMPTY_LIST
    }
    return ids
        .map(id => entities[id])
        .filter((author): author is AuthorEntity => Boolean(author))
}

export const selectFollowers = createSelector(
    [(state: RootState) => state.followersQuery?.item as string[] | undefined, selectAuthorEntities],
    resolve
)

export const selectFollowing = createSelector(
    [(state: RootState) => state.followingQuery?.item as string[] | undefined, selectAuthorEntities],
    resolve
)
