import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePoem } from '../actions/poemActions'
import poemStore from '../stores/poemStore'
import './List.scss'
import './Detail.scss'
import '../App.scss'
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import { useAuth0 } from '@auth0/auth0-react'
import CircularProgress from './CircularIndeterminate'
import usePoems from '../react-query/usePoems'
import getPoemsByUser from '../utils/getPoemsByUser'

function MyPoems (props) {
  const { user, isAuthenticated, isLoading } = useAuth0()

  const [poems, setPoems] = useState([])

  const [filter, setFilter] = useState('')

  // useEffect(() => {
  //   poemStore.addChangeListener(onChange)
  //   if (poems.length === 0) loadPoems()
  //   else {
  //     onChange()
  //   }
  //   return () => poemStore.removeChangeListener(onChange)
  // }, [poems.length])

  const poemsQuery = usePoems()

  useEffect(()=> {
    if(poemsQuery.data) {
      const poemsFiltered = getPoemsByUser(poemsQuery.data, user)
      setPoems(poemsFiltered)
    }
  }, [JSON.stringify([poemsQuery.data, user])])

  // useEffect(()=> {
  //   if(user) {
  //     const poemsFiltered = getPoemsByUser(poems, user)
  //     setPoems(poemsFiltered)
  //   }
  // }, [JSON.stringify(user)])

  function onChange () {
    setPoems(poemStore.getPoemsByUser(user))
  }

  function onDelete (event, poemId) {
    event.preventDefault()
    deletePoem(poemId)
  }

  const LIKE = 'Like'
  const LIKES = 'Likes'
  const READ_MORE = 'Leer más'

  const handleSearchChange = (event) => {
    setFilter(event.target.value)
  }

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <>
      <div className='search__container'>
        <div className='separator' />
        <div className='list__intro'>
          <SearchIcon style={{ fontSize: 40, fill: '#551A8B' }} />
          <TextField
            label='Buscar autor'
            InputLabelProps={{
              style: { color: '#551A8B' }
            }}
            InputProps={{
              style: { color: '#551A8B' }
            }}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      {poems.map((poem) => (
        <main key={poem._id} className='poem__detail'>
          {poem.author.includes(filter) && (
            <section className='poem__block'>
              <section>
                <Link to={`/detail/${poem._id}`} className='poem__title'>
                  {poem.title}
                </Link>
                <p className='poem__author'>{poem.author}</p>
                <div className='poem__date'>{poem.date}</div>
              </section>
              <section>
                <div className='poem__content poems__content'>{poem.poem}</div>
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
                {isAuthenticated && poem.author === user.name && (
                  <HighlightOffSharpIcon
                    className='poem__delete-icon'
                    style={{ fill: 'red' }}
                    onClick={(event) => onDelete(event, poem._id)}
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
    </>
  )
}
export default MyPoems
