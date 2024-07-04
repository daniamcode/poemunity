import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../App'
import { Link } from 'react-router-dom'
import './Detail.scss'
import '../App.scss'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import EditIcon from '@material-ui/icons/Edit'
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import Disqus from 'disqus-react'
import CircularProgress from './CircularIndeterminate'
import './PageNotFound.scss'
import { Helmet } from 'react-helmet'
import { LIKE, LIKES } from '../data/constants'
import { useHistory } from 'react-router-dom'
import { Poem } from '../typescript/interfaces'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../redux/store'
import {
    deletePoemAction,
    getPoemAction,
    likePoemAction,
    updatePoemCacheAfterLikePoemAction
} from '../redux/actions/poemActions'
import {
    updateAllPoemsCacheAfterLikePoemAction,
    updatePoemsListCacheAfterLikePoemAction,
    updateRankingCacheAfterLikePoemAction
} from '../redux/actions/poemsActions'
import { manageError, manageSuccess } from '../utils/notifications'
import { format } from 'date-fns'

interface Props {
  match: {
    params: {
      poemId: string
    }
  }
}

function Detail(props: Props) {
    const [poem, setPoem] = useState<Poem>({
        id: '',
        author: '',
        date: '',
        genre: '',
        likes: [],
        picture: '',
        poem: '',
        title: '',
        userId: ''
    })

    // Redux
    const dispatch = useAppDispatch()

    const poemQuery = useSelector((state: RootState) => state.poemQuery)

    useEffect(() => {
        const queryOptions = {
            reset: true,
            fetch: false
        }
        dispatch(
            getPoemAction({
                options: queryOptions
            })
        )
    }, [])

    function handleLoadPoem() {
        if (props.match.params.poemId) {
            const queryOptions = {
                reset: true,
                fetch: true
            }
            dispatch(
                getPoemAction({
                    params: props.match.params,
                    options: queryOptions
                })
            )
        }
    }

    useEffect(() => {
        handleLoadPoem()
    }, [JSON.stringify(props.match.params.poemId)])

    const context = useContext(AppContext)
    const history = useHistory()

    useEffect(() => {
        if (poemQuery?.item) {
            setPoem(poemQuery?.item)
        }
    }, [JSON.stringify(poemQuery?.item)])

    function onLike(event: React.SyntheticEvent, poemId: string) {
        event.preventDefault()
        dispatch(
            likePoemAction({
                params: {
                    poemId: props.match.params.poemId
                },
                context,
                callbacks: {
                    success: () => {
                        // todo: when I update this cache, it has effects on many queries.
                        // Maybe I need some optimization, in the frontend or in the backend
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

    function onDelete(event: React.SyntheticEvent, poemId: string) {
        event.preventDefault()
        dispatch(
            deletePoemAction({
                params: {
                    poemId
                },
                context,
                callbacks: {
                    success: () => {
                        const newPath = '/'
                        history.push(newPath)
                        manageSuccess('Poem deleted')
                    },
                    error: () => {
                        manageError('Sorry. There was an error deleting the poem')
                    }
                }
            })
        )
    }

    const editPoem = (poemId: string) => {
        const newPath = '/profile'
        history.push(newPath)
        context.setState({
            ...context,
            elementToEdit: poemId
        })
    }

    if (poemQuery.isFetching) {
        return <CircularProgress />
    }

    const disqusShortname = 'poemunity'
    const disqusConfig = {
        url: `http://localhost:3000/detail/${props.match.params.poemId}`,
        identifier: `http://localhost:3000/detail/${props.match.params.poemId}`,
        title: 'Title of Your Article'
    }

    return (
        <>
            {!poem.id
                ? (
                    <main className='page-not-found__container'>
                        <section className='page-not-found__message'>
                            <h1 className='page-not-found__title'>Error - 404</h1>
                            <p className='page-not-found__text'>Nothing to see here</p>
                            <Link className='page-not-found__link' to='/'>
              Back to Dashboard
                            </Link>
                        </section>
                    </main>
                )
                : (
                    <main className='poem__detail'>
                        <Helmet>
                            <title>{`Poem: ${poem.title}`}</title>
                        </Helmet>
                        <section className='poem__block'>
                            <section>
                                <h2 className='poem__title'>{poem.title}</h2>
                                <div className='poem__author-container'>
                                    <img className='poem__picture' src={poem.picture} />
                                    <p className='poem__author'>{poem.author}</p>
                                </div>
                                <div className='poem__date'>
                                    {format(new Date(poem.date), 'MM/dd/yyyy HH:mm\'h\'')}
                                </div>
                            </section>
                            <section>
                                <div className='poem__content'>{poem.poem}</div>
                            </section>
                            <br />
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
                poem.userId !== context.userId &&
                poem.likes.some(id => id === context.userId) && (
                                    <div
                                        className='poem__likes-icon'
                                        onClick={(event: React.SyntheticEvent) =>
                                            onLike(event, poem.id)
                                        }
                                    ></div>
                                )}
                                {context.user &&
                poem.userId !== context.userId &&
                !poem.likes.some(id => id === context.userId) && (
                                    <div
                                        className='poem__unlikes-icon'
                                        onClick={(event: React.SyntheticEvent) =>
                                            onLike(event, poem.id)
                                        }
                                    ></div>
                                )}
                                {context.user &&
                (poem.userId === context.userId ||
                  context.userId === context.adminId) && (
                                    <EditIcon
                                        className='poem__edit-icon'
                                        onClick={() => editPoem(poem.id)}
                                    />
                                )}
                                {context.user &&
                (poem.userId === context.userId ||
                  context.userId === context.adminId) && (
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
                        <div className='article-container'>
                            <Disqus.DiscussionEmbed
                                shortname={disqusShortname}
                                config={disqusConfig}
                            />
                        </div>
                    </main>
                )}
        </>
    )
}

export default Detail
