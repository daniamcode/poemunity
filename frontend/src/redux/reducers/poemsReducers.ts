import { Poem, PoemOfTheWeek } from '../../typescript/interfaces'
import { commonReducer, INITIAL } from './commonReducers'
import { StateItem } from '../../typescript/interfaces'
import { getTypes } from '../actions/commonActions'
import { RankItem } from '../../utils/getRanking'

export const ACTIONS = {
    POEMS_LIST: 'poems-list',
    MY_POEMS: 'my-poems',
    MY_FAVOURITE_POEMS: 'my-favourite-poems',
    RANKING: 'ranking',
    POEM_OF_THE_WEEK: 'poem-of-the-week',
    CREATE_POEM: 'create-poem',
    AUTHOR_POEMS: 'author-poems',
    MY_DRAFTS: 'my-drafts'
}

// A list cache stores only poem ids; the full poems live in the normalized
// poemEntities store. An entry may already be an id (the normal fetch path) or
// still be a full Poem (e.g. a hand-built test payload), so normalize to ids.
function idOf(entry: Poem | string): string {
    return typeof entry === 'string' ? entry : entry?.id
}

function toIds(poems: (Poem | string)[]): string[] {
    return poems.map(idOf)
}

interface Action {
    type: string
    payload?: any
}

// After normalization the caches hold string[] (poem ids) plus pagination meta.
interface PaginatedStateItem extends StateItem<string[]> {
    page?: number
    hasMore?: boolean
    total?: number
    totalPages?: number
}

// todo: check why do i need requestAction, rejectedAction etc because i have commonActions.ts
export function poemsListQuery(state: PaginatedStateItem = INITIAL, action: Action): PaginatedStateItem {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } = getTypes(ACTIONS.POEMS_LIST)

    switch (action.type) {
        case requestAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return Object.assign({}, state, {
                isFetching: true
            })
        }
        case fulfilledAction: {
            const { poems, page, hasMore, total, totalPages } = action.payload
            const isFirstPage = page === 1

            // Cache update detection:
            // - Like/unlike: same page, same length
            // - Delete: same page, shorter length
            // - Both cases: we're on the same page and length is same or shorter
            const isCacheUpdate = state.item && state.page === page && poems.length <= state.item.length

            const incomingIds = toIds(poems)
            // Replace on first page or cache update, append on subsequent pages (pagination)
            const newPoems = isFirstPage || isCacheUpdate ? incomingIds : [...(state.item || []), ...incomingIds]

            return Object.assign({}, state, {
                isFetching: false,
                isError: false,
                item: newPoems,
                page,
                hasMore,
                total,
                totalPages,
                err: undefined,
                abortController: undefined
            })
        }
        case rejectedAction:
            return Object.assign({}, state, {
                isFetching: false,
                isError: true,
                err: action.payload,
                abortController: undefined
            })
        case resetAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return INITIAL
        }
        default:
            return state
    }
}

// todo: check why do i need requestAction, rejectedAction etc because i have commonActions.ts
export function myPoemsQuery(state: PaginatedStateItem = INITIAL, action: Action): PaginatedStateItem {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } = getTypes(ACTIONS.MY_POEMS)

    switch (action.type) {
        case requestAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return Object.assign({}, state, {
                isFetching: true
            })
        }
        case fulfilledAction: {
            const { poems, page, hasMore, total, totalPages } = action.payload
            const isFirstPage = page === 1

            // Cache update detection:
            // - Like/unlike: same page, same length
            // - Delete: same page, shorter length
            // - Both cases: we're on the same page and length is same or shorter
            const isCacheUpdate = state.item && state.page === page && poems.length <= state.item.length

            const incomingIds = toIds(poems)
            // Replace on first page or cache update, append on subsequent pages (pagination)
            const newPoems = isFirstPage || isCacheUpdate ? incomingIds : [...(state.item || []), ...incomingIds]

            return Object.assign({}, state, {
                isFetching: false,
                isError: false,
                item: newPoems,
                page,
                hasMore,
                total,
                totalPages,
                err: undefined,
                abortController: undefined
            })
        }
        case rejectedAction:
            return Object.assign({}, state, {
                isFetching: false,
                isError: true,
                err: action.payload,
                abortController: undefined
            })
        case resetAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return INITIAL
        }
        default:
            return state
    }
}

// todo: check why do i need requestAction, rejectedAction etc because i have commonActions.ts
export function myFavouritePoemsQuery(state: PaginatedStateItem = INITIAL, action: Action): PaginatedStateItem {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } = getTypes(ACTIONS.MY_FAVOURITE_POEMS)

    switch (action.type) {
        case requestAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return Object.assign({}, state, {
                isFetching: true
            })
        }
        case fulfilledAction: {
            const { poems, page, hasMore, total, totalPages } = action.payload
            const isFirstPage = page === 1

            // Cache update detection:
            // - Like/unlike: same page, same length
            // - Delete: same page, shorter length
            // - Both cases: we're on the same page and length is same or shorter
            const isCacheUpdate = state.item && state.page === page && poems.length <= state.item.length

            const incomingIds = toIds(poems)
            // Replace on first page or cache update, append on subsequent pages (pagination)
            const newPoems = isFirstPage || isCacheUpdate ? incomingIds : [...(state.item || []), ...incomingIds]

            return Object.assign({}, state, {
                isFetching: false,
                isError: false,
                item: newPoems,
                page,
                hasMore,
                total,
                totalPages,
                err: undefined,
                abortController: undefined
            })
        }
        case rejectedAction:
            return Object.assign({}, state, {
                isFetching: false,
                isError: true,
                err: action.payload,
                abortController: undefined
            })
        case resetAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return INITIAL
        }
        default:
            return state
    }
}

// Ranking is now computed server-side: the backend returns a ready-to-render
// array of ranked authors (RankItem[]), so the cache stores it verbatim.
export function rankingQuery(state: StateItem<RankItem[]> = INITIAL, action: Action): StateItem<RankItem[]> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.RANKING
    }) as StateItem<RankItem[]>
}

// Not a list cache: one poem plus the Monday its week began, exactly as the
// server computed it. Nothing is derived client-side, so the pick cannot drift
// between visitors.
export function poemOfTheWeekQuery(
    state: StateItem<PoemOfTheWeek> = INITIAL,
    action: Action
): StateItem<PoemOfTheWeek> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.POEM_OF_THE_WEEK
    }) as StateItem<PoemOfTheWeek>
}

export function createPoemQuery(state: StateItem<Poem> = INITIAL, action: Action): StateItem<Poem> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.CREATE_POEM
    })
}

// The owner's own drafts. Same id-list shape as every other list cache — the
// poems themselves live once in poemEntities — so a draft that is published
// (or an edit to one) is a single entity update, not a copy to patch.
export function myDraftsQuery(state: PaginatedStateItem = INITIAL, action: Action): PaginatedStateItem {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } = getTypes(ACTIONS.MY_DRAFTS)

    switch (action.type) {
        case requestAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return Object.assign({}, state, { isFetching: true })
        }
        case fulfilledAction: {
            const { poems, page, hasMore, total, totalPages } = action.payload
            const isFirstPage = page === 1
            const isCacheUpdate = state.item && state.page === page && poems.length <= state.item.length
            const incomingIds = toIds(poems)
            const newPoems = isFirstPage || isCacheUpdate ? incomingIds : [...(state.item || []), ...incomingIds]
            return Object.assign({}, state, {
                isFetching: false,
                isError: false,
                item: newPoems,
                page,
                hasMore,
                total,
                totalPages,
                err: undefined,
                abortController: undefined
            })
        }
        case rejectedAction:
            return Object.assign({}, state, {
                isFetching: false,
                isError: true,
                err: action.payload,
                abortController: undefined
            })
        case resetAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return INITIAL
        }
        default:
            return state
    }
}

export function authorPoemsQuery(state: PaginatedStateItem = INITIAL, action: Action): PaginatedStateItem {
    const { rejectedAction, requestAction, fulfilledAction, resetAction } = getTypes(ACTIONS.AUTHOR_POEMS)

    switch (action.type) {
        case requestAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return Object.assign({}, state, { isFetching: true })
        }
        case fulfilledAction: {
            const { poems, page, hasMore, total, totalPages } = action.payload
            const isFirstPage = page === 1
            const isCacheUpdate = state.item && state.page === page && poems.length <= state.item.length
            const incomingIds = toIds(poems)
            const newPoems = isFirstPage || isCacheUpdate ? incomingIds : [...(state.item || []), ...incomingIds]
            return Object.assign({}, state, {
                isFetching: false,
                isError: false,
                item: newPoems,
                page,
                hasMore,
                total,
                totalPages,
                err: undefined,
                abortController: undefined
            })
        }
        case rejectedAction:
            return Object.assign({}, state, {
                isFetching: false,
                isError: true,
                err: action.payload,
                abortController: undefined
            })
        case resetAction: {
            if (state.abortController) {
                state.abortController.abort()
            }
            return INITIAL
        }
        default:
            return state
    }
}
