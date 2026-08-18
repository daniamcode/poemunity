import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { rootReducer } from '../redux/reducers/rootReducer'
import Dashboard from '../components/Dashboard/Dashboard'
import GenreIntro from '../components/GenreIntro/GenreIntro'
import { GENRE_INTROS, genreIntro } from '../data/genreIntros'
import { CATEGORIES, categoryToSlug } from '../data/constants'

/**
 * THE EDITORIAL GENRE INTRODUCTIONS.
 *
 * These exist because 97.3% of this site's poems are scraped famous ones that
 * cannot outrank their own source (docs/SEO_AUDIT.md). The genre pages are the
 * one surface that can rank on its own merits, and only if they carry text that
 * exists nowhere else. So the tests below fall into two groups:
 *
 *   THE CONTENT IS VALID — every genre slug is real, every curated poet link
 *   resolves, no paragraph is boilerplate. A curated list quietly full of 404s
 *   is worse than no curated list, and nothing else in the suite would notice.
 *
 *   IT APPEARS IN EXACTLY THE RIGHT PLACES — page 1 of a genre and nowhere
 *   else. Rendering it on all 125 pages of /love, or above three search
 *   results, converts the fix back into the problem.
 */

const mockRouter = { query: {} as Record<string, string>, push: jest.fn(), asPath: '/love' }
jest.mock('next/router', () => ({ useRouter: () => mockRouter }))

// The list itself is not under test here and pulls in infinite scroll,
// observers and network. The introduction is a sibling of it, not a child.
jest.mock('../components/List/List', () => ({
    __esModule: true,
    default: () => <div data-testid='list' />
}))
jest.mock('../components/Ranking/Ranking', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/PoemOfTheWeek/PoemOfTheWeek', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/AuthorsAccordion', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/Join/JoinPanel', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/Join/JoinLine', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/SimpleAccordion', () => ({ __esModule: true, default: () => null }))

describe('the curated poet links all resolve', () => {
    /**
     * Every `startHere` slug must be a real author page.
     *
     * This is the test that earns its place. The slugs were verified once by
     * hand against the live authors sitemap; nothing would re-verify them, and
     * a renamed author silently turns a curated recommendation into a 404 on
     * the most valuable page on the site.
     *
     * It runs against a snapshot of the production author slugs rather than the
     * network, so it is hermetic and cannot flake — the trade is that it
     * catches a slug that was WRONG WHEN WRITTEN, which is the realistic
     * failure, and not one retired later. `scripts/check-author-slugs.mjs`
     * re-checks against production when that matters.
     */
    const KNOWN_AUTHOR_SLUGS = new Set(require('../test-utils/authorSlugs.json') as string[])

    const allPoets = Object.entries(GENRE_INTROS).flatMap(([genre, intro]) =>
        intro.startHere.map(poet => ({ genre, ...poet }))
    )

    test.each(allPoets.map(p => [p.genre, p.slug, p.name] as const))(
        '%s → /authors/%s (%s) exists',
        (_genre, slug) => {
            expect(KNOWN_AUTHOR_SLUGS.has(slug)).toBe(true)
        }
    )

    test('the fixture is a real corpus, not an empty set that passes everything', () => {
        // The distractor. If authorSlugs.json were empty or failed to load, every
        // assertion above would fail — but if it were built FROM the intros it
        // would pass no matter what they contained.
        expect(KNOWN_AUTHOR_SLUGS.size).toBeGreaterThan(3000)
        expect(KNOWN_AUTHOR_SLUGS.has('definitely-not-a-poet-xyz')).toBe(false)
    })
})

describe('the written content is sound', () => {
    const entries = Object.entries(GENRE_INTROS)

    test('every category with poems in it is covered', () => {
        // 132 of the 143 entries in CATEGORIES. The eleven absentees all hold
        // ZERO poems (Easter, Wedding, Mother's Day, Valentine's Day and so
        // on): `/[genre]` already marks an empty genre `noindex`, so prose
        // there would be an essay over nothing — the exact thin-content shape
        // the introductions exist to avoid. They become one-line additions the
        // moment somebody publishes into them.
        expect(entries).toHaveLength(132)
    })

    test.each(entries.map(([slug]) => slug))('%s is a real category slug', slug => {
        // A typo here renders nothing at all, silently, forever: the component
        // looks the intro up BY slug, so `lonelyness` would simply never match.
        const known = new Set(CATEGORIES.map(categoryToSlug))
        expect(known.has(slug)).toBe(true)
    })

    test.each(entries)('%s is 60–350 words — long enough to say something', (_slug, intro) => {
        // LENGTH IS TIERED BY INVENTORY, deliberately. A genre holding 1,600
        // poems can carry three paragraphs; Kindness holds one poem, and 250
        // words above it would be an essay wearing a poem as a hat. The floor
        // is what stops an entry being added as a stub.
        const words = intro.body.join(' ').split(/\s+/).length
        expect(words).toBeGreaterThanOrEqual(60)
        expect(words).toBeLessThanOrEqual(350)
    })

    test.each(entries)('%s names four poets to start with', (_slug, intro) => {
        expect(intro.startHere).toHaveLength(4)
    })

    test('no paragraph is reused between genres', () => {
        // The boilerplate guard. Prose that could be swapped between two genres
        // without anyone noticing is filler, and filler at scale is the exact
        // signal this whole effort exists to escape.
        const paragraphs = entries.flatMap(([, intro]) => intro.body)
        expect(new Set(paragraphs).size).toBe(paragraphs.length)
    })

    test('each genre recommends a distinct set of poets', () => {
        // Poets legitimately recur across genres (Hardy is in three), but a
        // genre whose four names are identical to another's is not curation.
        const fingerprints = entries.map(([, intro]) =>
            intro.startHere.map(p => p.slug).sort().join(',')
        )
        expect(new Set(fingerprints).size).toBe(fingerprints.length)
    })
})

describe('where the introduction renders', () => {
    const store = () => configureStore({ reducer: rootReducer })

    const renderDashboard = (
        { genre, currentPage, q }: { genre?: string, currentPage?: number, q?: string }
    ) => {
        mockRouter.query = { ...(genre && { genre }), ...(q && { q }) }
        return render(
            <Provider store={store()}>
                <Dashboard
                    initialData={{ poems: [], page: 1, hasMore: false, total: 1247 } as never}
                    currentPage={currentPage}
                />
            </Provider>
        )
    }

    afterEach(() => { mockRouter.query = {} })

    test('page 1 of a covered genre shows it', () => {
        renderDashboard({ genre: 'love', currentPage: 1 })

        expect(screen.getByRole('heading', { name: 'About love poetry' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'John Donne' }))
            .toHaveAttribute('href', '/authors/john-donne')
        // The PROSE, not just the heading and the links. Without this the test
        // passes against a component that renders the frame and drops the one
        // thing on the page that exists nowhere else on the web.
        expect(screen.getByText(/the trap is the abstract noun/)).toBeInTheDocument()
    })

    test('only the LEAD paragraph is outside the disclosure', () => {
        // The layout complaint this design answers: fully expanded the block
        // was 564px and pushed the first poem to y=766. The reader must land on
        // context PLUS poems, so exactly one paragraph stays open.
        renderDashboard({ genre: 'love', currentPage: 1 })

        const details = document.querySelector('details')
        const lead = screen.getByText(/Love poetry is the oldest thing/)
        const second = screen.getByText(/the trap is the abstract noun/)

        expect(details).not.toBeNull()
        expect(details!.contains(lead)).toBe(false)
        expect(details!.contains(second)).toBe(true)
        // The curated links are behind it too — they are a "where to go next"
        // aid, not something to put above the poems.
        expect(details!.contains(screen.getByRole('link', { name: 'John Donne' }))).toBe(true)
    })

    test('the disclosure is closed on arrival and offers to open', () => {
        renderDashboard({ genre: 'love', currentPage: 1 })

        expect(document.querySelector('details')!.hasAttribute('open')).toBe(false)
        expect(screen.getByText('Read more')).toBeInTheDocument()
        // Both labels ship; CSS swaps them on [open], so the control cannot
        // claim it will do what it has already done.
        expect(screen.getByText('Show less')).toBeInTheDocument()
    })

    test('page 2 does NOT — 250 identical words across 125 URLs is boilerplate', () => {
        renderDashboard({ genre: 'love', currentPage: 2 })

        expect(screen.queryByRole('heading', { name: 'About love poetry' })).not.toBeInTheDocument()
    })

    test('a search result does NOT — the essay would not describe what is below it', () => {
        renderDashboard({ genre: 'love', currentPage: 1, q: 'donne' })

        expect(screen.queryByRole('heading', { name: 'About love poetry' })).not.toBeInTheDocument()
    })

    test('the homepage does NOT — it has no genre', () => {
        renderDashboard({ currentPage: 1 })

        expect(screen.queryByRole('heading', { name: /^About / })).not.toBeInTheDocument()
    })

    test('a genre with no introduction written renders no empty shell', () => {
        // The eleven uncovered categories are the ones holding ZERO poems, so
        // this is also the case where a stray heading would sit above nothing
        // at all — the soft-404 shape. `wedding` is one of them; if somebody
        // publishes a wedding poem AND writes the intro, this test will say so
        // rather than silently testing nothing.
        renderDashboard({ genre: 'wedding', currentPage: 1 })

        expect(screen.queryByRole('heading', { name: /^About / })).not.toBeInTheDocument()
        expect(screen.queryByText('Start here')).not.toBeInTheDocument()
    })

    test('the expanded disclosure collapses when you navigate to another genre', () => {
        // `<details open>` is DOM state, not React state, so React carries it
        // across a client-side navigation: expanding /love and clicking through
        // to /grief landed the reader mid-essay on a genre they never opened.
        // Fixed with a key on the genre; this is the guard.
        const { rerender } = renderDashboard({ genre: 'love', currentPage: 1 })
        document.querySelector('details')!.open = true

        mockRouter.query = { genre: 'grief' }
        rerender(
            <Provider store={store()}>
                <Dashboard
                    initialData={{ poems: [], page: 1, hasMore: false, total: 341 } as never}
                    currentPage={1}
                />
            </Provider>
        )

        expect(screen.getByRole('heading', { name: 'About grief poetry' })).toBeInTheDocument()
        expect(document.querySelector('details')!.open).toBe(false)
    })

    test('mother and father override the awkward default heading', () => {
        renderDashboard({ genre: 'mother', currentPage: 1 })

        expect(screen.getByRole('heading', { name: 'About poems for mothers' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'About mother poetry' })).not.toBeInTheDocument()
    })
})

describe('the crawler sees it in the server-rendered HTML', () => {
    /**
     * The whole point is that this text is in the markup Googlebot reads. RTL
     * cannot prove that — `render()` runs effects and hydrates — so this is a
     * `renderToString` check, the same guard List.ssr.test.tsx and
     * Authors.ssr.test.tsx exist for.
     */
    // jsdom ships no TextEncoder, which react-dom/server needs — the same
    // two lines List.ssr.test.tsx and Authors.ssr.test.tsx open with. Assigned
    // before the lazy require below, which is why react-dom/server is not
    // imported at module scope.
    const { TextEncoder, TextDecoder } = require('util')
    ;(global as never as Record<string, unknown>).TextEncoder ??= TextEncoder
    ;(global as never as Record<string, unknown>).TextDecoder ??= TextDecoder

    const ssr = (node: React.ReactElement) =>
        (require('react-dom/server') as typeof import('react-dom/server')).renderToString(node)

    test('the prose and the curated links are in the SSR output', () => {
        const html = ssr(<GenreIntro genre='grief' label='Grief' />)

        expect(html).toContain('Donald Hall')
        expect(html).toContain('/authors/donald-hall')
        // A distinctive clause from the body — proves the PROSE shipped, not
        // just the heading and the link list.
        expect(html).toContain('declines to be consoled')
    })

    test('the COLLAPSED half is server-rendered too, not fetched on click', () => {
        // The load-bearing assertion for the whole disclosure design. Collapsed
        // is a presentation state; if the hidden paragraphs and the curated
        // links were only added on expand, the one text on this site that
        // exists nowhere else would be invisible to a crawler and the entire
        // exercise would be pointless. `declines to be consoled` and the
        // Start-here links all live inside <details>.
        const html = ssr(<GenreIntro genre='grief' label='Grief' />)

        expect(html).toContain('<details')
        expect(html).toContain('declines to be consoled')
        expect(html).toContain('Start here')
        expect(html).toContain('/authors/jane-kenyon')
        // And NOT open by default — that would defeat the point of collapsing.
        expect(html).not.toMatch(/<details[^>]*\sopen/)
    })

    test('an uncovered genre server-renders nothing at all', () => {
        expect(ssr(<GenreIntro genre='wedding' label='Wedding' />)).toBe('')
    })
})

describe('genreIntro()', () => {
    test('returns null rather than undefined for an unknown slug', () => {
        expect(genreIntro('not-a-genre')).toBeNull()
    })

    test('is not fooled by inherited Object properties', () => {
        // `GENRE_INTROS[slug]` on a plain object resolves 'constructor' and
        // 'toString' to functions, which are truthy — so `/constructor` would
        // have rendered an introduction built from Object.prototype.
        expect(genreIntro('constructor')).toBeNull()
        expect(genreIntro('toString')).toBeNull()
    })
})
