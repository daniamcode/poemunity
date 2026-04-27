import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../redux/store'
import { getAuthorPoemsAction } from '../../redux/actions/poemsActions'
import { PAGINATION_LIMIT } from '../../data/constants'

export function useAuthorPoems(slug: string) {
    const dispatch = useAppDispatch()
    const authorPoemsQuery = useSelector((state: RootState) => state.authorPoemsQuery)

    useEffect(() => {
        dispatch(getAuthorPoemsAction({ options: { reset: true, fetch: false } }))
    }, [dispatch])

    useEffect(() => {
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
        poems: (authorPoemsQuery.item as any[]) || [],
        isLoading: authorPoemsQuery.isFetching,
        hasMore: authorPoemsQuery.hasMore || false,
        total: authorPoemsQuery.total || 0,
        handleLoadMore
    }
}
