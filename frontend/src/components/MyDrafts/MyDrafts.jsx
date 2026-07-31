import { useEffect, useContext } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyDraftsAction } from '../../redux/actions/poemsActions'
import { selectMyDraftsPoems } from '../../redux/selectors/poemCacheSelectors'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION_LIMIT, MY_DRAFTS_EMPTY } from '../../data/constants'
import OwnerPoemRow from '../ListItem/OwnerPoemRow'

// The owner's private drafts.
//
// Deliberately NO search bar, unlike My poems and My favourites: those lists
// paginate over thousands of poems, drafts are a handful of works in progress,
// and a server-backed search would need its own owner-scoped query path for a
// list that fits on one screen.
function MyDrafts() {
    const context = useContext(AppContext)
    const dispatch = useAppDispatch()

    const myDraftsQuery = useSelector(state => state.myDraftsQuery)
    // The cache holds ids; the poems themselves resolve through poemEntities.
    const poems = useSelector(selectMyDraftsPoems)

    useEffect(() => {
        if (context?.userId) {
            dispatch(
                getMyDraftsAction({
                    params: { page: 1, limit: PAGINATION_LIMIT },
                    options: { reset: true, fetch: true }
                })
            )
        }
    }, [context?.userId, dispatch])

    const handleLoadMore = () => {
        if (!myDraftsQuery.isFetching && myDraftsQuery.hasMore && context?.userId) {
            dispatch(
                getMyDraftsAction({
                    params: { page: (myDraftsQuery.page || 0) + 1, limit: PAGINATION_LIMIT },
                    options: { fetch: true, reset: false }
                })
            )
        }
    }

    const sentinelRef = useInfiniteScroll({
        onLoadMore: handleLoadMore,
        isLoading: myDraftsQuery.isFetching,
        hasMore: myDraftsQuery.hasMore
    })

    if (myDraftsQuery.isFetching && !poems.length) {
        return <CircularProgress />
    }

    return (
        <>
            {!myDraftsQuery.isFetching && poems.length === 0 && (
                <p className='list__empty'>{MY_DRAFTS_EMPTY}</p>
            )}
            {poems.map(poem => (
                <OwnerPoemRow key={poem.id} poem={poem} context={context} />
            ))}
            <div ref={sentinelRef} style={{ height: '20px' }} />
            {myDraftsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}

export default MyDrafts
