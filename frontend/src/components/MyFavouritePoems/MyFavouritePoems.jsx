import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyFavouritePoemsAction } from '../../redux/actions/poemsActions'
import { selectMyFavouritePoemsPoems } from '../../redux/selectors/poemCacheSelectors'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION_LIMIT } from '../../data/constants'
import ListItem from '../ListItem/ListItem'
import PoemsListIntro from '../PoemsListIntro/PoemsListIntro'

function MyFavouritePoems() {
    const context = useContext(AppContext)

    const [filter, setFilter] = useState('')

    // Redux
    const dispatch = useAppDispatch()

    const myFavouritePoemsQuery = useSelector(state => state.myFavouritePoemsQuery)
    // Cache stores poem ids; resolve them to full poems via the entity store.
    const poems = useSelector(selectMyFavouritePoemsPoems)

    // Initial load
    useEffect(() => {
        if (context?.userId) {
            const queryOptions = {
                reset: true,
                fetch: true
            }
            dispatch(
                getMyFavouritePoemsAction({
                    params: {
                        likedBy: context.userId,
                        page: 1,
                        limit: PAGINATION_LIMIT
                    },
                    options: queryOptions
                })
            )
        }
    }, [context?.userId, dispatch])

    // Infinite scroll handler
    const handleLoadMore = () => {
        if (!myFavouritePoemsQuery.isFetching && myFavouritePoemsQuery.hasMore && context?.userId) {
            const nextPage = (myFavouritePoemsQuery.page || 0) + 1
            dispatch(
                getMyFavouritePoemsAction({
                    params: {
                        likedBy: context.userId,
                        page: nextPage,
                        limit: PAGINATION_LIMIT
                    },
                    options: {
                        fetch: true,
                        reset: false
                    }
                })
            )
        }
    }

    const sentinelRef = useInfiniteScroll({
        onLoadMore: handleLoadMore,
        isLoading: myFavouritePoemsQuery.isFetching,
        hasMore: myFavouritePoemsQuery.hasMore
    })

    const handleSearchChange = event => {
        setFilter(event.target.value)
    }

    if (myFavouritePoemsQuery.isFetching && !poems.length) {
        return <CircularProgress />
    }

    return (
        <>
            <PoemsListIntro onSearchChange={handleSearchChange} />
            {poems.map(poem => (
                <ListItem key={poem.id} poem={poem} filter={filter} context={context} />
            ))}
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: '20px' }} />
            {myFavouritePoemsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}
export default MyFavouritePoems
