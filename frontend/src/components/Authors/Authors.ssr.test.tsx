import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import AuthorsIndex from './AuthorsIndex'
import AuthorDetail from './AuthorDetail'
import { rootReducer } from '../../redux/reducers/rootReducer'
import { InitialAuthorPoemsData } from './useAuthorPoems'
import { Author } from '../../typescript/interfaces'

/**
 * THE AUTHOR PAGES MUST RENDER THEIR LINKS ON THE SERVER.
 *
 * They did not. Both seed their SSR props into Redux inside an EFFECT, and
 * effects do not run during server rendering — the same bug `List.ssr.test.tsx`
 * was written for, never applied here.
 *
 * On a list page that costs speed. Here it cost the site its internal linking.
 * Measured on the live site before the fix:
 *
 *   /authors            — 251 authors in __NEXT_DATA__, 0 `/authors/` links in the HTML
 *   /authors/<slug>     — 10 poems in __NEXT_DATA__, 0 `/detail/` links in the HTML
 *
 * So the index page for 3,364 author pages linked to none of them, and 3,364
 * author pages linked to none of their poems. Everything below `/authors` was
 * reachable only through the sitemap — discovery with no internal links behind
 * it, which is what Search Console files as "Discovered – currently not
 * indexed". A crawl from the homepage reached 11% of poems within five clicks.
 *
 * The author page was also emitting JSON-LD claiming an ItemList of 10 poems it
 * had not rendered, which is the rule `structuredData.ts` opens by stating.
 *
 * `renderToString` is used deliberately rather than Testing Library. RTL runs
 * effects, so it CANNOT see this bug — a normal `render()` seeds the store and
 * everything looks fine. Only a real server render exercises the broken path.
 */
// jsdom ships no TextEncoder, which react-dom/server needs. Assigned before the
// module is loaded, which is why it is `require`d inside the helper rather than
// imported at the top — ESM imports hoist above this.
const { TextEncoder, TextDecoder } = require('util')
;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

jest.mock('next/router', () => ({
    // AuthorDetail takes its slug from the ROUTER, not a prop.
    useRouter: () => ({
        query: { slug: 'ada-brine' },
        pathname: '/authors/[slug]',
        push: jest.fn(),
        isReady: true
    })
}))

/**
 * Server-rendered text, with React's separator comments removed.
 *
 * `{count} {word}` renders as `4<!-- --> <!-- -->poems`, so asserting on
 * "4 poems" against the raw HTML fails on a page that displays it perfectly.
 */
const text = (html: string): string => html.replace(/<!-- -->/g, '')

const render = (node: React.ReactElement): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { renderToString } = require('react-dom/server')
    return renderToString(
        <Provider store={configureStore({ reducer: rootReducer })}>{node}</Provider>
    )
}

describe('AuthorsIndex — server rendering', () => {
    // Slug and display name are deliberately different: the link is addressed
    // by SLUG and the text by NAME, and a fixture where one stands in for the
    // other cannot tell a right implementation from a wrong one.
    const authors = [
        { slug: 'ada-brine', name: 'Ada Brine', count: 4 },
        { slug: 'milo-vance', name: 'Milo Vance', count: 1 }
    ] as unknown as Author[]

    const ssr = (props: { initialAuthors?: Author[], initialLetters?: string[] } = {}) =>
        render(<AuthorsIndex initialLetters={['A', 'M']} {...props} />)

    test('renders a real link per author, not just their name', () => {
        // The href is the whole point: this page exists to link to the 3,364
        // author pages. Text alone could come from anywhere.
        const html = ssr({ initialAuthors: authors })

        expect(html).toContain('href="/authors/ada-brine"')
        expect(html).toContain('href="/authors/milo-vance"')
    })

    test('links every author it was given', () => {
        const html = ssr({ initialAuthors: authors })

        expect((html.match(/href="\/authors\//g) || []).length).toBe(2)
    })

    test('shows each author their own poem count', () => {
        const html = ssr({ initialAuthors: authors })

        expect(text(html)).toContain('4 poems')
        expect(text(html)).toContain('1 poem')
    })

    test('renders nothing when there is genuinely nothing — no crash, no phantom', () => {
        // The distractor: a "fix" that rendered a hardcoded row, or that read
        // "no data" as "not loaded yet", would pass every test above.
        const html = ssr({ initialAuthors: [] })

        expect(html).not.toContain('href="/authors/')
    })

    test('survives having no props at all', () => {
        expect(() => render(<AuthorsIndex />)).not.toThrow()
    })

    test('enables exactly the letters it was told exist', () => {
        // The alphabet comes from the same effect-seeded store. Getting this
        // wrong disables every letter, which is not visible in a link count.
        const html = ssr({ initialAuthors: authors, initialLetters: ['A', 'M'] })
        const disabled = (html.match(/authors-index__letter[^"]*disabled/g) || []).length

        expect(disabled).toBe(24)
    })
})

describe('AuthorDetail — server rendering', () => {
    const poem = (id: string, title: string, slug: string) => ({
        id,
        title,
        slug,
        author: 'Ada Brine',
        authorId: 'a1',
        authorSlug: 'ada-brine',
        poem: 'Some lines of verse.',
        genre: 'love',
        likes: [],
        picture: '',
        date: '2026-01-01T00:00:00.000Z'
    }) as never

    const initialPoems: InitialAuthorPoemsData = {
        // Ids and slugs deliberately differ — the link must be built from the
        // slug, and a fixture reusing one for both proves nothing.
        poems: [poem('p1', 'Aubade', 'aubade-ada'), poem('p2', 'Second Light', 'second-light-ada')],
        page: 1,
        hasMore: false,
        total: 2
    }

    const ssr = (initial?: InitialAuthorPoemsData) =>
        render(
            <AuthorDetail
                initialPoems={initial}
                initialAuthor={{ id: 'a1', slug: 'ada-brine', name: 'Ada Brine' } as never}
            />
        )

    test('links every poem the author has on this page', () => {
        const html = ssr(initialPoems)

        expect(html).toContain('href="/detail/aubade-ada"')
        expect(html).toContain('href="/detail/second-light-ada"')
    })

    test('emits real list markup, not just the titles', () => {
        const html = ssr(initialPoems)

        expect((html.match(/poem__title/g) || []).length).toBe(2)
    })

    test('the poem COUNT renders too, and matches the list', () => {
        // `total` reads from the same empty store, so the heading disappeared
        // over a list the page was about to draw. Whichever source supplies the
        // poems must supply the number describing them.
        const html = ssr(initialPoems)

        expect(text(html)).toContain('2 poems')
    })

    test('an author with genuinely no poems renders no links', () => {
        const html = ssr({ poems: [], page: 1, hasMore: false, total: 0 })

        expect(html).not.toContain('href="/detail/')
        expect(html).not.toContain('poem__title')
    })

    test('survives having no initialPoems at all', () => {
        expect(() => ssr()).not.toThrow()
    })
})
