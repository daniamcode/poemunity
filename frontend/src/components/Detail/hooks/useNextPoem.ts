import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../../redux/store'
import { getPoemsListAction } from '../../../redux/actions/poemsActions'
import API from '../../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../../data/API_ENDPOINTS'
import {
    selectPoemsListPoems,
    selectMyPoemsPoems,
    selectMyFavouritePoemsPoems,
    selectAuthorPoemsPoems
} from '../../../redux/selectors/poemCacheSelectors'
import { Poem } from '../../../typescript/interfaces'

/** What the reader is browsing by. The buckets of a dimension partition the collection. */
export type NextPoemDimension = 'genre' | 'author'

/** Whether the walk stayed in the current bucket, crossed into the next, or looped. */
export type NextPoemScope = 'same-bucket' | 'next-bucket' | 'wrap'

/** Response shape of GET /api/v1/poem/:poemId/next. */
export interface NextPoemResponse {
    poem: Poem | null
    scope: NextPoemScope | null
}

export interface NextPoemTarget {
    href: string
    scope: NextPoemScope
    dimension: NextPoemDimension
    title: string
    author: string
    genre: string
}

export function poemHref(poem: Poem): string {
    return `/detail/${poem.slug || poem.id}`
}

function toTarget(poem: Poem, scope: NextPoemScope, dimension: NextPoemDimension): NextPoemTarget {
    return {
        href: poemHref(poem),
        scope,
        dimension,
        title: poem.title,
        author: poem.author,
        genre: poem.genre
    }
}

// The list caches, in the order we consult them. The reader can only have come
// from one list, and the ordered id-array of whichever cache holds the current
// poem is exactly the sequence they were reading — filters, sort and any active
// ?q= search included, for free and with zero extra requests.
//
// `dimension` is what that list browses BY, which is what the server needs in
// order to continue the same thread once the cache runs out.
const LIST_CACHES = [
    { key: 'authorPoemsQuery', select: selectAuthorPoemsPoems, dimension: 'author' as const, canLoadMore: false },
    { key: 'poemsListQuery', select: selectPoemsListPoems, dimension: null, canLoadMore: true },
    { key: 'myPoemsQuery', select: selectMyPoemsPoems, dimension: null, canLoadMore: false },
    { key: 'myFavouritePoemsQuery', select: selectMyFavouritePoemsPoems, dimension: null, canLoadMore: false }
] as const

/**
 * Resolve the destination of the "next poem" control.
 *
 * Sources, in priority order:
 *  1. The ordered list cache the reader arrived from, if it holds this poem —
 *     a pure client-side upgrade with no network call, keeping the reader in the
 *     exact sequence they were browsing.
 *  2. The server walk for the dimension that list browses by, fetched only when
 *     the dimension is one SSR could not have known (see below).
 *  3. `initialNext` — the SSR answer from getServerSideProps, which used the
 *     default `genre` dimension. A failed or absent answer is `null` and the
 *     control renders nothing.
 */
export function useNextPoem(
    currentPoemId: string,
    initialNext?: NextPoemResponse | null
): NextPoemTarget | null {
    const dispatch = useAppDispatch()

    const listContextParams = useSelector((state: RootState) => state.listContextQuery?.params)
    const poemsListMeta = useSelector((state: RootState) => state.poemsListQuery)
    const myPoems = useSelector(selectMyPoemsPoems)
    const myFavouritePoems = useSelector(selectMyFavouritePoemsPoems)
    const authorPoems = useSelector(selectAuthorPoemsPoems)
    const poemsList = useSelector(selectPoemsListPoems)

    const resolved: Record<string, Poem[]> = useMemo(
        () => ({
            poemsListQuery: poemsList,
            myPoemsQuery: myPoems,
            myFavouritePoemsQuery: myFavouritePoems,
            authorPoemsQuery: authorPoems
        }),
        [poemsList, myPoems, myFavouritePoems, authorPoems]
    )

    // Which cache (if any) holds the current poem, and where in it.
    const hit = useMemo(() => {
        if (!currentPoemId) return null
        for (const cache of LIST_CACHES) {
            const poems = resolved[cache.key] || []
            const index = poems.findIndex(poem => poem?.id === currentPoemId)
            if (index !== -1) return { cache, poems, index }
        }
        return null
    }, [currentPoemId, resolved])

    // The dimension the reader is browsing by. An author page browses by author;
    // a genre list or a search browses by genre. Anything else (the unfiltered
    // dashboard, My Poems, a direct link) has no dimension, and the server's
    // `genre` default applies.
    const dimension: NextPoemDimension | null = useMemo(() => {
        if (hit?.cache.dimension) return hit.cache.dimension
        if (listContextParams?.genre) return 'genre'
        return null
    }, [hit, listContextParams])

    const isAtTail = Boolean(hit) && hit!.index === hit!.poems.length - 1
    const shouldLoadMore = Boolean(
        isAtTail &&
        hit!.cache.canLoadMore &&
        poemsListMeta?.hasMore &&
        !poemsListMeta?.isFetching &&
        listContextParams
    )

    // Reaching the tail of the cached list is exactly the moment infinite scroll
    // would have fetched the next page, so take the same path. The cache grows,
    // this hook re-runs, and the href upgrades to the real neighbour. Until then
    // the server answer stands, so the control is never dead in the meantime.
    useEffect(() => {
        if (!shouldLoadMore) return
        dispatch(
            getPoemsListAction({
                params: { ...listContextParams, page: (poemsListMeta?.page || 0) + 1 },
                options: { fetch: true, reset: false }
            })
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldLoadMore, dispatch])

    // SSR fetched /next with no dimension, i.e. the `genre` default. That is
    // already the right answer for every genre-dimension reader, so the ONLY
    // case worth a client round-trip is `author` — which SSR cannot know about,
    // since browsing context is client state and never travels in the URL.
    const [authorNext, setAuthorNext] = useState<NextPoemResponse | null>(null)
    const needsAuthorWalk = dimension === 'author' && Boolean(currentPoemId)

    useEffect(() => {
        if (!needsAuthorWalk) {
            setAuthorNext(null)
            return
        }
        const controller = new AbortController()
        let active = true
        API()
            .get(`${API_ENDPOINTS.POEM}/${currentPoemId}/next`, {
                params: { dimension: 'author' },
                signal: controller.signal
            })
            .then(response => {
                if (active) setAuthorNext(response.data)
            })
            // A failed walk is not an error state — the SSR answer still stands.
            .catch(() => undefined)
        return () => {
            active = false
            controller.abort()
        }
    }, [needsAuthorWalk, currentPoemId])

    return useMemo(() => {
        // The server default is genre, so that is the label's default too.
        const effectiveDimension: NextPoemDimension = dimension || 'genre'

        if (hit && hit.index < hit.poems.length - 1) {
            const neighbour = hit.poems[hit.index + 1]
            if (neighbour?.id) {
                // Continuing the reader's own sequence — the same thread, so the
                // same label as staying inside a bucket.
                return toTarget(neighbour, 'same-bucket', effectiveDimension)
            }
        }

        const server = (needsAuthorWalk && authorNext) || initialNext
        if (server?.poem && server.scope) {
            return toTarget(server.poem, server.scope, effectiveDimension)
        }

        return null
    }, [hit, dimension, needsAuthorWalk, authorNext, initialNext])
}
