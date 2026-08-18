import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../redux/reducers/rootReducer'
import AuthorDetail, { AuthorProfile } from '../components/Authors/AuthorDetail'
import { makePoem } from '../test-utils/fixtures'

/**
 * CLICKING "READ NEXT" MUST CHANGE WHO THE PAGE SAYS IT IS ABOUT.
 *
 * Reported from production: from /authors/william-shakespeare, clicking John
 * Donne under "Read next" gave a page whose URL, breadcrumb, poem list, poem
 * count AND introduction BODY were all Donne's — while the `h1` and the
 * introduction's HEADING both still said William Shakespeare. A refresh fixed
 * it.
 *
 * The cause is the one this codebase has now hit four times, and it is written
 * up in AGENTS.md under the paginated list URLs: `useState(initialAuthor)`
 * seeds ON MOUNT, and /authors/a → /authors/b is a client-side navigation that
 * never unmounts the component. `getServerSideProps` re-runs and hands down the
 * new author, the component keeps the old one, and the client-side profile
 * fetch only corrects it a round-trip later.
 *
 * Everything else on the page was right because everything else reads the LIVE
 * slug or the re-seeded poem list. That is what made it look like a rendering
 * glitch rather than a stale-state bug: only the two fields sourced from
 * component state were wrong.
 *
 * THE TEST MUST USE ONE COMPONENT INSTANCE ACROSS BOTH RENDERS — `rerender`,
 * not a second `render`. A fresh render remounts, the seed runs again, and the
 * assertion passes against the broken version. Same trap the pagination
 * re-seed tests documented.
 */

const mockRouter = { query: {} as Record<string, string>, push: jest.fn(), asPath: '/authors/x' }
jest.mock('next/router', () => ({ useRouter: () => mockRouter }))

// The profile refetch is what eventually corrects the stale name, a round-trip
// later. Never resolving it is the point: the page must be correct on the
// FIRST paint after navigation, not after the network catches up.
jest.mock('../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: () => ({ get: () => new Promise(() => {}) })
}))

jest.mock('../components/Comments/CommentsSection', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/Follow/FollowButton', () => ({ __esModule: true, default: () => null }))
jest.mock('../hooks/useInfiniteScroll', () => ({ useInfiniteScroll: () => ({ current: null }) }))
jest.mock('../hooks/usePageUrlSync', () => ({
    usePageUrlSync: () => ({ visiblePage: 1, markerRef: () => () => {} })
}))

const shakespeare: AuthorProfile = { id: 'a1', name: 'William Shakespeare', slug: 'william-shakespeare', type: 'famous' }
const donne: AuthorProfile = { id: 'a2', name: 'John Donne', slug: 'john-donne', type: 'famous' }

const poemsFor = (author: string, id: string) => ({
    poems: [makePoem({ id: `${id}-p1`, author, authorName: author })],
    page: 1,
    hasMore: false,
    total: 42,
    totalPages: 5
})

describe('navigating from one author to another', () => {
    const store = configureStore({ reducer: rootReducer })

    const view = (profile: AuthorProfile, slug: string) => {
        mockRouter.query = { slug }
        return (
            <Provider store={store}>
                <AuthorDetail
                    initialAuthor={profile}
                    initialPoems={poemsFor(profile.name, profile.id!) as never}
                    currentPage={1}
                />
            </Provider>
        )
    }

    test('the h1 becomes the new author, without waiting for a refetch', () => {
        const { rerender } = render(view(shakespeare, 'william-shakespeare'))
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('William Shakespeare')

        rerender(view(donne, 'john-donne'))

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('John Donne')
        expect(screen.getByRole('heading', { level: 1 })).not.toHaveTextContent('Shakespeare')
    })

    test('the introduction heading matches the introduction body', () => {
        // The reported symptom exactly: heading said Shakespeare over Donne's
        // prose, which is worse than either being stale on its own — the page
        // attributed one poet's biography to another.
        const { rerender } = render(view(shakespeare, 'william-shakespeare'))
        rerender(view(donne, 'john-donne'))

        expect(screen.getByRole('heading', { name: 'About John Donne' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'About William Shakespeare' })).not.toBeInTheDocument()
    })

    test('the introduction body is the new author\'s', () => {
        const { rerender } = render(view(shakespeare, 'william-shakespeare'))
        rerender(view(donne, 'john-donne'))

        expect(screen.getByText(/the most argumentative love poet in English/)).toBeInTheDocument()
    })

    test('the expanded disclosure collapses again for the new author', () => {
        // Secondary symptom in the same report: "Show less" was still showing,
        // because <details> keeps its open state when React reuses the element
        // across a navigation. Arriving mid-essay on a poet you just clicked to
        // is not what the collapsed default is for.
        const { rerender } = render(view(shakespeare, 'william-shakespeare'))
        document.querySelector('details')!.open = true

        rerender(view(donne, 'john-donne'))

        expect(document.querySelector('details')!.open).toBe(false)
    })
})
