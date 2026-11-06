import React from 'react'
import CategoriesPage from './CategoriesPage'
import { CATEGORIES, MUST_HAVE_CATEGORIES, categoryToSlug } from '../../data/constants'

/**
 * EVERY CATEGORY MUST BE A SERVER-RENDERED LINK.
 *
 * The header dropdown used to reveal categories 27..N behind a client-side
 * `onClick`, so the server-rendered HTML stopped at the 26 in
 * `MUST_HAVE_CATEGORIES`. Measured on the live site before `/categories`
 * existed: zero inbound links to `/fantasy` across all 135 genre pages, and
 * `/categories` answered 404. Everything outside that list of 26 was reachable
 * only through the sitemap — discovery with no internal links behind it, which
 * is what Search Console files as "Discovered – currently not indexed".
 *
 * `renderToString` rather than Testing Library, deliberately: RTL runs effects
 * and hydrates, so it would show a client-built list and look fine either way.
 * The guard has to be the markup a crawler actually receives.
 *
 * The distractor is `fantasy`: it is NOT in `MUST_HAVE_CATEGORIES`, so a
 * regression to the old 26-item list still renders `love`, `war` and `nature`
 * happily while `fantasy` disappears. Asserting only on the must-have set is
 * precisely the test that would have passed against the broken code.
 */
// jsdom ships no TextEncoder, which react-dom/server needs. Assigned before the
// module loads, hence `require`d here rather than imported at the top — ESM
// imports hoist above this.
const { TextEncoder, TextDecoder } = require('util')
;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

const ssr = (): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { renderToString } = require('react-dom/server')
    return renderToString(<CategoriesPage />)
}

describe('CategoriesPage — server rendering', () => {
    test('links a category outside the must-have list — the ones that had none', () => {
        expect(MUST_HAVE_CATEGORIES).not.toContain('Fantasy')

        const html = ssr()

        expect(html).toContain('href="/fantasy"')
        expect(html).toContain('href="/mythology"')
    })

    test('links every category the site defines, as a real href', () => {
        const html = ssr()
        const hrefs = html.match(/href="\/[a-z0-9-]+"/g) || []

        // One link per category, plus the `/authors` cross-link in the intro.
        // A count of 26 — the old dropdown — fails here outright.
        expect(hrefs.length).toBe(CATEGORIES.length + 1)
        CATEGORIES.forEach(category => {
            expect(html).toContain(`href="/${categoryToSlug(category)}"`)
        })
    })

    test('renders the category NAME as the link text, not the slug', () => {
        // The href is addressed by slug and the text by label; a fixture using
        // one for both cannot tell a right implementation from a wrong one.
        const html = ssr()

        expect(html).toContain('>Arts &amp; Sciences</')
        expect(html).toContain('href="/arts-and-sciences"')
    })

    test('the hub links onward to the author index rather than dead-ending', () => {
        const html = ssr()

        expect(html).toContain('href="/authors"')
    })

    test('renders nothing it should not — no poem or author pages', () => {
        // Distractor: a component that padded the list with sample content
        // would still satisfy every count above.
        const html = ssr()

        expect(html).not.toContain('href="/detail/')
        expect(html).not.toContain('href="/authors/')
    })

    test('survives having no props at all', () => {
        expect(() => ssr()).not.toThrow()
    })
})
