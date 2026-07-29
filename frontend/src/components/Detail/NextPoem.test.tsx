import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import mockRouter from 'next-router-mock'
import Detail from './Detail'
import { NextPoemResponse } from './hooks/useNextPoem'
import { rootReducer } from '../../redux/reducers/rootReducer'
import { poemsUpserted } from '../../redux/reducers/poemEntitiesReducers'
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
// Park any request the hook might make: these tests are about what renders, and
// the dedicated hook suite covers fetching.
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
// fulfilled action carrying the ordered window. Used only to prove the control
// IGNORES browsing history.
function seedPoemsList(store: ReturnType<typeof makeStore>, poems: Poem[]) {
    store.dispatch(poemsUpserted(poems))
    const { fulfilledAction } = getTypes(ACTIONS.POEMS_LIST)
    store.dispatch({
        type: fulfilledAction,
        payload: { poems, page: 1, hasMore: false, total: poems.length, totalPages: 1 }
    })
}

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

    describe('rendering', () => {
        test('shows the server-provided next poem', () => {
            renderDetail({ poem: poem({ id: 'poem-2', title: 'The Sound of Rain', author: 'Marta Ruiz' }) })

            const link = screen.getByTestId('next-poem-link')
            expect(link).toHaveAttribute('href', '/detail/poem-2')
            expect(link).toHaveTextContent('The Sound of Rain')
            expect(link).toHaveTextContent('by Marta Ruiz')
        })

        test('prefers the slug over the id, matching ListItem', () => {
            renderDetail({ poem: poem({ id: 'poem-2', slug: 'sound-of-rain-ruiz' }) })

            expect(screen.getByTestId('next-poem-link'))
                .toHaveAttribute('href', '/detail/sound-of-rain-ruiz')
        })

        test('renders nothing when the collection holds no other poem', () => {
            renderDetail({ poem: null })

            expect(screen.queryByTestId('next-poem-link')).not.toBeInTheDocument()
        })

        test('renders nothing when the server answer never arrived', () => {
            renderDetail(null)

            expect(screen.queryByTestId('next-poem-link')).not.toBeInTheDocument()
        })

        test('sits above the comments, which lazy-load and grow unbounded', () => {
            const { container } = renderDetail({ poem: poem({ id: 'poem-2' }) })

            const nav = container.querySelector('.next-poem')!
            const sentinel = container.querySelector('.poem__comments-sentinel')!
            // Node.DOCUMENT_POSITION_FOLLOWING === 4
            expect(nav.compareDocumentPosition(sentinel) & 4).toBeTruthy()
        })
    })

    describe('the label', () => {
        // One string at every width. It used to vary by scope and by viewport
        // ("Next poem in Garden" / "In Garden"), which needed four strings and a
        // CSS swap to explain a distinction the reader never asked for.
        test('is always "Next poem", whatever the destination', () => {
            const { container, rerender, store } = renderDetail({
                poem: poem({ id: 'poem-2', genre: 'love', author: 'John Doe' })
            })
            expect(container.querySelector('.next-poem__scope')).toHaveTextContent('Next poem')

            // A different author and genre — i.e. what used to be a bucket
            // crossing — still reads the same.
            rerender(
                <Provider store={store}>
                    <Detail initialNextPoem={{ poem: poem({ id: 'poem-3', genre: 'sad', author: 'Zoe Ash' }) }} />
                </Provider>
            )
            expect(container.querySelector('.next-poem__scope')).toHaveTextContent('Next poem')
        })

        test('there is exactly one label element — no responsive variants', () => {
            const { container } = renderDetail({ poem: poem({ id: 'poem-2' }) })

            expect(container.querySelectorAll('.next-poem__scope')).toHaveLength(1)
        })
    })

    describe('accessibility', () => {
        test('the accessible name is stated once, not read piecemeal', () => {
            renderDetail({ poem: poem({ id: 'poem-2', title: 'Ode', author: 'Jane Roe' }) })

            expect(screen.getByTestId('next-poem-link'))
                .toHaveAccessibleName('Next poem: Ode by Jane Roe')
        })

        test('the visible text is hidden from screen readers to avoid the echo', () => {
            const { container } = renderDetail({ poem: poem({ id: 'poem-2' }) })

            expect(container.querySelector('.next-poem__body')).toHaveAttribute('aria-hidden', 'true')
        })

        test('the arrow is decorative — the label already carries the meaning', () => {
            const { container } = renderDetail({ poem: poem({ id: 'poem-2' }) })

            const arrow = container.querySelector('.next-poem__arrow')
            expect(arrow).toBeInTheDocument()
            expect(arrow).toHaveAttribute('aria-hidden', 'true')
        })

        test('is a real link, so middle-click and crawlers work', () => {
            renderDetail({ poem: poem({ id: 'poem-2' }) })

            expect(screen.getByTestId('next-poem-link').tagName).toBe('A')
            expect(screen.getByRole('navigation', { name: 'Poem navigation' })).toBeInTheDocument()
        })
    })

    describe('independence from browsing history', () => {
        // The whole point of the simplification: one poem, one answer. An earlier
        // version walked whichever list cache held the poem, so the same poem
        // offered different destinations depending on how you got there — and a
        // refresh, which wipes the caches, silently changed the answer.
        test('ignores the cached list the reader arrived from', () => {
            const store = makeStore()
            seedPoemsList(store, [CURRENT, poem({ id: 'list-neighbour', title: 'List Neighbour' })])

            renderDetail({ poem: poem({ id: 'poem-2', title: 'Server Answer' }) }, store)

            const link = screen.getByTestId('next-poem-link')
            expect(link).toHaveAttribute('href', '/detail/poem-2')
            expect(link).toHaveTextContent('Server Answer')
            expect(link).not.toHaveTextContent('List Neighbour')
        })

        test('a populated list cache cannot conjure a link the server did not give', () => {
            const store = makeStore()
            seedPoemsList(store, [CURRENT, poem({ id: 'list-neighbour' })])

            renderDetail({ poem: null }, store)

            expect(screen.queryByTestId('next-poem-link')).not.toBeInTheDocument()
        })
    })
})
