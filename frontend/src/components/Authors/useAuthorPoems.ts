import { useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch, RootState } from '../../redux/store'
import { getAuthorPoemsAction } from '../../redux/actions/poemsActions'
import { getTypes } from '../../redux/actions/commonActions'
import { ACTIONS } from '../../redux/reducers/poemsReducers'
import { poemsUpserted } from '../../redux/reducers/poemEntitiesReducers'
import { selectAuthorPoemsPoems } from '../../redux/selectors/poemCacheSelectors'
import { PAGINATION_LIMIT } from '../../data/constants'
import { Poem } from '../../typescript/interfaces'

export interface InitialAuthorPoemsData {
    poems: Poem[]
    page: number
    hasMore: boolean
    total: number
    totalPages?: number
}

export function useAuthorPoems(slug: string, initialData?: InitialAuthorPoemsData, currentPage = 1) {
    const dispatch = useAppDispatch()
    const authorPoemsQuery = useSelector((state: RootState) => state.authorPoemsQuery)
    const storePoems = useSelector(selectAuthorPoemsPoems)
    const isSeeded = useRef(false)
    /** Which page the store was last seeded from; null until the first seed. */
    const seededPage = useRef<number | null>(null)

    // SERVER-RENDER FROM `initialData` WHEN THE STORE IS STILL EMPTY.
    //
    // Same bug the poem lists had (see usePoemsList): the seeding below happens
    // in an EFFECT, and effects do not run during server rendering — so every
    // author page rendered ZERO poems on the server. It shipped them twice over
    // inside `__NEXT_DATA__` and drew nothing until the browser had downloaded
    // the JS and hydrated.
    //
    // On an author page that is not only slow, it is the site's internal
    // linking: 3,364 author pages each linking 10 poems is the main path from a
    // poet to their work, and a crawler saw none of it. Measured on the live
    // site before this fix: 0 `/detail/` links in the HTML of every author
    // page, while the JSON-LD on the same page listed 10 poems — markup
    // claiming content the page had not rendered.
    //
    // Reading the prop directly is hydration-safe: on the client's FIRST render
    // the effect has not run either, so the store is equally empty and this
    // produces byte-identical markup. Once seeded, the store wins and this
    // branch is never taken again — including on client-side navigation, where
    // the store is already populated.
    const poems = storePoems.length ? storePoems : (initialData?.poems ?? [])

    // RE-SEEDS WHEN THE PAGE CHANGES, not only on mount.
    //
    // Clicking a page link is a client-side navigation: `getServerSideProps`
    // re-runs and hands down page 3's poems, but the component never unmounts,
    // so a mount-only effect would leave the store holding page 1 and the reader
    // would see the old poems under a URL naming a page they never got.
    //
    // The reset before the seed is load-bearing. The cache APPENDS a payload
    // whose `page` is not 1 (that is how infinite scroll works), so seeding page
    // 3 onto a store already holding page 1 would render twenty poems: ten of
    // them the ones the reader just paged away from.
    useEffect(() => {
        const { fulfilledAction, resetAction } = getTypes(ACTIONS.AUTHOR_POEMS)
        if (initialData) {
            if (seededPage.current === currentPage) return
            if (seededPage.current !== null) dispatch({ type: resetAction })
            dispatch(poemsUpserted(initialData.poems))
            dispatch({ type: fulfilledAction, payload: initialData })
            seededPage.current = currentPage
            isSeeded.current = true
        } else {
            dispatch(getAuthorPoemsAction({ options: { reset: true, fetch: false } }))
        }
        // `initialData` is deliberately absent: Next hands down a new object on
        // every render, and depending on it would re-seed in a loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, slug, currentPage])

    useEffect(() => {
        if (isSeeded.current) {
            isSeeded.current = false
            return
        }
        if (!slug) return
        // `currentPage`, not 1: on the unseeded path (no SSR data) the URL still
        // says which page the reader asked for, and fetching page 1 there would
        // render poems 1-10 under a URL naming page 4.
        dispatch(
            getAuthorPoemsAction({
                params: { page: currentPage, limit: PAGINATION_LIMIT, author: slug },
                options: { reset: true, fetch: true }
            })
        )
    }, [slug, currentPage, dispatch])

    const handleLoadMore = () => {
        if (!authorPoemsQuery.isFetching && authorPoemsQuery.hasMore) {
            const nextPage = (authorPoemsQuery.page || 0) + 1
            dispatch(
                getAuthorPoemsAction({
                    params: { page: nextPage, limit: PAGINATION_LIMIT, author: slug },
                    options: { fetch: true, reset: false }
                })
            )
        }
    }

    // `total` and `hasMore` follow the same rule as `poems`, and for the same
    // reason: on the server the store is empty, so reading it alone reports 0
    // poems for an author who has 16 — which hides the "16 poems" heading over
    // a list the page is about to draw. Whichever source supplied the poems
    // must supply the numbers describing them, or the two disagree.
    const seeded = !storePoems.length && Boolean(initialData?.poems.length)

    return {
        poems,
        isLoading: authorPoemsQuery.isFetching,
        hasMore: (seeded ? initialData?.hasMore : authorPoemsQuery.hasMore) || false,
        total: (seeded ? initialData?.total : authorPoemsQuery.total) || 0,
        handleLoadMore
    }
}
