import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../App'
import { Link } from 'react-router-dom'
import '../List/List.scss'
import '../Detail/Detail.scss'
import '../../App.scss'
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import CircularProgress from '../CircularIndeterminate'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import { getMyFavouritePoemsAction } from '../../redux/actions/poemsActions'
import { deletePoemAction, likePoemAction } from '../../redux/actions/poemActions'
import { manageError, manageSuccess } from '../../utils/notifications'
import { format } from 'date-fns'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { PAGINATION_LIMIT } from '../../data/constants'

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
    }, [JSON.stringify(myFavouritePoemsQuery?.item)])

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
                        // todo: check if old used updateAllPoemsCacheAfterDeletePoemAction is needed
                        // instead of getMyFavouritePoemsAction
                        dispatch(
                            getMyFavouritePoemsAction({
                                params: {
                                    likedBy: context.userId,
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

    function onLike(event, poemId) {
        event.preventDefault()
        dispatch(
            likePoemAction({
                params: {
                    poemId
                },
                context,
                callbacks: {
                    success: () => {
                        // Refresh the list since unliking will remove from favorites
                        // todo: understand why i had
                        //     success: () => {
                        //     dispatch(
                        //         updatePoemsListCacheAfterLikePoemAction({
                        //             poemId,
                        //             context
                        //         })
                        //     )
                        //     dispatch(
                        //         updateRankingCacheAfterLikePoemAction({
                        //             poemId,
                        //             context
                        //         })
                        //     )
                        //     dispatch(
                        //         updateAllPoemsCacheAfterLikePoemAction({
                        //             poemId,
                        //             context
                        //         })
                        //     )
                        //     dispatch(
                        //         updatePoemCacheAfterLikePoemAction({
                        //             context
                        //         })
                        //     )
                        // }
                        // and now is enough with just getMyFavouritePoemsAction
                        dispatch(
                            getMyFavouritePoemsAction({
                                params: {
                                    likedBy: context.userId,
                                    page: 1,
                                    limit: PAGINATION_LIMIT
                                },
                                options: {
                                    reset: true,
                                    fetch: true
                                }
                            })
                        )
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

    if (myFavouritePoemsQuery.isFetching && !poems.length) {
        return <CircularProgress />
    }

    return (
        <>
            <div className='search__container'>
                <div className='separator' />
                <div className='list__intro'>
                    <SearchIcon
                        style={{
                            fontSize: 40,
                            fill: '#551A8B'
                        }}
                    />
                    <TextField
                        label='Buscar autor'
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
                    {poem.author.includes(filter) && (
                        <section className='poem__block'>
                            <section>
                                <Link to={`/detail/${poem.id}`} className='poem__title'>
                                    {poem.title}
                                </Link>
                                <div className='poem__author-container'>
                                    <img className='poem__picture' src={poem.picture} />
                                    <p className='poem__author'>{poem.author}</p>
                                </div>
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
                                {context?.user &&
                                    poem.userId !== context?.userId &&
                                    poem.likes.some(id => id === context?.userId) && (
                                        <Link
                                            className='poem__likes-icon'
                                            onClick={event => onLike(event, poem.id)}
                                            to='#' // Add a dummy path. TODO: Remove Link and use a button or Navigate
                                        />
                                    )}
                                {context?.user &&
                                    poem.userId !== context?.userId &&
                                    !poem.likes.some(id => id === context?.userId) && (
                                        <Link
                                            className='poem__unlikes-icon'
                                            onClick={event => onLike(event, poem.id)}
                                        />
                                    )}
                                {context?.user && poem.author === context?.username && (
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
            {myFavouritePoemsQuery.isFetching && poems.length > 0 && <CircularProgress />}
        </>
    )
}
export default MyFavouritePoems
