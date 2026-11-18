import React from 'react'
import SimpleAccordion from './SimpleAccordion'
import { CATEGORIES, MUST_HAVE_CATEGORIES, categoryToSlug } from '../data/constants'

/**
 * THE SERVER MUST SHIP THE LINKS, NOT THE BROWSER.
 *
 * `SimpleAccordion` derived both of its flags inside a `useEffect`, and effects
 * do not run during server rendering. So every response carried a collapsed
 * panel holding only `MUST_HAVE_CATEGORIES`, and on the 109 genre pages outside
 * that list the other 117 category links were created by the browser after
 * hydration — absent from the HTML a crawler reads first.
 *
 * `SimpleAccordion.test.tsx` CANNOT catch this and never could: RTL's `render()`
 * runs effects, so it sees the corrected state and every assertion passes
 * against the broken implementation. Only `renderToString` sees what actually
 * ships. The guard has to be the markup a crawler receives.
 *
 * THREE FIXTURES, because the correct answer differs for each and a lazy
 * implementation passes some of them: `halloween` (outside the must-have set →
 * all 143), `love` (inside it → exactly 26), and no genre at all (the
 * dashboard, which must stay truncated or 143 links land on all 16,087 pages).
 * `halloween` is the one that fails against the old code.
 */
// jsdom ships no TextEncoder, which react-dom/server needs. Assigned before the
// module loads, hence `require`d here rather than imported at the top — ESM
// imports hoist above this.
const { TextEncoder, TextDecoder } = require('util')
;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

const ssr = (genre?: string): string => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { renderToString } = require('react-dom/server')
    return renderToString(<SimpleAccordion genre={genre} />)
}

const hrefs = (html: string) =>
    Array.from(html.matchAll(/href="\/([a-z0-9-]+)"/g)).map(m => m[1])

const missingFrom = (html: string, expected: string[]) =>
    expected.filter(slug => !hrefs(html).includes(slug))

const leakedBeyond = (html: string, allowed: string[]) =>
    hrefs(html).filter(h => h !== '' && h !== 'categories' && !allowed.includes(h))

describe('SimpleAccordion — server rendering', () => {
    test('a genre page outside the must-have list ships EVERY category link', () => {
        // The 117 that used to arrive only after hydration.
        const expected = CATEGORIES.map(categoryToSlug)
        expect(expected).toHaveLength(143)
        expect(MUST_HAVE_CATEGORIES).toHaveLength(26)

        expect(missingFrom(ssr('halloween'), expected)).toEqual([])
    })

    test('a must-have genre page ships exactly the must-have set', () => {
        const allowed = MUST_HAVE_CATEGORIES.map(categoryToSlug)

        expect(missingFrom(ssr('love'), allowed)).toEqual([])
        expect(leakedBeyond(ssr('love'), allowed)).toEqual([])
    })

    test('the dashboard still ships only the must-have set', () => {
        // The other half of the same distractor: 143 links on every page is
        // the ~13KB-per-page fix that was deliberately not taken.
        const allowed = MUST_HAVE_CATEGORIES.map(categoryToSlug)

        expect(missingFrom(ssr(), allowed)).toEqual([])
        expect(leakedBeyond(ssr(), allowed)).toEqual([])
    })

    test('a genre page ships the panel EXPANDED, not expanded after hydration', () => {
        // Collapsed in the HTML and opened by React is a content flash — and
        // it is the state a non-rendering crawler files.
        expect(ssr('halloween')).toContain('Mui-expanded')
        expect(ssr('love')).toContain('Mui-expanded')
        expect(ssr()).not.toContain('Mui-expanded')
    })

    test('the hub link is offered wherever the list is truncated', () => {
        // Deliberately scoped: where the full list is already rendered, the
        // hub link is redundant and the component omits it (both before and
        // after this change — the rendered DOM never carried it there).
        expect(ssr()).toContain('href="/categories"')
        expect(ssr('love')).toContain('href="/categories"')
    })

    test('category links are real anchors, not buttons', () => {
        // The 2026-04-29 regression: a client-only <button> gave the target's
        // only inbound path a route a crawler never runs.
        const html = ssr('halloween')
        expect(html).not.toMatch(/<button[^>]*>Fantasy</)
        expect(html).toContain('href="/fantasy"')
    })

    test('the "ALL" link points at the dashboard', () => {
        expect(ssr('halloween')).toContain('href="/"')
    })
})
