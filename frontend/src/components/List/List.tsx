import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../App'
import '../List/List.scss'
import '../Detail/Detail.scss'
import '../../App.scss'
import { TextField } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import CircularProgress from '../CircularIndeterminate'
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter'
import sortPoems from '../../utils/sortPoems'
import { Helmet } from 'react-helmet'
import {
    SEARCH_PLACEHOLDER,
    ORDER_BY,
    ORDER_BY_DATE,
    ORDER_BY_LIKES,
    ORDER_BY_RANDOM,
    ORDER_BY_TITLE,
    CATEGORIES_TITLE_LABEL,
    PAGINATION_LIMIT
} from '../../data/constants'
import normalizeString from '../../utils/normalizeString'
import { addQueryParam, useFiltersFromQuery } from '../../utils/urlUtils'
// import { strings, arrays, dom, objects } from '@daniamcode/utils'
import ListItem from '../ListItem/ListItem'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../redux/store'
import { getPoemsListAction } from '../../redux/actions/poemsActions'
import { Poem } from '../../typescript/interfaces'
import { RouteComponentProps } from 'react-router-dom'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'

interface MatchParams {
    genre?: string
}

function List(props: Partial<RouteComponentProps<MatchParams>>) {
    interface ListStates {
        poems: Poem[]
        filter: string
    }
    const genre = props?.match?.params?.genre
    const [poems, setPoems] = useState<ListStates['poems']>([])

    const [filter, setFilter] = useState<ListStates['filter']>('')

    const [paramsData, setParamsData] = useFiltersFromQuery({
        orderBy: '',
        origin: 'all'
    })

    const context = useContext(AppContext)

    // Redux
    const dispatch = useAppDispatch()

    const { poemsListQuery } = useSelector((state: RootState) => state)

    useEffect(() => {
        const queryOptions = {
            reset: true,
            fetch: false
        }
        dispatch(
            getPoemsListAction({
                options: queryOptions
            })
        )
    }, [dispatch])

    useEffect(() => {
        function handleLoadPoems() {
            if (paramsData.origin) {
                const queryOptions = {
                    reset: true,
                    fetch: true
                }
                dispatch(
                    getPoemsListAction({
                        params: {
                            page: 1,
                            limit: PAGINATION_LIMIT,
                            ...(paramsData.origin !== 'all' && { origin: paramsData.origin })
                        },
                        options: queryOptions
                    })
                )
            }
        }
        handleLoadPoems()
    }, [JSON.stringify(paramsData.origin), dispatch])

    useEffect(() => {
        if (poemsListQuery && poemsListQuery.item && poemsListQuery.item.length > 0) {
            const newData = [...poemsListQuery.item]

            if (genre) {
                const poemsFiltered = newData.filter(poems => poems.genre === genre)
                const poemsSorted = sortPoems(paramsData.orderBy, poemsFiltered)
                setPoems(poemsSorted)
            } else {
                const poemsSorted = sortPoems(paramsData.orderBy, newData)
                setPoems(poemsSorted)
            }
        }
    }, [JSON.stringify([poemsListQuery, genre, paramsData])])

    const handleLoadMore = () => {
        if (!poemsListQuery.isFetching && poemsListQuery.hasMore) {
            const nextPage = (poemsListQuery.page || 0) + 1
            dispatch(
                getPoemsListAction({
                    params: {
                        page: nextPage,
                        limit: PAGINATION_LIMIT,
                        ...(paramsData.origin !== 'all' && { origin: paramsData.origin })
                    },
                    options: {
                        fetch: true,
                        reset: false
                    }
                })
            )
        }
    }

    const sentinelRef = useInfiniteScroll({
        onLoadMore: handleLoadMore,
        hasMore: poemsListQuery.hasMore || false,
        isLoading: poemsListQuery.isFetching
    })

    const handleOrderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        addQueryParam({
            id: 'orderBy',
            value: event.target.value
        })
        setParamsData({
            ...paramsData,
            orderBy: event.target.value
        })
    }

    const handleOriginChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        addQueryParam({
            id: 'origin',
            value: event.target.value
        })
        setParamsData({
            ...paramsData,
            origin: event.target.value
        })
    }

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFilter(normalizeString(event.target.value))
    }

    // Show full page loader only on initial load (no poems yet)
    if (poemsListQuery?.isFetching && (!poemsListQuery?.item || poemsListQuery?.item?.length === 0)) {
        return <CircularProgress />
    }

    return (
        <>
            <Helmet>
                <title>{genre ? `${capitalizeFirstLetter(genre)} poems` : 'Poemunity'}</title>
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
                        <SearchIcon
                            style={{
                                fontSize: 40,
                                fill: '#4F5D73'
                            }}
                        />
                        <TextField
                            variant="standard"
                            label={SEARCH_PLACEHOLDER}
                            InputLabelProps={{
                                style: {
                                    color: '#4F5D73'
                                }
                            }}
                            InputProps={{
                                style: {
                                    color: '#4F5D73'
                                }
                            }}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <form className='list__sort'>
                        <label>
                            Authors:
                            <select id='origin' name='origin' onChange={handleOriginChange}>
                                <option value='all' selected={paramsData.origin === 'all'}>
                                    All
                                </option>
                                <option value='famous' selected={paramsData.origin === 'famous'}>
                                    Famous
                                </option>
                                <option value='user' selected={paramsData.origin === 'user'}>
                                    Users
                                </option>
                            </select>
                        </label>
                    </form>
                    <form className='list__sort'>
                        <label>
                            {ORDER_BY}
                            <select id='sort' name='sort' onChange={handleOrderChange} data-testid='order-select'>
                                <option
                                    value={ORDER_BY_LIKES}
                                    data-testid='select-option'
                                    selected={ORDER_BY_LIKES === paramsData.orderBy}
                                >
                                    {ORDER_BY_LIKES}
                                </option>
                                <option
                                    value={ORDER_BY_DATE}
                                    data-testid='select-option'
                                    selected={ORDER_BY_DATE === paramsData.orderBy}
                                >
                                    {ORDER_BY_DATE}
                                </option>
                                <option
                                    value={ORDER_BY_RANDOM}
                                    data-testid='select-option'
                                    selected={ORDER_BY_RANDOM === paramsData.orderBy}
                                >
                                    {ORDER_BY_RANDOM}
                                </option>
                                <option
                                    value={ORDER_BY_TITLE}
                                    data-testid='select-option'
                                    selected={ORDER_BY_TITLE === paramsData.orderBy}
                                >
                                    {ORDER_BY_TITLE}
                                </option>
                            </select>
                        </label>
                    </form>
                </div>

                {poems.map(poem => (
                    <ListItem key={poem?.id} poem={poem} filter={filter} context={context} />
                ))}

                {poemsListQuery?.isFetching && poemsListQuery?.item && poemsListQuery?.item?.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                        <CircularProgress />
                    </div>
                )}

                <div ref={sentinelRef} style={{ height: '20px' }} />
            </div>
        </>
    )
}
export default List
