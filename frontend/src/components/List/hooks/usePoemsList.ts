import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../../redux/store'
import { getPoemsListAction } from '../../../redux/actions/poemsActions'
import { getTypes } from '../../../redux/actions/commonActions'
import { ACTIONS } from '../../../redux/reducers/poemsReducers'
import sortPoems from '../../../utils/sortPoems'
import { PAGINATION_LIMIT } from '../../../data/constants'
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
    const isSeeded = useRef(false)

    // On mount: seed store with SSR data (skip reset+fetch) or do normal reset
    useEffect(() => {
        if (initialData) {
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
                        ...(origin !== 'all' && { origin }),
                        ...(genre && { genre })
                    },
                    options: { reset: true, fetch: true }
                })
            )
        }
    }, [origin, genre, dispatch])

    const poems = (() => {
        if (!poemsListQuery?.item?.length) return []
        return sortPoems(orderBy, [...poemsListQuery.item])
    })()

    const handleLoadMore = () => {
        if (!poemsListQuery.isFetching && poemsListQuery.hasMore) {
            const nextPage = (poemsListQuery.page || 0) + 1
            dispatch(
                getPoemsListAction({
                    params: {
                        page: nextPage,
                        limit: PAGINATION_LIMIT,
                        ...(origin !== 'all' && { origin }),
                        ...(genre && { genre })
                    },
                    options: { fetch: true, reset: false }
                })
            )
        }
    }

    return {
        poems,
        isLoading: poemsListQuery?.isFetching,
        hasMore: poemsListQuery?.hasMore || false,
        hasItems: (poemsListQuery?.item?.length ?? 0) > 0,
        handleLoadMore
    }
}
