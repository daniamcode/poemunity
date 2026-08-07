import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import List from './List'
import { rootReducer } from '../../redux/reducers/rootReducer'
import { InitialPoemsData } from './hooks/usePoemsList'

/**
 * The listing pages must render their poems ON THE SERVER.
 *
 * They did not. `usePoemsList` seeds the SSR `initialData` into Redux inside an
 * EFFECT, and effects do not run during server rendering — so the server
 * produced an empty list. The page shipped the poems twice (15 KB of them
 * inside `__NEXT_DATA__`) and still rendered nothing until the browser had
 * downloaded the JS, hydrated, and rebuilt the list from that JSON.
 *
 * Measured on the live site before the fix: TTFB 0 ms, LCP render delay
 * 2500 ms, and zero `poem__title` elements anywhere in the HTML — while
 * `/detail/<poem>` rendered its poem correctly. Worst of both worlds: the
 * server fetch was paid for, the payload was paid for, and the reader waited
 * for JavaScript anyway.
 *
 * `renderToString` is used deliberately rather than Testing Library. RTL runs
 * effects, so it CANNOT see this bug — a normal `render()` seeds the store and
 * everything looks fine. Only a real server render exercises the path that was
 * broken.
 */
// jsdom ships no TextEncoder, which react-dom/server needs. Assigned before
// the module is loaded, which is why it is `require`d inside the helper rather
// than imported at the top — ESM imports hoist above this.
const { TextEncoder, TextDecoder } = require('util')
;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

jest.mock('next/router', () => ({
    useRouter: () => ({ query: {}, pathname: '/', push: jest.fn(), isReady: true })
}))

const poem = (id: string, title: string): never => ({
    id,
    title,
    author: 'Nadia Novak',
    authorId: 'a1',
    poem: 'Some lines of verse.',
    genre: 'love',
    likes: [],
    picture: '',
    date: '2026-01-01T00:00:00.000Z',
    slug: `${title.toLowerCase().replace(/\s+/g, '-')}-nadia`
}) as never

const initialData: InitialPoemsData = {
    poems: [poem('p1', 'Aubade'), poem('p2', 'Second Light')],
    page: 1,
    hasMore: false,
    total: 2
}

const ssr = (props: { initialData?: InitialPoemsData, currentPage?: number } = {}) => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { renderToString } = require('react-dom/server')
    return renderToString(
        <Provider store={configureStore({ reducer: rootReducer })}>
            <List {...props} />
        </Provider>
    )
}

describe('List — server rendering', () => {
    test('renders the poems it was given, without waiting for the client', () => {
        const html = ssr({ initialData })

        expect(html).toContain('Aubade')
        expect(html).toContain('Second Light')
    })

    test('emits real list markup, not just the words', () => {
        // The bug produced a page whose only copy of the poems was JSON in
        // __NEXT_DATA__. Text alone could come from anywhere; the class is what
        // proves a list item was actually built.
        const html = ssr({ initialData })

        expect(html).toContain('poem__title')
    })

    test('renders every poem it was given', () => {
        const html = ssr({
            initialData: {
                ...initialData,
                poems: [poem('p1', 'One'), poem('p2', 'Two'), poem('p3', 'Three')],
                total: 3
            }
        })

        expect((html.match(/poem__title/g) || []).length).toBe(3)
    })

    test('renders nothing when there is genuinely nothing — no crash, no phantom', () => {
        // The distractor: a fix that rendered a hardcoded item, or that treated
        // "no data" as "not loaded yet", would pass the tests above.
        const html = ssr({ initialData: { poems: [], page: 1, hasMore: false, total: 0 } })

        expect(html).not.toContain('poem__title')
    })

    test('survives having no initialData at all', () => {
        // Not every caller passes it; the client fetch is the fallback.
        expect(() => ssr()).not.toThrow()
    })

    describe('pagination links', () => {
        // The lists load by infinite scroll, which no crawler performs. Without
        // these links a genre page exposes 10 of its 1,247 poems and the rest
        // have no URL that reaches them.
        const paged: InitialPoemsData = {
            poems: [poem('p1', 'Aubade')],
            page: 1,
            hasMore: true,
            total: 47,
            totalPages: 5
        }

        test('the server HTML carries a link to page 2', () => {
            const html = ssr({ initialData: paged })

            expect(html).toContain('href="/?page=2"')
        })

        test('and to the LAST page, so deep pages are not 100 hops away', () => {
            const html = ssr({ initialData: paged })

            expect(html).toContain('href="/?page=5"')
        })

        test('page 5 links back to the clean URL, never to ?page=1', () => {
            const html = ssr({ initialData: paged, currentPage: 5 })

            expect(html).toContain('href="/"')
            expect(html).not.toContain('page=1')
        })

        test('falls back to the total when the API omitted totalPages', () => {
            const html = ssr({
                initialData: { poems: [poem('p1', 'Aubade')], page: 1, hasMore: true, total: 47 }
            })

            expect(html).toContain('href="/?page=5"')
        })

        test('a list that fits on one page gets no pagination nav', () => {
            // The distractor for a component that always draws one.
            const html = ssr({ initialData })

            expect(html).not.toContain('aria-label="Pagination"')
            expect(html).not.toContain('page=')
        })
    })
})
