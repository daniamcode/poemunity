import { useEffect, useContext } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyFavouritePoemsAction } from '../../redux/actions/poemsActions'
import { selectMyFavouritePoemsPoems } from '../../redux/selectors/poemCacheSelectors'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useSearchQuery } from '../../hooks/useSearchQuery'
import { PAGINATION_LIMIT, SEARCH_NO_RESULTS } from '../../data/constants'
import ListItem from '../ListItem/ListItem'
import PoemsListIntro from '../PoemsListIntro/PoemsListIntro'

function MyFavouritePoems() {
    const context = useContext(AppContext)

    const { input: searchInput, q, nextSignal, onSearchChange } = useSearchQuery()

    // Redux
    const dispatch = useAppDispatch()

    const myFavouritePoemsQuery = useSelector(state => state.myFavouritePoemsQuery)
    // Cache stores poem ids; resolve them to full poems via the entity store.
    const poems = useSelector(selectMyFavouritePoemsPoems)

    // Initial load, and every time the debounced search query changes. Search
    // runs on the server, so a new query is a new first page rather than a
    // filter over whatever happens to be loaded.
    useEffect(() => {
        if (context?.userId) {
            dispatch(
                getMyFavouritePoemsAction({
                    params: {
                        likedBy: context.userId,
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
        if (!myFavouritePoemsQuery.isFetching && myFavouritePoemsQuery.hasMore && context?.userId) {
            const nextPage = (myFavouritePoemsQuery.page || 0) + 1
            dispatch(
                getMyFavouritePoemsAction({
                    params: {
                        likedBy: context.userId,
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
        isLoading: myFavouritePoemsQuery.isFetching,
        hasMore: myFavouritePoemsQuery.hasMore
    })

    // Full-page spinner only on the very first load. During a search the
    // header must stay mounted, or the input unmounts mid-query and the user
    // loses focus and their caret on every keystroke.
    if (myFavouritePoemsQuery.isFetching && !poems.length && !q) {
        return <CircularProgress />
    }

    return (
        <>
            <PoemsListIntro
                searchValue={searchInput}
                resultCount={myFavouritePoemsQuery.isFetching ? undefined : poems.length}
                onSearchChange={onSearchChange}
            />
            {!myFavouritePoemsQuery.isFetching && poems.length === 0 && q && (
                <p className='list__empty'>{SEARCH_NO_RESULTS}</p>
            )}
            {poems.map(poem => (
                <ListItem key={poem.id} poem={poem} context={context} />
            ))}
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: '20px' }} />
            {myFavouritePoemsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}
export default MyFavouritePoems
