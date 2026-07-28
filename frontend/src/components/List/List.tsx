import React from 'react'
import { useContext, useCallback, useMemo } from 'react'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { addQueryParam, useFiltersFromQuery } from '../../utils/urlUtils'
import ListItem from '../ListItem/ListItem'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useSearchQuery } from '../../hooks/useSearchQuery'
import { ListHeader } from './components/ListHeader'
import { usePoemsList, InitialPoemsData } from './hooks/usePoemsList'
import { ORDER_BY_LIKES, SEARCH_NO_RESULTS } from '../../data/constants'

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
    const { input: searchInput, q, nextSignal, onSearchChange } = useSearchQuery()

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
        initialData,
        q,
        nextSignal
    })

    // Infinite scroll works normally during a search now. It used to be frozen
    // while filtering, because filtering happened client-side: non-matching
    // items rendered as null, so the sentinel stayed on screen and paging kept
    // firing until the whole dataset was fetched. With the server doing the
    // search, a page of results is a page of matches and hasMore is accurate.
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

    // Full-page loader only on the very first load. During a search the header
    // must stay mounted, or the input unmounts mid-query and the user loses
    // focus and their caret on every keystroke.
    if (isLoading && !hasItems && !q) {
        return <CircularProgress />
    }

    return (
        <>
            <div className='list__container'>
                <ListHeader
                    genre={genre}
                    origin={paramsData.origin}
                    orderBy={paramsData.orderBy}
                    searchValue={searchInput}
                    resultCount={isLoading ? undefined : poems.length}
                    onSearchChange={onSearchChange}
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
                        <p>{q ? SEARCH_NO_RESULTS : 'No poems found. Try adjusting your filters.'}</p>
                    </div>
                )}

                {!isError && poems.map(poem => (
                    <ListItem key={poem?.id} poem={poem} context={listItemContext} />
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
