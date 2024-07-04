import React, { useEffect, useState, useContext } from 'react'
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
import getFavouritePoemsByUser from '../../utils/getFavouritePoemsByUser'
import parseJWT from '../../utils/parseJWT'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../redux/store'
import {
    getAllPoemsAction,
    updateAllPoemsCacheAfterDeletePoemAction,
    updateAllPoemsCacheAfterLikePoemAction,
    updatePoemsListCacheAfterLikePoemAction,
    updateRankingCacheAfterLikePoemAction
} from '../../redux/actions/poemsActions'
import { deletePoemAction, likePoemAction, updatePoemCacheAfterLikePoemAction } from '../../redux/actions/poemActions'
import { manageError, manageSuccess } from '../../utils/notifications'
import { format } from 'date-fns'

function MyFavouritePoems(props) {
    const context = useContext(AppContext)

    const [poems, setPoems] = useState([])
    const [filter, setFilter] = useState('')

    // Redux
    const dispatch = useAppDispatch()

    const { allPoemsQuery } = useSelector(state => state)

    useEffect(() => {
        dispatch(getAllPoemsAction({}))
    }, [])

    useEffect(() => {
        if (allPoemsQuery.item) {
            const poemsFiltered = getFavouritePoemsByUser(allPoemsQuery.item, context?.userId)
            setPoems(poemsFiltered)
        }
    }, [JSON.stringify([allPoemsQuery.item, context?.username])])

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
                        dispatch(
                            updateAllPoemsCacheAfterDeletePoemAction({
                                poemId
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
                        dispatch(
                            updatePoemsListCacheAfterLikePoemAction({
                                poemId,
                                context
                            })
                        )
                        dispatch(
                            updateRankingCacheAfterLikePoemAction({
                                poemId,
                                context
                            })
                        )
                        dispatch(
                            updateAllPoemsCacheAfterLikePoemAction({
                                poemId,
                                context
                            })
                        )
                        dispatch(
                            updatePoemCacheAfterLikePoemAction({
                                context
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

    // if (isLoading) {
    //   return <CircularProgress />
    // }

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
                                <div className='poem__date'>{format(new Date(poem.date), 'MM/dd/yyyy HH:mm\'h\'')}</div>
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
        </>
    )
}
export default MyFavouritePoems
