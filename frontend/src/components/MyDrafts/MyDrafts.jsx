import { useEffect, useContext } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyDraftsAction } from '../../redux/actions/poemsActions'
import { selectMyDraftsPoems } from '../../redux/selectors/poemCacheSelectors'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useSearchQuery } from '../../hooks/useSearchQuery'
import { PAGINATION_LIMIT, MY_DRAFTS_EMPTY, SEARCH_NO_RESULTS } from '../../data/constants'
import OwnerPoemRow from '../ListItem/OwnerPoemRow'
import PoemsListIntro from '../PoemsListIntro/PoemsListIntro'

// The owner's private drafts — the same shape as My poems, search included.
//
// Search needed no backend work: `GET /poems?status=draft` composes `?q=` under
// `$and` like any other list, and the drafts scoping (`authorId` from the
// session, applied last) overrides nothing that `$and` set. So the query is
// owner-scoped by construction, not by anything this component passes.
function MyDrafts() {
    const { input: searchInput, q, nextSignal, onSearchChange } = useSearchQuery()

    const context = useContext(AppContext)
    const dispatch = useAppDispatch()

    const myDraftsQuery = useSelector(state => state.myDraftsQuery)
    // The cache holds ids; the poems themselves resolve through poemEntities.
    const poems = useSelector(selectMyDraftsPoems)

    // Refetches on every debounced query change: search runs on the server, so
    // a new query is a new first page rather than a filter over what is loaded.
    useEffect(() => {
        if (context?.userId) {
            dispatch(
                getMyDraftsAction({
                    params: { page: 1, limit: PAGINATION_LIMIT, ...(q && { q }) },
                    options: { reset: true, fetch: true },
                    signal: nextSignal()
                })
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context?.userId, q, dispatch])

    const handleLoadMore = () => {
        if (!myDraftsQuery.isFetching && myDraftsQuery.hasMore && context?.userId) {
            dispatch(
                getMyDraftsAction({
                    params: {
                        page: (myDraftsQuery.page || 0) + 1,
                        limit: PAGINATION_LIMIT,
                        ...(q && { q })
                    },
                    options: { fetch: true, reset: false },
                    signal: nextSignal()
                })
            )
        }
    }

    const sentinelRef = useInfiniteScroll({
        onLoadMore: handleLoadMore,
        isLoading: myDraftsQuery.isFetching,
        hasMore: myDraftsQuery.hasMore
    })

    // Gated on `!q` as well: during a search the header must stay mounted, or
    // the input unmounts mid-query and the user loses focus and caret on every
    // keystroke.
    if (myDraftsQuery.isFetching && !poems.length && !q) {
        return <CircularProgress />
    }

    return (
        <>
            <PoemsListIntro
                searchValue={searchInput}
                resultCount={myDraftsQuery.isFetching ? undefined : poems.length}
                onSearchChange={onSearchChange}
            />
            {!myDraftsQuery.isFetching && poems.length === 0 && (
                <p className='list__empty'>{q ? SEARCH_NO_RESULTS : MY_DRAFTS_EMPTY}</p>
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
