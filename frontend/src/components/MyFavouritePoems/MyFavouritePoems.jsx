import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../App'
import '../List/List.scss'
import '../Detail/Detail.scss'
import '../../App.scss'
import { TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyFavouritePoemsAction } from '../../redux/actions/poemsActions'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION_LIMIT } from '../../data/constants'
import ListItem from '../ListItem/ListItem'

function MyFavouritePoems() {
    const context = useContext(AppContext)

    const [poems, setPoems] = useState([])
    const [filter, setFilter] = useState('')

    // Redux
    const dispatch = useAppDispatch()

    const myFavouritePoemsQuery = useSelector(state => state.myFavouritePoemsQuery)

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

    // Update local state when data changes
    useEffect(() => {
        if (myFavouritePoemsQuery?.item) {
            setPoems(myFavouritePoemsQuery.item)
        }
    }, [myFavouritePoemsQuery?.item])

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
            <div className='list__intro'>
                <div className='separator' />
                <div className='list__search'>
                    <SearchIcon
                        style={{
                            fontSize: 40,
                            fill: '#551A8B'
                        }}
                    />
                    <TextField
                        variant='standard'
                        label='Search author'
                        InputLabelProps={{
                            style: {
                                color: '#551A8B'
                            }
                        }}
                        InputProps={{
                            style: {
                                color: '#551A8B'
                            }
                        }}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
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
