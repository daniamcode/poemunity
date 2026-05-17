import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../redux/store'
import { getAuthorPoemsAction } from '../../redux/actions/poemsActions'
import { getTypes } from '../../redux/actions/commonActions'
import { ACTIONS } from '../../redux/reducers/poemsReducers'
import { PAGINATION_LIMIT } from '../../data/constants'
import { Poem } from '../../typescript/interfaces'

export interface InitialAuthorPoemsData {
    poems: Poem[]
    page: number
    hasMore: boolean
    total: number
}

export function useAuthorPoems(slug: string, initialData?: InitialAuthorPoemsData) {
    const dispatch = useAppDispatch()
    const authorPoemsQuery = useSelector((state: RootState) => state.authorPoemsQuery)
    const isSeeded = useRef(false)

    useEffect(() => {
        if (initialData) {
            const { fulfilledAction } = getTypes(ACTIONS.AUTHOR_POEMS)
            dispatch({ type: fulfilledAction, payload: initialData })
            isSeeded.current = true
        } else {
            dispatch(getAuthorPoemsAction({ options: { reset: true, fetch: false } }))
        }
    }, [dispatch])

    useEffect(() => {
        if (isSeeded.current) {
            isSeeded.current = false
            return
        }
        if (!slug) return
        dispatch(
            getAuthorPoemsAction({
                params: { page: 1, limit: PAGINATION_LIMIT, author: slug },
                options: { reset: true, fetch: true }
            })
        )
    }, [slug, dispatch])

    const handleLoadMore = () => {
        if (!authorPoemsQuery.isFetching && authorPoemsQuery.hasMore) {
            const nextPage = (authorPoemsQuery.page || 0) + 1
            dispatch(
                getAuthorPoemsAction({
                    params: { page: nextPage, limit: PAGINATION_LIMIT, author: slug },
                    options: { fetch: true, reset: false }
                })
            )
        }
    }

    return {
        poems: (authorPoemsQuery.item as Poem[]) || [],
        isLoading: authorPoemsQuery.isFetching,
        hasMore: authorPoemsQuery.hasMore || false,
        total: authorPoemsQuery.total || 0,
        handleLoadMore
    }
}
