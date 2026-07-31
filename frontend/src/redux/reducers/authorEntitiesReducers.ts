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
    /**
     * Follow state, deliberately stored ON the author record rather than in a
     * slice of its own. Whether you follow someone is a fact about that author
     * from this session's point of view, and the moment it lived anywhere else
     * it would need syncing back — which is the denormalized-copy problem the
     * entity store exists to end. Following from the author page and
     * unfollowing from the Following tab both dispatch one `authorUpdated`, and
     * every surface showing that author re-reads it.
     *
     * All three are optional because most authors arrive from a poem fetch,
     * which knows nothing about follows. Only the author-profile fetch and the
     * follow mutations set them — and RTK's `updateOne`/`upsertOne` merge only
     * the keys present in the payload, so a later poem fetch cannot blank them.
     */
    followerCount?: number
    followingCount?: number
    isFollowing?: boolean
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
