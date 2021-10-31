import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../App';
import { Link } from 'react-router-dom'
import './Detail.scss'
import '../App.scss'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import EditIcon from '@material-ui/icons/Edit';
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import Disqus from 'disqus-react'
import CircularProgress from './CircularIndeterminate'
import './PageNotFound.scss'
import { Helmet } from 'react-helmet'
import { LIKE, LIKES } from '../data/constants'
import usePoem from '../react-query/usePoem'
import useDeletePoem from '../react-query/useDeletePoem'
import useLikePoem from '../react-query/useLikePoem'
import { useHistory } from "react-router-dom";
import { Poem } from '../typescript/interfaces'
import { FormElement } from '../typescript/types'

function Detail (props: any): JSX.Element {
  const [poem, setPoem] = useState<Poem>({
    id: '',
    title: '',
    picture: '',
    author: '',
    date: '',
    poem: '',
    likes: [],
  })

  const context = useContext(AppContext);

  const poemQuery = usePoem(props.match.params.poemId)

  useEffect(()=> {
    if(poemQuery.data) {
      setPoem(poemQuery.data)
    }
  }, [JSON.stringify(poemQuery.data)])

  const deletePoemMutation: {mutate: Function} = useDeletePoem()
  const likePoemMutation: {mutate: Function} = useLikePoem()

  function onLike (event: any, poemId: string) {
    event.preventDefault()
    likePoemMutation.mutate(poemId)
  }
  
  const history = useHistory();

  const editPoem = (poemId: string) => {
    const newPath = '/profile'
    history.push(newPath);
    context.setState({elementToEdit: poemId})
  }

  if (poemQuery.isLoading) {
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
              {context.user &&
                poem.author !== context.username &&
                poem.likes.some((id) => id === context.username) && (
                  <div
                    className='poem__likes-icon'
                    onClick = {(event) => onLike(event, poem.id)}>
                  </div>
              )}
              {context.user &&
                poem.author !== context.username &&
                !poem.likes.some((id) => id === context.username) && (
                  <div
                    className='poem__unlikes-icon'
                    onClick={(event) => onLike(event, poem.id)}>
                  </div>
              )}
              {context.user &&
                (poem.author === context.username ||
                  context.userId === context.adminId) && (
                    <EditIcon
                    className='poem__edit-icon'
                    onClick={(event) => editPoem(poem.id)}
                    />
              )}
              {context.user &&
                (poem.author === context.username || context.userId === context.adminId) && (
                  <HighlightOffSharpIcon
                    className='poem__delete-icon'
                    style={{ fill: 'red' }}
                    onClick={(event) => deletePoemMutation.mutate(poem.id)}
                  />
              )}
              <Link to={`/detail/${poem.id}`} className='poem__comments-icon'>
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
