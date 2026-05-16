import React from 'react'
import { useState, useContext, useCallback } from 'react'
import { AppContext } from '../../App'
import './List.scss'
import '../Detail/Detail.scss'
import '../../App.scss'
import CircularProgress from '../CircularIndeterminate'
import { Helmet } from 'react-helmet'
import capitalizeFirstLetter from '../../utils/capitalizeFirstLetter'
import normalizeString from '../../utils/normalizeString'
import { addQueryParam, useFiltersFromQuery } from '../../utils/urlUtils'
import ListItem from '../ListItem/ListItem'
import { RouteComponentProps } from 'react-router-dom'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { ListHeader } from './components/ListHeader'
import { usePoemsList } from './hooks/usePoemsList'

interface MatchParams {
    genre?: string
}

function List(props: Partial<RouteComponentProps<MatchParams>>) {
    const genre = props?.match?.params?.genre
    const [filter, setFilter] = useState<string>('')

    const [paramsData, setParamsData] = useFiltersFromQuery({
        orderBy: '',
        origin: 'all'
    })

    const context = useContext(AppContext)

    // Use custom hook for poems data management
    const { poems, isLoading, hasMore, hasItems, handleLoadMore } = usePoemsList({
        genre,
        origin: paramsData.origin,
        orderBy: paramsData.orderBy
    })

    // Setup infinite scroll
    const sentinelRef = useInfiniteScroll({
        onLoadMore: handleLoadMore,
        hasMore,
        isLoading
    })

    const handleOrderChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        addQueryParam({ id: 'orderBy', value })
        setParamsData(prev => ({ ...prev, orderBy: value }))
    }, [])

    const handleOriginChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        addQueryParam({ id: 'origin', value })
        setParamsData(prev => ({ ...prev, origin: value }))
    }, [])

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFilter(normalizeString(event.target.value))
    }, [])

    // Show full page loader only on initial load (no poems yet)
    if (isLoading && !hasItems) {
        return <CircularProgress />
    }

    return (
        <>
            <Helmet>
                <title>{genre ? `${capitalizeFirstLetter(genre)} poems` : 'Poemunity'}</title>
            </Helmet>
            <div className='list__container'>
                <ListHeader
                    genre={genre}
                    origin={paramsData.origin}
                    orderBy={paramsData.orderBy}
                    onSearchChange={handleSearchChange}
                    onOriginChange={handleOriginChange}
                    onOrderChange={handleOrderChange}
                />

                {poems.map(poem => (
                    <ListItem key={poem?.id} poem={poem} filter={filter} context={context} />
                ))}

                {isLoading && hasItems && (
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
