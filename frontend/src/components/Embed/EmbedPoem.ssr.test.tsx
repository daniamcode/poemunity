import React from 'react'
import { EmbedPoem } from './EmbedPoem'
import { Poem } from '../../typescript/interfaces'

/**
 * THE ATTRIBUTION LINK MUST BE IN THE SERVER-RENDERED HTML.
 *
 * That is the whole feature. An embed is rendered inside an `<iframe>` on
 * somebody else's website, and if the one anchor that says "read this on
 * Poemunity" only appears after hydration, then every embed on every external
 * page ships a card with a link that never arrives — which is precisely the
 * backlink this exists to produce. Crawlers do not run effects, and neither
 * does the reader who pasted the snippet and left.
 *
 * `renderToString` rather than Testing Library, for the reason AGENTS.md
 * records: RTL RUNS EFFECTS, so seeding data into state inside a `useEffect`
 * makes `render()` look perfect while the server emits an empty page. That has
 * shipped here three times — the poem lists, the author page, the authors index.
 *
 * Fixtures are built to be DISTRACTORS: two poems identical in every respect
 * except `authorType`. An implementation that dropped the AI badge would still
 * pass a test written against a single human poem, because the badge renders
 * nothing for humans and "nothing appeared" looks the same as "not implemented".
 */
// jsdom ships no TextEncoder, which react-dom/server needs. Assigned before the
// module is loaded, which is why it is `require`d here rather than imported —
// ESM imports hoist above this line.
const { TextEncoder, TextDecoder } = require('util')
;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

const basePoem: Poem = {
    id: '69f0cb2d9496d1ecf2660f6c',
    slug: 'the-going',
    author: 'Thomas Hardy',
    authorSlug: 'thomas-hardy',
    date: '2024-01-15T10:30:00.000Z',
    genre: 'loss',
    likes: [],
    picture: '',
    poem: 'Rest there, rest, and see thy mother\'s face!\nBackward she turns to look upon thee;\nWarily she cometh near to thee.',
    title: 'The Going',
    userId: 'user-456',
    authorType: 'user'
}

const aiPoem: Poem = { ...basePoem, id: 'a1', slug: 'synthetic-grief', authorType: 'ai', author: 'AURA' }

function renderOnServer(poem: Poem): string {
    const { renderToString } = require('react-dom/server')
    return renderToString(<EmbedPoem poem={poem} />)
}

describe('embed card, server-rendered', () => {
    test('the attribution link is in the HTML before any JavaScript runs', () => {
        const html = renderOnServer(basePoem)

        // Canonicalised to the slug, not the id, for the same reason the detail
        // page is: a poem resolves by both, and the sitemap emits slugs.
        expect(html).toContain('href="https://poemunity.com/detail/the-going"')
    })

    test('the author link is there too, and it is absolute', () => {
        const html = renderOnServer(basePoem)

        expect(html).toContain('href="https://poemunity.com/authors/thomas-hardy"')
        expect(html).toContain('Thomas Hardy')
    })

    test('falls back to the id when the poem has no slug', () => {
        const { slug: _slug, ...withoutSlug } = basePoem
        const html = renderOnServer(withoutSlug as Poem)

        expect(html).toContain(`href="https://poemunity.com/detail/${basePoem.id}"`)
    })

    test('the AI badge rides on an AI poem, so the disclosure is not arrival-dependent', () => {
        const html = renderOnServer(aiPoem)

        expect(html).toContain('ai-badge')
        expect(html).toContain('AURA')
    })

    test('and it stays off a human poem — a distractor the test above cannot pass by accident', () => {
        const html = renderOnServer(basePoem)

        // Same fixture, one field different. If `authorType` were ignored and
        // the badge rendered unconditionally, this fails while the test above
        // still passes — two directions, so neither bug survives.
        expect(html).not.toContain('ai-badge')
        expect(html).toContain('Thomas Hardy')
    })

    test('EVERY link targets a new tab, or the reader is trapped in a 420px frame', () => {
        // This card never renders on poemunity.com. A normal navigation inside
        // it strands the reader in the iframe with no way back, and the host
        // page sees the click and loses the visitor.
        const html = renderOnServer(aiPoem)
        const anchors = html.match(/<a\s[^>]*>/g) || []

        expect(anchors.length).toBeGreaterThanOrEqual(3)
        for (const anchor of anchors) {
            expect(anchor).toContain('target="_blank"')
        }
    })

    test('the poem body is rendered as text, not shipped as JSON to draw later', () => {
        const html = renderOnServer(basePoem)

        expect(html).toContain('Backward she turns to look upon thee;')
    })
})
