import React, { useEffect, useState, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import usePoems from '../react-query/usePoems'
import useDeletePoem from '../react-query/useDeletePoem'
import useLikePoem from '../react-query/useLikePoem'
import { AppContext } from '../App'
import './List.scss'
import './Detail.scss'
import '../App.scss'
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import HighlightOffSharpIcon from '@material-ui/icons/HighlightOffSharp'
import EditIcon from '@material-ui/icons/Edit'
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
import { addQueryParam, useFiltersFromQuery } from '../utils/urlUtils.js'
import { strings, arrays, dom, objects } from '@daniamcode/utils'
import ListItem from './ListItem'
import { useDispatch, useSelector } from 'react-redux'
import { getPoemsAction } from '../redux/actions/poemActions'

function List (props) {
  const genre = props.match.params.genre
  const [poems, setPoems] = useState([])
  const [filter, setFilter] = useState('')

  const [paramsData, setParamsData] = useFiltersFromQuery({
    orderBy: null,
    origin: 'all'
  })
  
  const history = useHistory()
  const context = useContext(AppContext)

  // Redux
  const dispatch = useDispatch();

  const {
      poemsQuery,
  } = useSelector(state => state);

  useEffect(() => {
      dispatch(getPoemsAction({}))
  }, []);

  useEffect(() => {
    if (poemsQuery && poemsQuery.item && poemsQuery.item.length > 0) {
      const newData = [...poemsQuery.item]

      if (genre) {
        const poemsFiltered = newData.filter((poems) => poems.genre === genre)
        const poemsSorted = sortPoems(paramsData.orderBy, poemsFiltered)
        setPoems(poemsSorted)
      } else {
        const poemsSorted = sortPoems(paramsData.orderBy, newData)
        setPoems(poemsSorted)
      }
    }
  }, [JSON.stringify([poemsQuery, genre, paramsData])])

  const handleOrderChange = (event) => {
    addQueryParam({ id: 'orderBy', value: event.target.value })
    setParamsData({ ...paramsData, orderBy: event.target.value })
  }

  const handleOriginChange = (event) => {
    addQueryParam({ id: 'origin', value: event.target.value })
    setParamsData({ ...paramsData, origin: event.target.value })
  }

  const deletePoemMutation = useDeletePoem()
  const likePoemMutation = useLikePoem()

  const onLike = (event, poemId) => {
    event.preventDefault()
    likePoemMutation.mutate(poemId)
  }

  const editPoem = (poemId) => {
    const newPath = '/profile'
    history.push(newPath)
    context.setState({ ...context, elementToEdit: poemId })
  }

  const handleSearchChange = (event) => {
    setFilter(normalizeString(event.target.value))
  }

  if (poemsQuery.isFetching) {
    console.log('test my first npm package!')
    console.log(strings.isLowercase('Qwerty'))
    console.log(strings.isLowercase('qwerty'))
    console.log(strings.isLowercase('ABC'))
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
              Authors:
              <select
                type='submit'
                id='origin'
                name='origin'
                onChange={handleOriginChange}
              >
                <option value='all' selected={'all' === paramsData.origin}>All</option>
                <option value='famous' selected={'famous' === paramsData.origin}>Famous</option>
                <option value='user' selected={'user' === paramsData.origin}>Users</option>
              </select>
            </label>
          </form>
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

        {poems.map((poem) => (
          <ListItem 
            poem={poem}
            filter={filter}
            context={context}
          />
        ))}
      </div>
    </>
  )
}
export default List
