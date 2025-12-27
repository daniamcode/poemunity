import { Poem } from '../../typescript/interfaces'
import { commonReducer, INITIAL } from './commonReducers'
import { StateItem } from '../../typescript/interfaces'
import { getTypes } from '../actions/commonActions'

export const ACTIONS = {
    ALL_POEMS: 'all-poems',
    POEMS_LIST: 'poems-list',
    MY_POEMS: 'my-poems',
    MY_FAVOURITE_POEMS: 'my-favourite-poems',
    RANKING: 'ranking',
    CREATE_POEM: 'create-poem'
}

interface Action {
    type: string
    payload?: any
}

interface PaginatedStateItem<T> extends StateItem<T> {
    page?: number
    hasMore?: boolean
    total?: number
    totalPages?: number
}

// used for MyFavouritePoems and for MyPoems
export function allPoemsQuery(state: StateItem<Poem[]> = INITIAL, action: Action): StateItem<Poem[]> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.ALL_POEMS,
        ...(state?.abortRequests !== undefined && {
            abortRequests: state?.abortRequests
        })
    })
}

// todo: check why do i need requestAction, rejectedAction etc because i have commonActions.ts
export function poemsListQuery(
    state: PaginatedStateItem<Poem[]> = INITIAL,
    action: Action
): PaginatedStateItem<Poem[]> {
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

            // Replace on first page or cache update, append on subsequent pages (pagination)
            const newPoems = isFirstPage || isCacheUpdate ? poems : [...(state.item || []), ...poems]

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
export function myPoemsQuery(state: PaginatedStateItem<Poem[]> = INITIAL, action: Action): PaginatedStateItem<Poem[]> {
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

            // Replace on first page or cache update, append on subsequent pages (pagination)
            const newPoems = isFirstPage || isCacheUpdate ? poems : [...(state.item || []), ...poems]

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
export function myFavouritePoemsQuery(
    state: PaginatedStateItem<Poem[]> = INITIAL,
    action: Action
): PaginatedStateItem<Poem[]> {
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

            // Replace on first page or cache update, append on subsequent pages (pagination)
            const newPoems = isFirstPage || isCacheUpdate ? poems : [...(state.item || []), ...poems]

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

// Ranking query receives all poems (no pagination) for accurate calculation
// TODO: In the future, move ranking calculation to backend to avoid fetching all poems
export function rankingQuery(state: StateItem<Poem[]> = INITIAL, action: Action): StateItem<Poem[]> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.RANKING
    })
}

export function createPoemQuery(state: StateItem<Poem[]> = INITIAL, action: Action): StateItem<Poem[]> {
    return commonReducer({
        state,
        action,
        actionType: ACTIONS?.CREATE_POEM
    })
}
