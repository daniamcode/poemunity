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
import EditIcon from '@material-ui/icons/Edit';
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
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
import normalizeString from '../utils/normalizeString'
import { useHistory } from "react-router-dom";
import { addQueryParam, useFiltersFromQuery } from '../utils/urlUtils.js'

function List (props) {
  const genre = props.match.params.genre
  const [poems, setPoems] = useState([])
  const [filter, setFilter] = useState('')
  
  const history = useHistory();
  const context = useContext(AppContext);
  const poemsQuery = usePoems()

  console.log(poemsQuery)

  const [paramsData, setParamsData] = useFiltersFromQuery({
    orderBy: null
  })

  useEffect(()=> {
    if(poemsQuery.data) {
      const newData = [...poemsQuery.data]
      
      if(genre) {
        const poemsFiltered = newData.filter((poems) => poems.genre === genre)
        const poemsSorted = sortPoems(paramsData.orderBy, poemsFiltered)
        setPoems(poemsSorted)
      }
      else {
        const poemsSorted = sortPoems(paramsData.orderBy, newData)
        setPoems(poemsSorted)
      }
    }
  }, [JSON.stringify([poemsQuery.data, genre, paramsData])])
  

  const handleOrderChange = (event) => {
    addQueryParam({id: 'orderBy', value: event.target.value})
    setParamsData({orderBy: event.target.value})
  }

  const deletePoemMutation = useDeletePoem()
  const likePoemMutation = useLikePoem()

  const onLike = (event, poemId) => {
    event.preventDefault()
    likePoemMutation.mutate(poemId)
  }


  const editPoem = (poemId) => {
    const newPath = '/profile'
    history.push(newPath);
    context.setState({elementToEdit: poemId})
  }

  const handleSearchChange = (event) => {
    setFilter(normalizeString(event.target.value))
  }

  if (poemsQuery.isLoading) {
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
                onChange={handleOrderChange}
              >
                <option value={ORDER_BY_LIKES} selected={ORDER_BY_LIKES === paramsData.orderBy}>{ORDER_BY_LIKES}</option>
                <option value={ORDER_BY_DATE} selected={ORDER_BY_DATE === paramsData.orderBy}>{ORDER_BY_DATE}</option>
                <option value={ORDER_BY_RANDOM} selected={ORDER_BY_RANDOM === paramsData.orderBy}>{ORDER_BY_RANDOM}</option>
                <option value={ORDER_BY_TITLE} selected={ORDER_BY_TITLE === paramsData.orderBy}>{ORDER_BY_TITLE}</option>
              </select>
            </label>
          </form>
        </div>

        {poems?.map((poem) => (
          <main key={poem.id} className='poem__detail'>
            {normalizeString(poem.author).includes(filter) && (
              <section className='poem__block'>
                <section>
                  <Link to={`/detail/${poem.id}`} className='poem__title'>
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
                      to={`/detail/${poem.id}`}
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
                  {context.user &&
                    poem.author !== context.username &&
                    poem.likes.some((id) => id === context.username) && (
                      <Link
                        className='poem__likes-icon'
                        onClick={(event) => onLike(event, poem.id)}
                      />
                  )}
                  {context.user &&
                    poem.author !== context.username &&
                    !poem.likes.some((id) => id === context.username) && (
                      <Link
                        className='poem__unlikes-icon'
                        onClick={(event) => onLike(event, poem.id)}
                      />
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
                    (poem.author === context.username ||
                      context.userId === context.adminId) && (
                        <HighlightOffSharpIcon
                          className='poem__delete-icon'
                          style={{ fill: 'red' }}
                          onClick={(event) => deletePoemMutation.mutate(poem.id)}
                        />
                  )}
                  <Link
                    to={`/detail/${poem.id}`}
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
