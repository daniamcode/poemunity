import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyPoemsAction } from '../../redux/actions/poemsActions'
import { selectMyPoemsPoems } from '../../redux/selectors/poemCacheSelectors'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION_LIMIT } from '../../data/constants'
import ListItem from '../ListItem/ListItem'
import PoemsListIntro from '../PoemsListIntro/PoemsListIntro'

function MyPoems() {
    const [filter, setFilter] = useState('')

    const context = useContext(AppContext)

    // Redux
    const dispatch = useAppDispatch()

    const myPoemsQuery = useSelector(state => state.myPoemsQuery)
    // Cache stores poem ids; resolve them to full poems via the entity store.
    const poems = useSelector(selectMyPoemsPoems)

    // Initial load
    useEffect(() => {
        if (context?.userId) {
            const queryOptions = {
                reset: true,
                fetch: true
            }
            dispatch(
                getMyPoemsAction({
                    params: {
                        userId: context.userId,
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
        if (!myPoemsQuery.isFetching && myPoemsQuery.hasMore && context?.userId) {
            const nextPage = (myPoemsQuery.page || 0) + 1
            dispatch(
                getMyPoemsAction({
                    params: {
                        userId: context.userId,
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
        isLoading: myPoemsQuery.isFetching,
        hasMore: myPoemsQuery.hasMore
    })

    const handleSearchChange = event => {
        setFilter(event.target.value)
    }

    if (myPoemsQuery.isFetching && !poems.length) {
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
            {myPoemsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}
export default MyPoems
