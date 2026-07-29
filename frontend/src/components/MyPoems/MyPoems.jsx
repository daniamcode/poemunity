import { useEffect, useContext } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyPoemsAction } from '../../redux/actions/poemsActions'
import { selectMyPoemsPoems } from '../../redux/selectors/poemCacheSelectors'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useSearchQuery } from '../../hooks/useSearchQuery'
import { PAGINATION_LIMIT, SEARCH_NO_RESULTS, MY_POEMS_EMPTY } from '../../data/constants'
import ListItem from '../ListItem/ListItem'
import PoemsListIntro from '../PoemsListIntro/PoemsListIntro'

function MyPoems() {
    const { input: searchInput, q, nextSignal, onSearchChange } = useSearchQuery()

    const context = useContext(AppContext)

    // Redux
    const dispatch = useAppDispatch()

    const myPoemsQuery = useSelector(state => state.myPoemsQuery)
    // Cache stores poem ids; resolve them to full poems via the entity store.
    const poems = useSelector(selectMyPoemsPoems)

    // Initial load, and every time the debounced search query changes. Search
    // runs on the server, so a new query is a new first page rather than a
    // filter over whatever happens to be loaded.
    useEffect(() => {
        if (context?.userId) {
            dispatch(
                getMyPoemsAction({
                    params: {
                        userId: context.userId,
                        page: 1,
                        limit: PAGINATION_LIMIT,
                        ...(q && { q })
                    },
                    options: { reset: true, fetch: true },
                    signal: nextSignal()
                })
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [context?.userId, q, dispatch])

    // Infinite scroll handler
    const handleLoadMore = () => {
        if (!myPoemsQuery.isFetching && myPoemsQuery.hasMore && context?.userId) {
            const nextPage = (myPoemsQuery.page || 0) + 1
            dispatch(
                getMyPoemsAction({
                    params: {
                        userId: context.userId,
                        page: nextPage,
                        limit: PAGINATION_LIMIT,
                        ...(q && { q })
                    },
                    options: {
                        fetch: true,
                        reset: false
                    },
                    signal: nextSignal()
                })
            )
        }
    }

    const sentinelRef = useInfiniteScroll({
        onLoadMore: handleLoadMore,
        isLoading: myPoemsQuery.isFetching,
        hasMore: myPoemsQuery.hasMore
    })

    // Full-page spinner only on the very first load. During a search the
    // header must stay mounted, or the input unmounts mid-query and the user
    // loses focus and their caret on every keystroke.
    if (myPoemsQuery.isFetching && !poems.length && !q) {
        return <CircularProgress />
    }

    return (
        <>
            <PoemsListIntro
                searchValue={searchInput}
                resultCount={myPoemsQuery.isFetching ? undefined : poems.length}
                onSearchChange={onSearchChange}
            />
            {!myPoemsQuery.isFetching && poems.length === 0 && (
                <p className='list__empty'>{q ? SEARCH_NO_RESULTS : MY_POEMS_EMPTY}</p>
            )}
            {poems.map(poem => (
                <ListItem key={poem.id} poem={poem} context={context} />
            ))}
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: '20px' }} />
            {myPoemsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}
export default MyPoems
