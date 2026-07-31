import { getTypes } from './commonActions'
import { AppDispatch } from '../store'
import { Poem } from '../../typescript/interfaces'

// ---------------------------------------------------------------------------
// The primitives every list cache is edited through.
//
// Since normalization, a list cache holds nothing but poem IDS plus pagination
// meta — the poems themselves live once in poemEntities. So a like or an edit
// needs no cache work at all (mutate the entity, every view re-reads it), and
// the only thing left for these lists is MEMBERSHIP: which ids are in, in what
// order, and what the total says.
//
// They live in their own module because poemsActions is the caller, not the
// owner: create, delete, like and publish/unpublish all compose exactly these
// two operations, and keeping them in one place is what stops each mutation
// from growing its own slightly-different copy — the failure mode the old
// updateXCacheAfterY family was.
// ---------------------------------------------------------------------------

export function idOf(entry: Poem | string): string {
    return typeof entry === 'string' ? entry : entry?.id
}

// Re-emit a paginated cache's fulfilled action with an explicit id-array so the
// reducer's cache-update path (same page, length <=) replaces in place.
export function emitPaginated(
    dispatch: AppDispatch,
    actionType: string,
    cache: any,
    ids: string[],
    total?: number
) {
    const { fulfilledAction } = getTypes(actionType)
    dispatch({
        type: fulfilledAction,
        payload: {
            poems: ids,
            page: cache.page,
            hasMore: cache.hasMore,
            total: total !== undefined ? total : cache.total,
            totalPages: cache.totalPages
        }
    })
}

// Both operations leave an UNPOPULATED cache (`item` undefined) alone: writing
// to one would fabricate a first page the user never fetched, which then reads
// as a complete list.
export function removeFromCache(dispatch: AppDispatch, actionType: string, cache: any, poemId: string) {
    if (!Array.isArray(cache?.item)) {
        return
    }
    const kept = (cache.item as (Poem | string)[]).map(idOf).filter(id => id !== poemId)
    if (kept.length === cache.item.length) {
        return
    }
    emitPaginated(dispatch, actionType, cache, kept, Math.max(0, (cache.total || 0) - 1))
}

export function insertIntoCacheFront(dispatch: AppDispatch, actionType: string, cache: any, poemId: string) {
    if (!Array.isArray(cache?.item)) {
        return
    }
    const ids = (cache.item as (Poem | string)[]).map(idOf)
    if (ids.includes(poemId)) {
        return
    }
    emitPaginated(dispatch, actionType, cache, [poemId, ...ids], (cache.total || 0) + 1)
}
