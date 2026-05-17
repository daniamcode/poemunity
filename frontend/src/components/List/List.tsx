import React from 'react'
import { useState, useContext, useCallback } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import normalizeString from '../../utils/normalizeString'
import { addQueryParam, useFiltersFromQuery } from '../../utils/urlUtils'
import ListItem from '../ListItem/ListItem'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { ListHeader } from './components/ListHeader'
import { usePoemsList, InitialPoemsData } from './hooks/usePoemsList'

interface ListProps {
    genre?: string
    initialData?: InitialPoemsData
}

function List({ genre, initialData }: ListProps) {
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
        orderBy: paramsData.orderBy,
        initialData
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
        setParamsData((prev: any) => ({ ...prev, orderBy: value }))
    }, [])

    const handleOriginChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value
        addQueryParam({ id: 'origin', value })
        setParamsData((prev: any) => ({ ...prev, origin: value }))
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
