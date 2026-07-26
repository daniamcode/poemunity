import { createEntityAdapter, createSlice, PayloadAction, Update } from '@reduxjs/toolkit'
import type { RootState } from '../store'

// Normalized author record — the single source of truth for an author's
// display fields (name, avatar, slug). Keyed by the author's user id.
// Poems denormalize copies of these fields at fetch time; every view should
// prefer this store so a change in one place updates everywhere.
export interface AuthorEntity {
    id: string
    name: string
    picture?: string
    slug?: string
    type?: 'famous' | 'user' | 'ai'
}

const authorsAdapter = createEntityAdapter<AuthorEntity>()

const authorEntitiesSlice = createSlice({
    name: 'authorEntities',
    initialState: authorsAdapter.getInitialState(),
    reducers: {
        authorUpserted(state, action: PayloadAction<AuthorEntity>) {
            authorsAdapter.upsertOne(state, action.payload)
        },
        authorsUpserted(state, action: PayloadAction<AuthorEntity[]>) {
            authorsAdapter.upsertMany(state, action.payload)
        },
        authorUpdated(state, action: PayloadAction<Update<AuthorEntity>>) {
            authorsAdapter.updateOne(state, action.payload)
        }
    }
})

export const { authorUpserted, authorsUpserted, authorUpdated } = authorEntitiesSlice.actions

const selectors = authorsAdapter.getSelectors((state: RootState) => state.authorEntities)
export const selectAuthorEntityById = selectors.selectById
export const selectAllAuthorEntities = selectors.selectAll

export const authorEntitiesReducer = authorEntitiesSlice.reducer
