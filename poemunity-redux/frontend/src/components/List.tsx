import { useEffect, useState, useContext } from 'react'
import { AppContext } from '../App'
import './List.scss'
import './Detail.scss'
import '../App.scss'
import { TextField } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import CircularProgress from './CircularIndeterminate'
import capitalizeFirstLetter from '../utils/capitalizeFirstLetter'
import sortPoems from '../utils/sortPoems'
import { Helmet } from 'react-helmet'
import {
  SEARCH_PLACEHOLDER,
  ORDER_BY,
  ORDER_BY_DATE,
  ORDER_BY_LIKES,
  ORDER_BY_RANDOM,
  ORDER_BY_TITLE,
  CATEGORIES_TITLE_LABEL
} from '../data/constants'
import normalizeString from '../utils/normalizeString'
import { addQueryParam, useFiltersFromQuery } from '../utils/urlUtils'
// import { strings, arrays, dom, objects } from '@daniamcode/utils'
import ListItem from './ListItem'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../redux/store'
import { getPoemsListAction } from '../redux/actions/poemsActions'
import { Poem } from '../typescript/interfaces'



interface ListProps {
  match: {
    params: {
      genre: string
    }
  }
}

function List (props: ListProps) {
  interface ListStates {
    poems: Poem[]
    filter: string
  }
  const genre = props.match.params.genre
  const [poems, setPoems] = useState<ListStates["poems"]>([])
  const [filter, setFilter] = useState<ListStates["filter"]>('')

  const [paramsData, setParamsData] = useFiltersFromQuery({
    orderBy: '',
    origin: 'all'
  })
  
  const context = useContext(AppContext)

  // Redux
  const dispatch = useAppDispatch();

  const {
      poemsListQuery
  } = useSelector((state: RootState) => state)

  useEffect(() => {
    const queryOptions = {
        reset: true,
        fetch: false,
    };
    dispatch(getPoemsListAction({
        options: queryOptions,
        params: {}
    }));
  }, []);

  function handleLoadPoems() {
      if (paramsData.origin) {
          const queryOptions = {
              reset: true,
              fetch: true,
          };
          dispatch(getPoemsListAction({
              params: paramsData.origin !== 'all' ? {origin: paramsData.origin} : null,
              options: queryOptions,
          }));
      }
  }

  useEffect(() => {
      handleLoadPoems();
  }, [JSON.stringify(paramsData.origin)]);

  useEffect(() => {
    if (poemsListQuery && poemsListQuery.item && poemsListQuery.item.length > 0) {
      const newData = [...poemsListQuery.item]

      if (genre) {
        const poemsFiltered = newData.filter((poems) => poems.genre === genre)
        const poemsSorted = sortPoems(paramsData.orderBy, poemsFiltered)
        setPoems(poemsSorted)
      } else {
        const poemsSorted = sortPoems(paramsData.orderBy, newData)
        setPoems(poemsSorted)
      }
    }
  }, [JSON.stringify([poemsListQuery, genre, paramsData])])

  const handleOrderChange = (event:React.ChangeEvent<HTMLSelectElement>) => {
    addQueryParam({ id: 'orderBy', value: event.target.value })
    setParamsData({ ...paramsData, orderBy: event.target.value })
  }

  const handleOriginChange = (event:React.ChangeEvent<HTMLSelectElement>) => {
    addQueryParam({ id: 'origin', value: event.target.value })
    setParamsData({ ...paramsData, origin: event.target.value })
  }

  const handleSearchChange = (event:React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFilter(normalizeString(event.target.value))
  }

  if (poemsListQuery?.isFetching) {
    // console.log('test my first npm package!')
    // console.log(strings.isLowercase('Qwerty'))
    // console.log(strings.isLowercase('qwerty'))
    // console.log(strings.isLowercase('ABC'))
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
