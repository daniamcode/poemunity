import React from 'react'
import { render, screen } from '@testing-library/react'
import AuthorIntro from '../components/AuthorIntro/AuthorIntro'
import { AUTHOR_INTROS, authorIntro } from '../data/authorIntros'

/**
 * EDITORIAL INTRODUCTIONS ON AUTHOR PAGES.
 *
 * The author-page counterpart to genreIntros.test.tsx, scoped to the 40 poets
 * with 30 or more poems here. Most of these assertions mirror that file. Two
 * do not, and they are the reason this suite exists separately:
 *
 *   NO AI PERSONA MAY EVER GET ONE. Three of them clear the threshold —
 *   emily-hart (38 poems), sadie-monroe (35) and thomas-walker (30) — and prose
 *   introducing one of them as a poet would assert in plain English the thing
 *   the AI badge, the footer disclosure and the deliberate absence of a
 *   `Person` entity in their structured data all exist to deny. This is a
 *   truthfulness rule, not a styling one.
 *
 *   AND THE GUARD IS AN ALLOWLIST. `authorType !== 'famous'` rather than
 *   `=== 'ai'`, so a fourth author kind, or a profile response that omits the
 *   field, renders nothing rather than something.
 */

const KNOWN_AUTHOR_SLUGS = new Set(require('../test-utils/authorSlugs.json') as string[])

/** The three AI personas that clear the 30-poem threshold this file is scoped to. */
const AI_PERSONAS = ['emily-hart', 'sadie-monroe', 'thomas-walker']

describe('no AI persona is ever introduced as a poet', () => {
    test.each(AI_PERSONAS)('%s has no entry in the data', slug => {
        expect(authorIntro(slug)).toBeNull()
    })

    test.each(AI_PERSONAS)('%s renders nothing even if data existed', slug => {
        // The SECOND, independent defence. The data guard above fails open —
        // add an entry and it renders — while this one fails closed. They fail
        // in opposite directions on purpose.
        const { container } = render(
            <AuthorIntro slug={slug} name='Emily Hart' authorType='ai' />
        )

        expect(container.innerHTML).toBe('')
    })

    test('a famous poet whose type says ai renders nothing', () => {
        // The guard is on the TYPE, not the slug list — so mislabelled data
        // errs towards silence rather than towards a claim.
        const { container } = render(
            <AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType='ai' />
        )

        expect(container.innerHTML).toBe('')
    })
})

describe('the guard is an allowlist', () => {
    test.each([
        ['a registered user', 'user'],
        ['an unknown future kind', 'collective'],
        ['an empty string', ''],
        ['a missing type', undefined]
    ])('%s renders nothing', (_label, authorType) => {
        const { container } = render(
            <AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType={authorType} />
        )

        expect(container.innerHTML).toBe('')
    })

    test('only famous renders', () => {
        render(<AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType='famous' />)

        expect(screen.getByRole('heading', { name: 'About Emily Dickinson' })).toBeInTheDocument()
    })
})

describe('the written content is sound', () => {
    const entries = Object.entries(AUTHOR_INTROS)

    test('forty poets are covered — every author with 30+ poems, minus the AI ones', () => {
        expect(entries).toHaveLength(40)
    })

    test.each(entries.map(([slug]) => slug))('%s is a real author page', slug => {
        // A typo renders nothing at all, silently and forever: the component
        // looks the intro up BY slug.
        expect(KNOWN_AUTHOR_SLUGS.has(slug)).toBe(true)
    })

    test('the fixture is a real corpus, not an empty set that passes everything', () => {
        expect(KNOWN_AUTHOR_SLUGS.size).toBeGreaterThan(3000)
        expect(KNOWN_AUTHOR_SLUGS.has('definitely-not-a-poet-xyz')).toBe(false)
    })

    const allLinks = entries.flatMap(([slug, intro]) =>
        intro.readNext.map(poet => ({ from: slug, ...poet }))
    )

    test.each(allLinks.map(l => [l.from, l.slug] as const))(
        '%s → /authors/%s resolves',
        (_from, slug) => {
            expect(KNOWN_AUTHOR_SLUGS.has(slug)).toBe(true)
        }
    )

    test('no poet is recommended to read next after themselves', () => {
        const selfRefs = entries.filter(([slug, intro]) =>
            intro.readNext.some(p => p.slug === slug)
        )

        expect(selfRefs.map(([slug]) => slug)).toEqual([])
    })

    test.each(entries)('%s is 60–350 words', (_slug, intro) => {
        const words = intro.body.join(' ').split(/\s+/).length
        expect(words).toBeGreaterThanOrEqual(60)
        expect(words).toBeLessThanOrEqual(350)
    })

    test.each(entries)('%s names three poets to read next', (_slug, intro) => {
        expect(intro.readNext).toHaveLength(3)
    })

    test('no paragraph is reused between poets', () => {
        // The boilerplate guard. Prose swappable between two poets is filler,
        // and filler is the signal this whole effort exists to escape.
        const paragraphs = entries.flatMap(([, intro]) => intro.body)
        expect(new Set(paragraphs).size).toBe(paragraphs.length)
    })

    test('no AI persona appears even as a read-next recommendation', () => {
        // The subtler version of the same rule: linking a persona from a real
        // poet's page under "Read next" presents it as a peer.
        const recommended = new Set(allLinks.map(l => l.slug))

        AI_PERSONAS.forEach(p => expect(recommended.has(p)).toBe(false))
    })
})

describe('the crawler sees it in the server-rendered HTML', () => {
    const { TextEncoder, TextDecoder } = require('util')
    ;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
    ;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

    const ssr = (node: React.ReactElement) =>
        (require('react-dom/server') as typeof import('react-dom/server')).renderToString(node)

    test('the collapsed half is server-rendered, not fetched on expand', () => {
        const html = ssr(
            <AuthorIntro slug='emily-dickinson' name='Emily Dickinson' authorType='famous' />
        )

        expect(html).toContain('<details')
        expect(html).not.toMatch(/<details[^>]*\sopen/)
        // A distinctive clause from the second paragraph, which is collapsed.
        expect(html).toContain('flat curiosity of a witness')
        expect(html).toContain('/authors/walt-whitman')
    })

    test('an AI persona server-renders nothing at all', () => {
        expect(ssr(<AuthorIntro slug='emily-hart' name='Emily Hart' authorType='ai' />)).toBe('')
    })
})

describe('authorIntro()', () => {
    test('returns null for an unknown slug', () => {
        expect(authorIntro('not-a-poet')).toBeNull()
    })

    test('is not fooled by inherited Object properties', () => {
        expect(authorIntro('constructor')).toBeNull()
        expect(authorIntro('toString')).toBeNull()
    })
})
