import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../App';
import { Link } from 'react-router-dom'
import './List.scss'
import './Detail.scss'
import '../App.scss'
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import EditIcon from '@material-ui/icons/Edit';
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import SubjectSharpIcon from '@material-ui/icons/SubjectSharp'
import CircularProgress from './CircularIndeterminate'
import usePoems from '../react-query/usePoems'
import getPoemsByUser from '../utils/getPoemsByUser'
import useDeletePoem from '../react-query/useDeletePoem'

function MyPoems (props) {
  const [poems, setPoems] = useState([])
  const [filter, setFilter] = useState('')

  const context = useContext(AppContext);
  const poemsQuery = usePoems()

  useEffect(()=> {
    if(poemsQuery.data) {
      const poemsFiltered = getPoemsByUser(poemsQuery.data, context.username)
      setPoems(poemsFiltered)
    }
  }, [JSON.stringify([poemsQuery.data, context.username])])

  const editPoem = (poemId) => {
    context.setState({...context, elementToEdit: poemId})
  }

  const deletePoemMutation = useDeletePoem()

  const LIKE = 'Like'
  const LIKES = 'Likes'
  const READ_MORE = 'Leer más'

  const handleSearchChange = (event) => {
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
        <main key={poem.id} className='poem__detail'>
          {poem.author?.includes(filter) && (
            <section className='poem__block'>
              <section>
                <Link to={`/detail/${poem.id}`} className='poem__title'>
                  {poem.title}
                </Link>
                <p className='poem__author'>{poem?.author}</p>
                <div className='poem__date'>{poem.date}</div>
              </section>
              <section>
                <div className='poem__content poems__content'>{poem.poem}</div>
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
                  (poem.author === context.username ||
                    context.userId === context.adminId) && (
                      <EditIcon
                      className='poem__edit-icon'
                      onClick={(event) => editPoem(poem.id)}
                      />
                )}
                {context.user && poem.author === context.username && (
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
    </>
  )
}
export default MyPoems
