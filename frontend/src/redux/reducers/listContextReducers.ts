// Browsing context for the "next poem" control.
//
// The poem list caches store an ordered id-array plus page/hasMore, but NOT the
// query that produced them (genre / origin / orderBy / q). The Detail page needs
// that query to fetch the next page when the reader reaches the tail of the
// cached list, so the list records it here as it fetches.
//
// This is deliberately CLIENT state and never a URL parameter: `?from=my-favourites`
// in a shared link is meaningless to the recipient at best and leaky at worst.
// It is also intentionally ephemeral — a cold page load simply has no context and
// falls back to the server's answer.

export interface ListContextParams {
    page?: number
    limit?: number
    orderBy?: string
    origin?: string
    genre?: string
    q?: string
}

export interface ListContextState {
    params: ListContextParams | null
}

const INITIAL_LIST_CONTEXT: ListContextState = { params: null }

const SET = 'list-context/set'

export function listContextSet(params: ListContextParams) {
    return { type: SET, payload: params }
}

interface Action {
    type: string
    payload?: ListContextParams
}

export function listContextQuery(
    state: ListContextState = INITIAL_LIST_CONTEXT,
    action: Action
): ListContextState {
    if (action.type === SET) {
        return { params: action.payload ?? null }
    }
    return state
}
