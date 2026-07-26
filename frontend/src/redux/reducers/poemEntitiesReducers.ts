import { createEntityAdapter, createSlice, PayloadAction, Update } from '@reduxjs/toolkit'
import type { RootState } from '../store'
import { Poem } from '../../typescript/interfaces'

// Normalized poem record — the single source of truth for a poem, keyed by
// poem.id. The list caches (poemsListQuery, rankingQuery, ...) hold only arrays
// of ids into this store, so a like/save/delete mutates the ONE entity here and
// every view re-reads it. Mirrors the Phase 1 authorEntities store in style.
const poemsAdapter = createEntityAdapter<Poem>()

const poemEntitiesSlice = createSlice({
    name: 'poemEntities',
    initialState: poemsAdapter.getInitialState(),
    reducers: {
        poemUpserted(state, action: PayloadAction<Poem>) {
            poemsAdapter.upsertOne(state, action.payload)
        },
        poemsUpserted(state, action: PayloadAction<Poem[]>) {
            poemsAdapter.upsertMany(state, action.payload)
        },
        poemUpdated(state, action: PayloadAction<Update<Poem>>) {
            poemsAdapter.updateOne(state, action.payload)
        },
        poemRemoved(state, action: PayloadAction<string>) {
            poemsAdapter.removeOne(state, action.payload)
        }
    }
})

export const { poemUpserted, poemsUpserted, poemUpdated, poemRemoved } = poemEntitiesSlice.actions

const selectors = poemsAdapter.getSelectors((state: RootState) => state.poemEntities)
export const selectPoemEntityById = selectors.selectById
export const selectAllPoemEntities = selectors.selectAll

export const poemEntitiesReducer = poemEntitiesSlice.reducer
