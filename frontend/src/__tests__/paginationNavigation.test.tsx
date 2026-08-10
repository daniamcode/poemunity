import React from 'react'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../redux/reducers/rootReducer'
import { useAuthorPoems, InitialAuthorPoemsData } from '../components/Authors/useAuthorPoems'
import { usePoemsList, InitialPoemsData } from '../components/List/hooks/usePoemsList'
import { makePoem } from '../test-utils/fixtures'
import { ORDER_BY_LIKES } from '../data/constants'

/**
 * CLICKING A PAGE LINK MUST SHOW THAT PAGE.
 *
 * The paginated URLs work on a cold load, because `getServerSideProps` fetches
 * the page and the store is empty. Clicking one from inside the site is the
 * case that breaks: it is a client-side navigation, so `getServerSideProps`
 * re-runs and hands down page 3's poems, but the component never unmounts — and
 * both hooks seeded the store from an effect that ran ONCE, on mount.
 *
 * Two distinct failures hide behind that, which is why the fixtures below use
 * poems with different ids per page:
 *
 *   STALE — the seed is skipped entirely and the reader keeps looking at page
 *   1's poems under a URL naming page 3.
 *
 *   APPENDED — the seed runs without resetting first. The caches APPEND any
 *   payload whose `page` is not 1 (that is how infinite scroll grows the list),
 *   so page 3 lands under page 1 and the reader gets twenty poems, ten of them
 *   the ones they just paged away from.
 *
 * A test asserting only "page 3's poems are present" passes against the second
 * bug, so every assertion here pins the WHOLE list.
 */

const pageOf = (page: number, ids: string[]) => ({
    poems: ids.map(id => makePoem({ id, slug: `${id}-slug` })),
    page,
    hasMore: true,
    total: 85,
    totalPages: 9
})

/**
 * ONE store for the whole of a test, built outside the wrapper.
 *
 * Building it inside the wrapper component creates a fresh store on every
 * render, which wipes the cache between the two renders these tests exist to
 * compare — the hook then falls back to the `initialData` prop and every
 * assertion passes no matter what the store does. Caught by red-check: removing
 * the reset dispatch changed nothing.
 */
const freshWrapper = () => {
    const store = configureStore({ reducer: rootReducer })
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
        <Provider store={store}>{children}</Provider>
    )
    Wrapper.displayName = 'StoreWrapper'
    return Wrapper
}

describe('useAuthorPoems across a page navigation', () => {
    const render = (initialData: InitialAuthorPoemsData, currentPage: number) =>
        renderHook(
            ({ data, page }: { data: InitialAuthorPoemsData, page: number }) =>
                useAuthorPoems('ada-brine', data, page),
            { wrapper: freshWrapper(), initialProps: { data: initialData, page: currentPage } }
        )

    test('re-seeds with the new page, replacing the old one', () => {
        const { result, rerender } = render(pageOf(1, ['a1', 'a2']), 1)
        expect(result.current.poems.map(p => p.id)).toEqual(['a1', 'a2'])

        rerender({ data: pageOf(3, ['c1', 'c2']) as InitialAuthorPoemsData, page: 3 })

        expect(result.current.poems.map(p => p.id)).toEqual(['c1', 'c2'])
    })

    test('a re-render that is NOT a page change leaves the list alone', () => {
        // The distractor for a hook that re-seeds on every render: infinite
        // scroll has by then loaded pages the SSR payload knows nothing about,
        // and re-seeding would throw them away mid-scroll.
        const { result, rerender } = render(pageOf(1, ['a1', 'a2']), 1)

        rerender({ data: pageOf(1, ['a1', 'a2']) as InitialAuthorPoemsData, page: 1 })

        expect(result.current.poems.map(p => p.id)).toEqual(['a1', 'a2'])
    })
})

describe('usePoemsList across a page navigation', () => {
    const render = (initialData: InitialPoemsData, currentPage: number) =>
        renderHook(
            ({ data, page }: { data: InitialPoemsData, page: number }) =>
                usePoemsList({
                    genre: 'love',
                    origin: 'all',
                    orderBy: ORDER_BY_LIKES,
                    initialData: data,
                    currentPage: page
                }),
            { wrapper: freshWrapper(), initialProps: { data: initialData, page: currentPage } }
        )

    test('re-seeds with the new page, replacing the old one', () => {
        const { result, rerender } = render(pageOf(1, ['a1', 'a2']), 1)
        expect(result.current.poems.map(p => p.id)).toEqual(['a1', 'a2'])

        rerender({ data: pageOf(3, ['c1', 'c2']) as InitialPoemsData, page: 3 })

        expect(result.current.poems.map(p => p.id)).toEqual(['c1', 'c2'])
    })

    test('a re-render that is NOT a page change leaves the list alone', () => {
        const { result, rerender } = render(pageOf(1, ['a1', 'a2']), 1)

        rerender({ data: pageOf(1, ['a1', 'a2']) as InitialPoemsData, page: 1 })

        expect(result.current.poems.map(p => p.id)).toEqual(['a1', 'a2'])
    })
})
