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
}

export function usePoemsList({ genre, origin, orderBy, initialData }: UsePoemsListParams) {
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

    // Fetch when origin/genre changes — skip the first run if we seeded from SSR
    useEffect(() => {
        if (isSeeded.current) {
            isSeeded.current = false
            return
        }
        if (origin) {
            dispatch(
                getPoemsListAction({
                    params: {
                        page: 1,
                        limit: PAGINATION_LIMIT,
                        orderBy: effectiveOrderBy,
                        ...(origin !== 'all' && { origin }),
                        ...(genre && { genre })
                    },
                    options: { reset: true, fetch: true }
                })
            )
        }
    }, [origin, genre, effectiveOrderBy, dispatch])

    const poems = (() => {
        if (!resolvedPoems.length) return []
        return sortPoems(effectiveOrderBy, [...resolvedPoems])
    })()

    const handleLoadMore = () => {
        if (!poemsListQuery.isFetching && poemsListQuery.hasMore) {
            const nextPage = (poemsListQuery.page || 0) + 1
            dispatch(
                getPoemsListAction({
                    params: {
                        page: nextPage,
                        limit: PAGINATION_LIMIT,
                        orderBy: effectiveOrderBy,
                        ...(origin !== 'all' && { origin }),
                        ...(genre && { genre })
                    },
                    options: { fetch: true, reset: false }
                })
            )
        }
    }

    const retry = () => {
        dispatch(
            getPoemsListAction({
                params: {
                    page: 1,
                    limit: PAGINATION_LIMIT,
                    orderBy: effectiveOrderBy,
                    ...(origin !== 'all' && { origin }),
                    ...(genre && { genre })
                },
                options: { reset: true, fetch: true }
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
