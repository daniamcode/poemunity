import React from 'react'
import { useState, useContext, useCallback, useMemo } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import normalizeString from '../../utils/normalizeString'
import { addQueryParam, useFiltersFromQuery } from '../../utils/urlUtils'
import ListItem from '../ListItem/ListItem'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { ListHeader } from './components/ListHeader'
import { usePoemsList, InitialPoemsData } from './hooks/usePoemsList'
import { ORDER_BY_LIKES } from '../../data/constants'

interface ListProps {
    genre?: string
    initialData?: InitialPoemsData
    match?: {
        params?: {
            genre?: string
        }
        [key: string]: unknown
    }
}

function List({ genre: genreProp, initialData, match }: ListProps) {
    const genre = genreProp ?? match?.params?.genre
    const [filter, setFilter] = useState<string>('')

    const [paramsData, setParamsData] = useFiltersFromQuery({
        orderBy: ORDER_BY_LIKES,
        origin: 'all'
    })

    const context = useContext(AppContext)

    // ListItem is memoized on its `context` prop by reference. The provider hands
    // back a brand-new context object on every auth/profile change, which would
    // otherwise re-render every poem card. ListItem and its like/delete actions
    // only read user, userId, isAdmin and config, so keep the same reference until
    // one of those changes — unrelated updates (e.g. editing a profile picture or
    // bio) no longer re-render the whole list. username/picture are included for
    // Context type-completeness but are intentionally left out of the deps, since
    // ListItem reads author display data from the store, not from context.
    const { user, userId, username, picture, config, isAdmin, setState } = context
    const listItemContext = useMemo(
        () => ({ user, userId, username, picture, config, isAdmin, setState }),
        [user, userId, isAdmin, config, setState]
    )

    // Use custom hook for poems data management
    const { poems, isLoading, isError, hasMore, hasItems, handleLoadMore, retry } = usePoemsList({
        genre,
        origin: paramsData.origin,
        orderBy: paramsData.orderBy,
        initialData
    })

    // Setup infinite scroll.
    // While a client-side search filter is active, freeze pagination: filtered
    // items collapse to null, which would otherwise keep the sentinel on screen
    // and make infinite scroll fetch the entire dataset (a self-inflicted DoS).
    const isFiltering = filter.length > 0
    const sentinelRef = useInfiniteScroll({
        onLoadMore: handleLoadMore,
        hasMore: hasMore && !isFiltering,
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

                {isError && (
                    <div className='list__error' role='alert'>
                        <p>Something went wrong loading the poems.</p>
                        <button onClick={retry}>Try again</button>
                    </div>
                )}

                {!isError && !isLoading && poems.length === 0 && (
                    <div className='list__empty'>
                        <p>No poems found. Try adjusting your filters.</p>
                    </div>
                )}

                {!isError && poems.map(poem => (
                    <ListItem key={poem?.id} poem={poem} filter={filter} context={listItemContext} />
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
