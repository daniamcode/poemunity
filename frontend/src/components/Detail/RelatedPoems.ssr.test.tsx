import React from 'react'
import { RelatedPoems } from './components/RelatedPoems'
import { useRelatedPoems, RelatedPoemsResponse } from './hooks/useRelatedPoems'

/**
 * THE RELATED-POEM LINKS MUST BE IN THE SERVER-RENDERED HTML.
 *
 * That is the entire point of the module. A crawler does not run effects, does
 * not hydrate and does not scroll — so a link that only appears after
 * JavaScript has run does nothing for the problem this exists to solve: 16,087
 * poems on a single linked list, 11% of them reachable within five clicks of
 * the homepage, and 17,349 URLs sitting in Search Console as "Discovered —
 * currently not indexed".
 *
 * `renderToString` rather than Testing Library, deliberately. RTL RUNS EFFECTS,
 * so it cannot see this class of bug: seed the data in a `useEffect` and a
 * normal `render()` looks perfect while the server emits an empty page. That
 * exact mistake has shipped here three times — the poem lists, the author page
 * and the authors index — and the last two cost the site its internal linking,
 * which is the same thing at stake here. See AGENTS.md.
 *
 * So the guard is on the whole chain, props -> hook -> markup, not on the
 * presentational component alone: `useRelatedPoems` is where a future "seed it
 * into state first" would go, and where the previous three bugs lived.
 */
// jsdom ships no TextEncoder, which react-dom/server needs. Assigned before the
// module is loaded, which is why it is `require`d inside the helper rather than
// imported at the top — ESM imports hoist above this.
const { TextEncoder, TextDecoder } = require('util')
;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

const RELATED: RelatedPoemsResponse = {
    byAuthor: [
        { id: 'a1', slug: 'the-going', title: 'The Going', author: 'Thomas Hardy', authorSlug: 'thomas-hardy' },
        { id: 'a2', slug: 'the-voice', title: 'The Voice', author: 'Thomas Hardy', authorSlug: 'thomas-hardy' }
    ],
    byGenre: [
        { id: 'g1', slug: 'ariel-sylvia-plath', title: 'Ariel', author: 'Sylvia Plath', authorSlug: 'sylvia-plath' }
    ]
}

// The real chain: SSR props go through the hook and out as markup, with no
// effect in between.
function DetailRelated({ initialRelated }: { initialRelated: RelatedPoemsResponse | null }) {
    const related = useRelatedPoems('69f0cb2d9496d1ecf2660f6c', initialRelated)
    return (
        <RelatedPoems
            related={related}
            authorName='Thomas Hardy'
            authorSlug='thomas-hardy'
            genre='love'
        />
    )
}

function renderOnServer(initialRelated: RelatedPoemsResponse | null): string {
    const { renderToString } = require('react-dom/server')
    return renderToString(<DetailRelated initialRelated={initialRelated} />)
}

describe('related poems, server-rendered', () => {
    test('every poem link is in the HTML before any JavaScript runs', () => {
        const html = renderOnServer(RELATED)

        expect(html).toContain('href="/detail/the-going"')
        expect(html).toContain('href="/detail/the-voice"')
        expect(html).toContain('href="/detail/ariel-sylvia-plath"')
    })

    test('so are the two hub links, which is where crawl depth actually collapses', () => {
        const html = renderOnServer(RELATED)

        expect(html).toContain('href="/authors/thomas-hardy"')
        expect(html).toContain('href="/love"')
    })

    test('the titles are rendered as text, not shipped as JSON for the client to draw', () => {
        const html = renderOnServer(RELATED)

        expect(html).toContain('The Going')
        expect(html).toContain('Ariel')
    })

    test('emits nothing at all when the backend gave us nothing', () => {
        // serverFetch collapses a failure into null. The page must render
        // normally without this module rather than break or show a heading over
        // an empty list.
        expect(renderOnServer(null)).toBe('')
    })
})
