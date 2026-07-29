import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import mockRouter from 'next-router-mock'
import Detail from './Detail'
import { NextPoemResponse } from './hooks/useNextPoem'
import { rootReducer } from '../../redux/reducers/rootReducer'
import { poemsUpserted } from '../../redux/reducers/poemEntitiesReducers'
import { listContextSet } from '../../redux/reducers/listContextReducers'
import { getTypes } from '../../redux/actions/commonActions'
import { ACTIONS } from '../../redux/reducers/poemsReducers'
import * as useDetailPoemHook from './hooks/useDetailPoem'
import * as usePoemActionsHook from '../../hooks/usePoemActions'
import { Poem } from '../../typescript/interfaces'

jest.mock('./hooks/useDetailPoem')
jest.mock('../../hooks/usePoemActions')
jest.mock('../Comments/CommentsSection', () => ({
    __esModule: true,
    default: () => <div data-testid='comments-section'>Comments</div>
}))
jest.mock('../../App', () => {
    const mockContext = { user: 'testuser', userId: 'user-123', isAdmin: false, setState: jest.fn() }
    return { AppContext: React.createContext(mockContext) }
})
// The author-dimension walk fires a real request. Park it: these tests are about
// what renders, and the dedicated hook suite covers the fetch itself.
jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: () => ({ get: jest.fn(() => new Promise(() => undefined)) })
}))

const poem = (over: Partial<Poem> & { id: string }): Poem => ({
    author: 'John Doe',
    date: '2024-01-15T10:30:00.000Z',
    genre: 'love',
    likes: [],
    picture: '',
    poem: 'content',
    title: `Title ${over.id}`,
    userId: 'user-456',
    ...over
})

const CURRENT = poem({ id: 'poem-1', title: 'Current Poem' })

function makeStore() {
    return configureStore({ reducer: rootReducer })
}

// Seed a list cache the way a real fetch does: entities first, then the
// fulfilled action carrying the ordered window.
function seedCache(
    store: ReturnType<typeof makeStore>,
    action: string,
    poems: Poem[],
    meta: { page?: number, hasMore?: boolean } = {}
) {
    store.dispatch(poemsUpserted(poems))
    const { fulfilledAction } = getTypes(action)
    store.dispatch({
        type: fulfilledAction,
        payload: { poems, page: meta.page ?? 1, hasMore: meta.hasMore ?? false, total: poems.length, totalPages: 1 }
    })
}

const seedPoemsList = (
    store: ReturnType<typeof makeStore>,
    poems: Poem[],
    meta?: { page?: number, hasMore?: boolean }
) => seedCache(store, ACTIONS.POEMS_LIST, poems, meta)

function renderDetail(initialNextPoem: NextPoemResponse | null, store = makeStore()) {
    return {
        store,
        ...render(
            <Provider store={store}>
                <Detail initialNextPoem={initialNextPoem} />
            </Provider>
        )
    }
}

describe('Detail — next poem control', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockRouter.setCurrentUrl({ pathname: '/detail/[poemId]', query: { poemId: 'poem-1' } })
        ;(useDetailPoemHook.useDetailPoem as jest.Mock).mockReturnValue({
            poem: CURRENT,
            isLoading: false,
            isError: false,
            retry: jest.fn()
        })
        ;(usePoemActionsHook.usePoemActions as jest.Mock).mockReturnValue({
            onLike: jest.fn(),
            onDelete: jest.fn(),
            onEdit: jest.fn()
        })
    })

    describe('SSR fallback', () => {
        test('renders the server-resolved next poem when no list cache is present', () => {
            renderDetail({
                poem: poem({ id: 'poem-2', title: 'The Server Answer', author: 'Jane Roe' }),
                scope: 'same-bucket'
            })

            const link = screen.getByTestId('next-poem-link')
            expect(link).toHaveAttribute('href', '/detail/poem-2')
            expect(link).toHaveAttribute('data-scope', 'same-bucket')
            // No browsing context ⇒ the server's genre default, and the label
            // has to agree with it.
            expect(link).toHaveAttribute('data-dimension', 'genre')
            expect(screen.getByText('The Server Answer')).toBeInTheDocument()
            expect(screen.getByText('by Jane Roe')).toBeInTheDocument()
        })

        test('links to the slug when the next poem has one', () => {
            renderDetail({ poem: poem({ id: 'poem-2', slug: 'the-server-answer' }), scope: 'same-bucket' })

            expect(screen.getByTestId('next-poem-link')).toHaveAttribute('href', '/detail/the-server-answer')
        })

        test('sits above the comments sentinel, never below it', () => {
            const { container } = renderDetail({ poem: poem({ id: 'poem-2' }), scope: 'same-bucket' })

            const nav = container.querySelector('nav.next-poem')!
            const sentinel = container.querySelector('.poem__comments-sentinel')!
            // DOCUMENT_POSITION_FOLLOWING === 4: the sentinel comes after the nav.
            expect(nav.compareDocumentPosition(sentinel) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        })

        test('renders a real anchor, so middle-click / cmd-click / crawlers work', () => {
            renderDetail({ poem: poem({ id: 'poem-2' }), scope: 'same-bucket' })

            expect(screen.getByTestId('next-poem-link').tagName).toBe('A')
        })
    })

    describe('hidden state', () => {
        test('renders nothing when the endpoint reports no other poem', () => {
            renderDetail({ poem: null, scope: null })

            expect(screen.queryByTestId('next-poem-link')).not.toBeInTheDocument()
            expect(screen.queryByRole('navigation', { name: 'Poem navigation' })).not.toBeInTheDocument()
        })

        test('renders nothing when the SSR fetch failed altogether', () => {
            renderDetail(null)

            expect(screen.queryByTestId('next-poem-link')).not.toBeInTheDocument()
        })
    })

    describe('hydration upgrade to the cached list', () => {
        test('prefers the neighbour from the cached list over the server answer', () => {
            const store = makeStore()
            seedPoemsList(store, [
                poem({ id: 'poem-0' }),
                CURRENT,
                poem({ id: 'poem-9', title: 'The List Neighbour' })
            ])

            renderDetail(
                { poem: poem({ id: 'poem-2', title: 'The Server Answer' }), scope: 'same-bucket' },
                store
            )

            const link = screen.getByTestId('next-poem-link')
            expect(link).toHaveAttribute('href', '/detail/poem-9')
            expect(screen.getByText('The List Neighbour')).toBeInTheDocument()
            expect(screen.queryByText('The Server Answer')).not.toBeInTheDocument()
        })

        test('falls back to the server answer at the tail of an exhausted list', () => {
            const store = makeStore()
            seedPoemsList(store, [poem({ id: 'poem-0' }), CURRENT], { hasMore: false })

            renderDetail({ poem: poem({ id: 'poem-2', title: 'The Server Answer' }), scope: 'wrap' }, store)

            const link = screen.getByTestId('next-poem-link')
            expect(link).toHaveAttribute('href', '/detail/poem-2')
            expect(link).toHaveAttribute('data-scope', 'wrap')
        })

        test('falls back to the server answer when the current poem is not in any cache', () => {
            const store = makeStore()
            seedPoemsList(store, [poem({ id: 'other-a' }), poem({ id: 'other-b' })])

            renderDetail({ poem: poem({ id: 'poem-2', title: 'The Server Answer' }), scope: 'same-bucket' }, store)

            expect(screen.getByTestId('next-poem-link')).toHaveAttribute('href', '/detail/poem-2')
        })

        test('a search-filtered cache yields a neighbour from within the search results', () => {
            // The cache holds exactly the poems the server matched for ?q=, in
            // order — so the neighbour is a search result, with no extra request
            // and no re-encoding of the search on the client.
            const store = makeStore()
            seedPoemsList(store, [
                poem({ id: 'match-1', title: 'A Song of Love' }),
                CURRENT,
                poem({ id: 'match-3', title: 'Love Again' })
            ])

            renderDetail(
                { poem: poem({ id: 'unrelated', title: 'Unrelated Poem' }), scope: 'same-bucket' },
                store
            )

            expect(screen.getByTestId('next-poem-link')).toHaveAttribute('href', '/detail/match-3')
            expect(screen.getByText('Love Again')).toBeInTheDocument()
            expect(screen.queryByText('Unrelated Poem')).not.toBeInTheDocument()
        })
    })

    describe('dimension', () => {
        test('an author page browses by author, so the card labels by author', () => {
            const store = makeStore()
            seedCache(store, ACTIONS.AUTHOR_POEMS, [
                CURRENT,
                poem({ id: 'poem-9', title: 'Next By Them', author: 'Marta Ruiz' })
            ])

            const { container } = renderDetail(null, store)

            const link = screen.getByTestId('next-poem-link')
            expect(link).toHaveAttribute('data-dimension', 'author')
            expect(container.querySelector('.next-poem__scope-wide')).toHaveTextContent('Next poem by Marta Ruiz')
        })

        test('an active genre filter browses by genre, so the card labels by genre', () => {
            const store = makeStore()
            store.dispatch(listContextSet({ page: 1, genre: 'sad' }))
            seedPoemsList(store, [CURRENT, poem({ id: 'poem-9', genre: 'sad' })])

            const { container } = renderDetail(null, store)

            const link = screen.getByTestId('next-poem-link')
            expect(link).toHaveAttribute('data-dimension', 'genre')
            expect(container.querySelector('.next-poem__scope-wide')).toHaveTextContent('Next poem in sad')
        })

        test('an unfiltered list has no dimension and falls back to the genre default', () => {
            const store = makeStore()
            seedPoemsList(store, [CURRENT, poem({ id: 'poem-9', genre: 'happy' })])

            expect(renderDetail(null, store).container.querySelector('.next-poem__scope-wide'))
                .toHaveTextContent('Next poem in happy')
        })
    })

    describe('labels', () => {
        // Both variants are always in the DOM — CSS picks one at $bp-md. A JS
        // branch on viewport width would differ between server and client render
        // and blow up hydration on every detail page.
        test('same-bucket in the genre dimension names the genre', () => {
            const { container } = renderDetail({
                poem: poem({ id: 'poem-2', genre: 'love' }),
                scope: 'same-bucket'
            })

            expect(container.querySelector('.next-poem__scope-wide')).toHaveTextContent('Next poem in love')
            expect(container.querySelector('.next-poem__scope-narrow')).toHaveTextContent('Next in love')
        })

        test('same-bucket in the author dimension names the author', () => {
            const store = makeStore()
            seedCache(store, ACTIONS.AUTHOR_POEMS, [
                CURRENT,
                poem({ id: 'poem-9', author: 'Marta Ruiz' })
            ])

            const { container } = renderDetail(null, store)

            expect(container.querySelector('.next-poem__scope-wide')).toHaveTextContent('Next poem by Marta Ruiz')
            expect(container.querySelector('.next-poem__scope-narrow')).toHaveTextContent('Next by Marta Ruiz')
        })

        test('next-bucket labels the bucket being ARRIVED in, from the destination poem', () => {
            const { container } = renderDetail({
                // Current poem is 'love'; the destination is the next genre.
                poem: poem({ id: 'poem-2', genre: 'sad' }),
                scope: 'next-bucket'
            })

            expect(container.querySelector('.next-poem__scope-wide')).toHaveTextContent('Next poem in sad')
            expect(container.querySelector('.next-poem__scope-narrow')).toHaveTextContent('Next in sad')
        })

        test('wrap says the lap is starting again', () => {
            const { container } = renderDetail({ poem: poem({ id: 'poem-2' }), scope: 'wrap' })

            expect(container.querySelector('.next-poem__scope-wide')).toHaveTextContent('Next poem — starting over')
            expect(container.querySelector('.next-poem__scope-narrow')).toHaveTextContent('Next poem')
        })

        // The narrow labels once dropped the word entirely ("In Garden"), which
        // shortened the line by two words and cost it its meaning — on its own it
        // reads as a section heading for the poem below, not as a way forward.
        test.each([
            ['genre same-bucket', { poem: poem({ id: 'poem-2', genre: 'love' }), scope: 'same-bucket' }],
            ['genre next-bucket', { poem: poem({ id: 'poem-2', genre: 'sad' }), scope: 'next-bucket' }],
            ['wrap', { poem: poem({ id: 'poem-2' }), scope: 'wrap' }]
        ])('every label variant keeps the word "Next" (%s)', (_name, next) => {
            const { container } = renderDetail(next as never)

            expect(container.querySelector('.next-poem__scope-wide')).toHaveTextContent(/^Next/)
            expect(container.querySelector('.next-poem__scope-narrow')).toHaveTextContent(/^Next/)
        })

        test('the arrow is decorative — the label already carries the meaning', () => {
            const { container } = renderDetail({ poem: poem({ id: 'poem-2' }), scope: 'same-bucket' })

            const arrow = container.querySelector('.next-poem__arrow')
            expect(arrow).toBeInTheDocument()
            expect(arrow).toHaveAttribute('aria-hidden', 'true')
        })

        test('the accessible name uses the wide label and is stated once', () => {
            renderDetail({
                poem: poem({ id: 'poem-2', title: 'Ode', author: 'Jane Roe', genre: 'love' }),
                scope: 'same-bucket'
            })

            expect(screen.getByTestId('next-poem-link')).toHaveAccessibleName(
                'Next poem in love: Ode by Jane Roe'
            )
        })

        test('is wrapped in a labelled navigation landmark', () => {
            renderDetail({ poem: poem({ id: 'poem-2' }), scope: 'same-bucket' })

            expect(screen.getByRole('navigation', { name: 'Poem navigation' })).toBeInTheDocument()
        })
    })
})
