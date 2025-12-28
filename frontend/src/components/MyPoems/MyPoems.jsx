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
import { getMyPoemsAction } from '../../redux/actions/poemsActions'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION_LIMIT } from '../../data/constants'
import ListItem from '../ListItem/ListItem'

function MyPoems() {
    const [poems, setPoems] = useState([])
    const [filter, setFilter] = useState('')

    const context = useContext(AppContext)

    // Redux
    const dispatch = useAppDispatch()

    const myPoemsQuery = useSelector(state => state.myPoemsQuery)

    // Initial load
    // todo: check if i have to dispatch getAllPoemsAction as i used to do, or if this ia approach is correct
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

    // Update local state when data changes
    useEffect(() => {
        if (myPoemsQuery?.item) {
            setPoems(myPoemsQuery.item)
        }
    }, [myPoemsQuery?.item])

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
            {myPoemsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}
export default MyPoems
