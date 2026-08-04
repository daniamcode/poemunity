import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../../redux/store'
import { getPoemsListAction } from '../../../redux/actions/poemsActions'
import { getTypes } from '../../../redux/actions/commonActions'
import { ACTIONS } from '../../../redux/reducers/poemsReducers'
import { poemsUpserted } from '../../../redux/reducers/poemEntitiesReducers'
import { selectPoemsListPoems } from '../../../redux/selectors/poemCacheSelectors'
import sortPoems from '../../../utils/sortPoems'
import { ORDER_BY_LIKES, PAGINATION_LIMIT } from '../../../data/constants'
import { Poem } from '../../../typescript/interfaces'

export interface InitialPoemsData {
    poems: Poem[]
    page: number
    hasMore: boolean
    total: number
    totalPages?: number
}

export interface UsePoemsListParams {
    genre?: string
    origin: string
    orderBy: string
    initialData?: InitialPoemsData
    /** Debounced search query, already past the minimum length. '' means none. */
    q?: string
    /** Fresh AbortSignal per fetch, so a superseded request cannot land late. */
    nextSignal?: () => AbortSignal
}

export function usePoemsList({ genre, origin, orderBy, initialData, q = '', nextSignal }: UsePoemsListParams) {
    const dispatch = useAppDispatch()
    const poemsListQuery = useSelector((state: RootState) => state.poemsListQuery)
    // Cache stores poem ids; resolve them back to Poem[] via the entity store.
    const resolvedPoems = useSelector(selectPoemsListPoems)
    const isSeeded = useRef(false)
    const effectiveOrderBy = orderBy || ORDER_BY_LIKES

    // On mount: seed store with SSR data (skip reset+fetch) or do normal reset
    useEffect(() => {
        if (initialData) {
            // Seed the entity store first so the id-array resolves to full poems.
            dispatch(poemsUpserted(initialData.poems))
            const { fulfilledAction } = getTypes(ACTIONS.POEMS_LIST)
            dispatch({ type: fulfilledAction, payload: initialData })
            isSeeded.current = true
        } else {
            dispatch(getPoemsListAction({ options: { reset: true, fetch: false } }))
        }
    }, [dispatch])

    // Every fetch (initial, search, load-more, retry) sends the same filters;
    // only the page differs. Keeping one builder means search can never be
    // dropped from one of them.
    const buildParams = (page: number) => ({
        page,
        limit: PAGINATION_LIMIT,
        orderBy: effectiveOrderBy,
        ...(origin !== 'all' && { origin }),
        ...(genre && { genre }),
        ...(q && { q })
    })

    // Fetch when origin/genre/search changes — skip the first run if we seeded
    // from SSR.
    //
    // That skip makes the SERVER responsible for honouring ?q= on first paint:
    // getServerSideProps passes q through, and if it ever stops doing so the
    // page renders a search box filled in beside the full unfiltered list, with
    // no client fetch to correct it. Pinned by src/__tests__/searchSsr.test.ts.
    useEffect(() => {
        if (isSeeded.current) {
            isSeeded.current = false
            return
        }
        if (origin) {
            dispatch(
                getPoemsListAction({
                    params: buildParams(1),
                    options: { reset: true, fetch: true },
                    signal: nextSignal?.()
                })
            )
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [origin, genre, effectiveOrderBy, q, dispatch])

    // SERVER-RENDER FROM `initialData` WHEN THE STORE IS STILL EMPTY.
    //
    // The seeding above happens in an EFFECT, and effects do not run during
    // server rendering — so the server was producing an empty list. The page
    // shipped the poems twice over (15 KB of them inside `__NEXT_DATA__`) and
    // still rendered nothing until the browser had downloaded the JS, hydrated,
    // and built the list from that JSON. Measured on the live site: TTFB 0ms,
    // LCP render delay 2500ms, and zero `poem__title` elements in the HTML.
    //
    // Reading the prop directly costs nothing and is hydration-safe: on the
    // client's FIRST render the effect has not run either, so the store is
    // equally empty and this produces byte-identical markup. Once the effect
    // seeds the store, `resolvedPoems` wins and this branch is never taken
    // again — including on every client-side navigation, where the store is
    // already populated.
    const poems = (() => {
        if (!resolvedPoems.length) {
            const seed = initialData?.poems
            if (!seed?.length) return []
            return sortPoems(effectiveOrderBy, [...seed])
        }
        return sortPoems(effectiveOrderBy, [...resolvedPoems])
    })()

    const handleLoadMore = () => {
        if (!poemsListQuery.isFetching && poemsListQuery.hasMore) {
            const nextPage = (poemsListQuery.page || 0) + 1
            dispatch(
                getPoemsListAction({
                    params: buildParams(nextPage),
                    options: { fetch: true, reset: false },
                    signal: nextSignal?.()
                })
            )
        }
    }

    const retry = () => {
        dispatch(
            getPoemsListAction({
                params: buildParams(1),
                options: { reset: true, fetch: true },
                signal: nextSignal?.()
            })
        )
    }

    return {
        poems,
        isLoading: poemsListQuery?.isFetching,
        isError: poemsListQuery?.isError || false,
        hasMore: poemsListQuery?.hasMore || false,
        // Derived from what will actually be RENDERED, not from the store
        // alone — otherwise a server render holding poems from `initialData`
        // reports "no items" and List shows its empty/loading branch over a
        // list it is about to draw.
        hasItems: poems.length > 0,
        handleLoadMore,
        retry
    }
}
