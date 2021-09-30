import React, { useEffect, useState, useContext } from 'react'
import { Link } from 'react-router-dom'
import usePoems from '../react-query/usePoems'
import useDeletePoem from '../react-query/useDeletePoem'
import useLikePoem from '../react-query/useLikePoem'
import { AppContext } from '../App';

import './List.scss'
import './Detail.scss'
import '../App.scss'
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import { useAuth0 } from '@auth0/auth0-react'
import CircularProgress from './CircularIndeterminate'
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter'
import sortPoems from '../utils/sortPoems'
import { Helmet } from 'react-helmet'
import {
  LIKE,
  LIKES,
  READ_MORE,
  SEARCH_PLACEHOLDER,
  ORDER_BY,
  ORDER_BY_DATE,
  ORDER_BY_LIKES,
  ORDER_BY_RANDOM,
  ORDER_BY_TITLE,
  CATEGORIES_TITLE_LABEL
} from '../data/constants'
const { REACT_APP_ADMIN } = process.env

function List (props) {
  const { user, isAuthenticated, isLoading: auth0IsLoading } = useAuth0()
  const genre = props.match.params.genre
  const [poems, setPoems] = useState([])
  const [filter, setFilter] = useState('')
  
  const context = useContext(AppContext);
  const poemsQuery = usePoems()

  useEffect(()=> {
    if(poemsQuery.data) {
      const newData = [...poemsQuery.data]

      if(genre) {
        const poemsFiltered = newData.filter((poems) => poems.genre === genre)
        const poemsSorted = sortPoems(context.sortPoemsBy, poemsFiltered)
        setPoems(poemsSorted)
      }
      else {
        const poemsSorted = sortPoems(context.sortPoemsBy, newData)
        setPoems(poemsSorted)
      }
    }
  }, [JSON.stringify([poemsQuery.data, genre, context.sortPoemsBy])])

  const deletePoemMutation = useDeletePoem()
  const likePoemMutation = useLikePoem()

  function onLike (event, poemId, userId) {
    event.preventDefault()
    likePoemMutation.mutate({poemId, userId})
  }

  const handleSearchChange = (event) => {
    setFilter(event.target.value)
  }

  if (auth0IsLoading || poemsQuery.isLoading) {
    return <CircularProgress />
  }

  return (
    <>
      <Helmet>
        <title>
          {genre ? `${capitalizeFirstLetter(genre)} poems` : 'Poemunity'}
        </title>
      </Helmet>
      <div className='list__container'>
        <div className='list__intro'>
          {genre && (
            <p className='list__presentation'>
              {CATEGORIES_TITLE_LABEL}
              {genre.toUpperCase()}
            </p>
          )}
          <div className='list__search'>
          <div className='separator' />
            <SearchIcon style={{ fontSize: 40, fill: '#4F5D73' }} />
            <TextField
              label={SEARCH_PLACEHOLDER}
              InputLabelProps={{
                style: { color: '#4F5D73' }
              }}
              InputProps={{
                style: { color: '#4F5D73' }
              }}
              onChange={handleSearchChange}
            />
          </div>
          <form className='list__sort'>
            <label>
              {ORDER_BY}
              <select
                type='submit'
                id='sort'
                name='sort'
                onChange={(event) => {
                  context.setState({sortPoemsBy: event.target.value})
                }}
              >
                <option value={ORDER_BY_LIKES}>{ORDER_BY_LIKES}</option>
                <option value={ORDER_BY_DATE}>{ORDER_BY_DATE}</option>
                <option value={ORDER_BY_RANDOM}>{ORDER_BY_RANDOM}</option>
                <option value={ORDER_BY_TITLE}>{ORDER_BY_TITLE}</option>
              </select>
            </label>
          </form>
        </div>

        {poems?.map((poem) => (
          <main key={poem._id} className='poem__detail'>
            {poem.author.includes(filter) && (
              <section className='poem__block'>
                <section>
                  <Link to={`/detail/${poem._id}`} className='poem__title'>
                    {poem.title}
                  </Link>
                  <div className='poem__author-container'>
                    <img className='poem__picture' src={poem.picture} />
                    <p className='poem__author'>{poem.author}</p>
                  </div>
                  <div className='poem__date'>{poem.date}</div>
                </section>
                <section>
                  <div className='poem__content poems__content'>
                    {poem.poem}
                  </div>
                  <div className='poems__read-more'>
                    <Link
                      to={`/detail/${poem._id}`}
                      className='poems__read-more'
                    >
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
                    (poem.author === user.name ||
                      user.sub === REACT_APP_ADMIN) && (
                        <HighlightOffSharpIcon
                          className='poem__delete-icon'
                          style={{ fill: 'red' }}
                          onClick={(event) => deletePoemMutation.mutate(poem._id)}
                        />
                  )}
                  <Link
                    to={`/detail/${poem._id}`}
                    className='poem__comments-icon'
                  >
                    <SubjectSharpIcon style={{ fill: '#000' }} />
                  </Link>
                </section>
              </section>
            )}
          </main>
        ))}
      </div>
    </>
  )
}
export default List