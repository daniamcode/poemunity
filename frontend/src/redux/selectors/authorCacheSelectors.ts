import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { Author } from '../../typescript/interfaces'
import { AuthorEntity } from '../reducers/authorEntitiesReducers'

// The author list caches (topAuthorsQuery, authorsByLetterQuery) hold full Author
// copies straight from /authors. Those copies would drift when an author renames
// or changes their picture — the normalized authorEntities store is the single
// source of truth for name/picture/slug, so we overlay it here. List-specific
// fields (count, and the ordering/membership of the list) stay from the cache.

const EMPTY_ENTITIES: Record<string, AuthorEntity> = {}
const EMPTY_LIST: Author[] = []

function selectAuthorEntities(state: RootState): Record<string, AuthorEntity> {
    return (state.authorEntities?.entities as Record<string, AuthorEntity>) ?? EMPTY_ENTITIES
}

function resolve(list: Author[] | undefined, entities: Record<string, AuthorEntity>): Author[] {
    if (!Array.isArray(list)) {
        return EMPTY_LIST
    }
    return list.map(author => {
        const entity = author.id ? entities[author.id] : undefined
        if (!entity) {
            return author
        }
        // Entity wins for identity fields; fall back to the cached value when the
        // entity does not carry that field (name is always present on an entity).
        return {
            ...author,
            name: entity.name ?? author.name,
            slug: entity.slug ?? author.slug,
            picture: entity.picture ?? author.picture,
            type: entity.type ?? author.type
        }
    })
}

export const selectTopAuthors = createSelector(
    [(state: RootState) => state.topAuthorsQuery?.item as Author[] | undefined, selectAuthorEntities],
    resolve
)

export const selectAuthorsByLetter = createSelector(
    [(state: RootState) => state.authorsByLetterQuery?.item as Author[] | undefined, selectAuthorEntities],
    resolve
)
