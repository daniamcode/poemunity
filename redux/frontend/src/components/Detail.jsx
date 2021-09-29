import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Detail.scss'
import '../App.scss'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import { useAuth0 } from '@auth0/auth0-react'
import Disqus from 'disqus-react'
import CircularProgress from './CircularIndeterminate'
import './PageNotFound.scss'
import { Helmet } from 'react-helmet'
import { LIKE, LIKES } from '../data/constants'
import usePoem from '../react-query/usePoem'
import useDeletePoem from '../react-query/useDeletePoem'
import useLikePoem from '../react-query/useLikePoem'

const { REACT_APP_ADMIN } = process.env

function Detail (props) {
  const { user, isAuthenticated, isLoading } = useAuth0()
  const [poem, setPoem] = useState([])

  const poemsQuery = usePoem(props.match.params.poemId)

  useEffect(()=> {
    if(poemsQuery.data) {
      setPoem(poemsQuery.data)
    }
  }, [JSON.stringify(poemsQuery.data)])

  const deletePoemMutation = useDeletePoem()
  const likePoemMutation = useLikePoem()

  function onLike (event, poemId, userId) {
    event.preventDefault()
    likePoemMutation.mutate({poemId, userId})
  }

  if (isLoading) {
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
      {!poem && (
        <main className='page-not-found__container'>
          <section className='page-not-found__message'>
            <h1 className='page-not-found__title'>Error - 404</h1>
            <p className='page-not-found__text'>Nothing to see here</p>
            <Link className='page-not-found__link' to='/'>
              Back to Dashboard
            </Link>
          </section>
        </main>
      )}
      {poem && poem.likes && (
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
              <div className='poem__date'>{poem.date}</div>
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
              {isAuthenticated &&
                poem.author !== user.name &&
                poem.likes.some((id) => id === user.sub) && (
                  <Link
                    className='poem__likes-icon'
                    onClick={(event) => onLike(event, poem._id, user.sub)}
                  />
              )}
              {isAuthenticated &&
                poem.author !== user.name &&
                !poem.likes.some((id) => id === user.sub) && (
                  <Link
                    className='poem__unlikes-icon'
                    onClick={(event) => onLike(event, poem._id, user.sub)}
                  />
              )}
              {isAuthenticated &&
                (poem.author === user.name || user.sub === REACT_APP_ADMIN) && (
                  <HighlightOffSharpIcon
                    className='poem__delete-icon'
                    style={{ fill: 'red' }}
                    onClick={(event) => deletePoemMutation.mutate(poem._id)}
                  />
              )}
              <Link to={`/detail/${poem._id}`} className='poem__comments-icon'>
                <SubjectSharpIcon style={{ fill: '#000' }} />
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
