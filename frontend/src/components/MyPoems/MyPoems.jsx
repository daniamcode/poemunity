import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../App'
import { Link } from 'react-router-dom'
import '../List/List.scss'
import '../Detail/Detail.scss'
import '../../App.scss'
import { TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import HighlightOffSharpIcon from '@mui/icons-material/HighlightOffSharp'
import SubjectSharpIcon from '@mui/icons-material/SubjectSharp'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyPoemsAction } from '../../redux/actions/poemsActions'
import { deletePoemAction } from '../../redux/actions/poemActions'
import { manageError, manageSuccess } from '../../utils/notifications'
import { format } from 'date-fns'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION_LIMIT } from '../../data/constants'

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
    }, [JSON.stringify(myPoemsQuery?.item)])

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

    const editPoem = poemId => {
        context.setState({
            ...context,
            elementToEdit: poemId
        })
    }

    function onDelete(event, poemId) {
        event.preventDefault()
        dispatch(
            deletePoemAction({
                params: {
                    poemId
                },
                context,
                callbacks: {
                    success: () => {
                        // Refresh the list by fetching page 1 again
                        // todo: check if we should use updateAllPoemsCacheAfterDeletePoemAction here
                        dispatch(
                            getMyPoemsAction({
                                params: {
                                    userId: context.userId,
                                    page: 1,
                                    limit: PAGINATION_LIMIT
                                },
                                options: {
                                    reset: true,
                                    fetch: true
                                }
                            })
                        )
                        // if I delete a poem that's being edited, I need to reset the state
                        context.setState({
                            ...context,
                            elementToEdit: ''
                        })
                        manageSuccess('Poem deleted')
                    },
                    error: () => {
                        manageError('Sorry. There was an error deleting the poem')
                    }
                }
            })
        )
    }

    const LIKE = 'Like'
    const LIKES = 'Likes'
    const READ_MORE = 'Leer más'

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
                        variant="standard"
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
                <main key={poem.id} className='poem__detail'>
                    {poem.author?.includes(filter) && (
                        <section className='poem__block'>
                            <section>
                                <Link to={`/detail/${poem.id}`} className='poem__title'>
                                    {poem.title}
                                </Link>
                                <p className='poem__author'>{poem?.author}</p>
                                <div className='poem__date'>{format(new Date(poem.date), "MM/dd/yyyy HH:mm'h'")}</div>
                            </section>
                            <section>
                                <div className='poem__content poems__content'>{poem.poem}</div>
                                <div className='poems__read-more'>
                                    <Link to={`/detail/${poem.id}`} className='poems__read-more'>
                                        {READ_MORE}
                                    </Link>
                                </div>
                            </section>
                            <section className='poem__footer'>
                                {poem.likes.length === 1 && (
                                    <div className='poem__likes'>
                                        {poem.likes.length} {LIKE}
                                    </div>
                                )}
                                {poem.likes.length !== 1 && (
                                    <div className='poem__likes'>
                                        {poem.likes.length} {LIKES}
                                    </div>
                                )}
                                <div className='separator' />
                                {context.user &&
                                    (poem.author === context?.username || context.userId === context.adminId) && (
                                        <EditIcon className='poem__edit-icon' onClick={() => editPoem(poem.id)} />
                                    )}
                                {context.user && poem.author === context?.username && (
                                    <HighlightOffSharpIcon
                                        className='poem__delete-icon'
                                        style={{
                                            fill: 'red'
                                        }}
                                        onClick={event => onDelete(event, poem.id)}
                                    />
                                )}
                                <Link to={`/detail/${poem.id}`} className='poem__comments-icon'>
                                    <SubjectSharpIcon
                                        style={{
                                            fill: '#000'
                                        }}
                                    />
                                </Link>
                            </section>
                        </section>
                    )}
                </main>
            ))}
            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} style={{ height: '20px' }} />
            {myPoemsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}
export default MyPoems
