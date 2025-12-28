import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../../redux/store'
import { getPoemsListAction } from '../../../redux/actions/poemsActions'
import sortPoems from '../../../utils/sortPoems'
import { PAGINATION_LIMIT } from '../../../data/constants'

export interface UsePoemsListParams {
    genre?: string
    origin: string
    orderBy: string
}

export function usePoemsList({ genre, origin, orderBy }: UsePoemsListParams) {
    const dispatch = useAppDispatch()
    const poemsListQuery = useSelector((state: RootState) => state.poemsListQuery)

    // Initial reset on mount
    useEffect(() => {
        const queryOptions = {
            reset: true,
            fetch: false
        }
        dispatch(
            getPoemsListAction({
                options: queryOptions
            })
        )
    }, [dispatch])

    // Fetch poems when origin changes
    useEffect(() => {
        function handleLoadPoems() {
            if (origin) {
                const queryOptions = {
                    reset: true,
                    fetch: true
                }
                dispatch(
                    getPoemsListAction({
                        params: {
                            page: 1,
                            limit: PAGINATION_LIMIT,
                            ...(origin !== 'all' && { origin })
                        },
                        options: queryOptions
                    })
                )
            }
        }
        handleLoadPoems()
    }, [origin, dispatch])

    // Derive sorted/filtered poems directly from Redux state (no local state)
    const poems = (() => {
        if (!poemsListQuery?.item?.length) {
            return []
        }

        const data = [...poemsListQuery.item]

        if (genre) {
            const poemsFiltered = data.filter(poem => poem.genre === genre)
            return sortPoems(orderBy, poemsFiltered)
        }

        return sortPoems(orderBy, data)
    })()

    const handleLoadMore = () => {
        if (!poemsListQuery.isFetching && poemsListQuery.hasMore) {
            const nextPage = (poemsListQuery.page || 0) + 1
            dispatch(
                getPoemsListAction({
                    params: {
                        page: nextPage,
                        limit: PAGINATION_LIMIT,
                        ...(origin !== 'all' && { origin })
                    },
                    options: {
                        fetch: true,
                        reset: false
                    }
                })
            )
        }
    }

    return {
        poems,
        isLoading: poemsListQuery?.isFetching,
        hasMore: poemsListQuery?.hasMore || false,
        hasItems: poemsListQuery?.item && poemsListQuery?.item?.length > 0,
        handleLoadMore
    }
}
