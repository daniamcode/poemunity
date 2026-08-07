import React from 'react'
import { useContext, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { AppContext } from '../../App'
import CircularProgress from '../CircularIndeterminate'
import { addQueryParam, useFiltersFromQuery } from '../../utils/urlUtils'
import ListItem from '../ListItem/ListItem'
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll'
import { useSearchQuery } from '../../hooks/useSearchQuery'
import { ListHeader } from './components/ListHeader'
import { usePoemsList, InitialPoemsData } from './hooks/usePoemsList'
import { Pagination } from '../Pagination'
import { pageCount } from '../../utils/pagination'
import { ORDER_BY_LIKES, PAGINATION_LIMIT, slugToCategory, ORIGIN_LABELS } from '../../data/constants'

interface ListProps {
    genre?: string
    initialData?: InitialPoemsData
    /** 1-based page from `?page=`, resolved server-side. */
    currentPage?: number
    match?: {
        params?: {
            genre?: string
        }
        [key: string]: unknown
    }
}

function List({ genre: genreProp, initialData, currentPage = 1, match }: ListProps) {
    const genre = genreProp ?? match?.params?.genre
    const router = useRouter()
    // A "search all poems" link carries the query in ?q= so it survives the
    // navigation off a genre page.
    const queryFromUrl = typeof router.query.q === 'string' ? router.query.q : ''
    const { input: searchInput, q, nextSignal, onSearchChange } = useSearchQuery(queryFromUrl)

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

    // What the current view is scoped to, so an empty result can say WHY it is
    // empty instead of implying the search itself found nothing anywhere.
    const scopes = [
        genre && slugToCategory(genre),
        paramsData.origin !== 'all' && ORIGIN_LABELS[paramsData.origin]
    ].filter(Boolean)
    const isScoped = scopes.length > 0

    const emptyMessage = (() => {
        if (!q) return 'No poems found. Try adjusting your filters.'
        if (!isScoped) return `No poems match “${q}”.`
        return `No poems match “${q}” in ${scopes.join(' · ')}.`
    })()

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
                        <p>{emptyMessage}</p>
                        {/* A search only looks inside the filters that are
                            active, so "no results" on a genre page is easy to
                            read as "search is broken". Name what is scoping it
                            and offer one tap out, keeping the query. */}
                        {q && isScoped && (
                            <Link className='list__empty-action' href={`/?q=${encodeURIComponent(q)}`}>
                                Search all poems for “{q}”
                            </Link>
                        )}
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

                {/* Below the infinite-scroll sentinel, so scrolling reaches
                    more poems before it reaches the nav — the nav is the way to
                    JUMP, and the way a crawler walks the list at all.

                    Built from the SSR total, not the live store one: this
                    describes the URL, and the store's total changes under a
                    search while the URL's page does not. Search results are
                    noindex anyway, and `q` rides along so paging a search stays
                    a search. */}
                <Pagination
                    basePath={genre ? `/${genre}` : '/'}
                    currentPage={currentPage}
                    totalPages={initialData?.totalPages ?? pageCount(initialData?.total ?? 0, PAGINATION_LIMIT)}
                    query={{ q: queryFromUrl || undefined }}
                />
            </div>
        </>
    )
}

export default List
