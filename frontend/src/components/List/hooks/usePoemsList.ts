import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../../redux/store'
import { getPoemsListAction } from '../../../redux/actions/poemsActions'
import { getTypes } from '../../../redux/actions/commonActions'
import { ACTIONS } from '../../../redux/reducers/poemsReducers'
import { poemsUpserted } from '../../../redux/reducers/poemEntitiesReducers'
import { selectPoemsListPoems } from '../../../redux/selectors/poemCacheSelectors'
import sortPoems from '../../../utils/sortPoems'
import { ORDER_BY_LIKES, PAGINATION_LIMIT } from '../../../data/constants'
import { Poem } from '../../../typescript/interfaces'

export interface InitialPoemsData {
    poems: Poem[]
    page: number
    hasMore: boolean
    total: number
    totalPages?: number
}

export interface UsePoemsListParams {
    genre?: string
    origin: string
    orderBy: string
    initialData?: InitialPoemsData
    /** Debounced search query, already past the minimum length. '' means none. */
    q?: string
    /** Fresh AbortSignal per fetch, so a superseded request cannot land late. */
    nextSignal?: () => AbortSignal
}

export function usePoemsList({ genre, origin, orderBy, initialData, q = '', nextSignal }: UsePoemsListParams) {
    const dispatch = useAppDispatch()
    const poemsListQuery = useSelector((state: RootState) => state.poemsListQuery)
    // Cache stores poem ids; resolve them back to Poem[] via the entity store.
    const resolvedPoems = useSelector(selectPoemsListPoems)
    const isSeeded = useRef(false)
    const effectiveOrderBy = orderBy || ORDER_BY_LIKES

    // On mount: seed store with SSR data (skip reset+fetch) or do normal reset
    useEffect(() => {
        if (initialData) {
            // Seed the entity store first so the id-array resolves to full poems.
            dispatch(poemsUpserted(initialData.poems))
            const { fulfilledAction } = getTypes(ACTIONS.POEMS_LIST)
            dispatch({ type: fulfilledAction, payload: initialData })
            isSeeded.current = true
        } else {
            dispatch(getPoemsListAction({ options: { reset: true, fetch: false } }))
        }
    }, [dispatch])

    // Every fetch (initial, search, load-more, retry) sends the same filters;
    // only the page differs. Keeping one builder means search can never be
    // dropped from one of them.
    const buildParams = (page: number) => ({
        page,
        limit: PAGINATION_LIMIT,
        orderBy: effectiveOrderBy,
        ...(origin !== 'all' && { origin }),
        ...(genre && { genre }),
        ...(q && { q })
    })

    // Fetch when origin/genre/search changes — skip the first run if we seeded
    // from SSR
    useEffect(() => {
        if (isSeeded.current) {
            isSeeded.current = false
            return
        }
        if (origin) {
            dispatch(
                getPoemsListAction({
                    params: buildParams(1),
                    options: { reset: true, fetch: true },
                    signal: nextSignal?.()
                })
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origin, genre, effectiveOrderBy, q, dispatch])

    const poems = (() => {
        if (!resolvedPoems.length) return []
        return sortPoems(effectiveOrderBy, [...resolvedPoems])
    })()

    const handleLoadMore = () => {
        if (!poemsListQuery.isFetching && poemsListQuery.hasMore) {
            const nextPage = (poemsListQuery.page || 0) + 1
            dispatch(
                getPoemsListAction({
                    params: buildParams(nextPage),
                    options: { fetch: true, reset: false },
                    signal: nextSignal?.()
                })
            )
        }
    }

    const retry = () => {
        dispatch(
            getPoemsListAction({
                params: buildParams(1),
                options: { reset: true, fetch: true },
                signal: nextSignal?.()
            })
        )
    }

    return {
        poems,
        isLoading: poemsListQuery?.isFetching,
        isError: poemsListQuery?.isError || false,
        hasMore: poemsListQuery?.hasMore || false,
        hasItems: resolvedPoems.length > 0,
        handleLoadMore,
        retry
    }
}
