import React from 'react'
import { render } from '@testing-library/react'
import DetailPage from '../../pages/detail/[poemId]'
import { SITEMAP_SECTIONS, isSitemapSection, renderSitemapIndex } from '../lib/sitemap'
import { Poem } from '../typescript/interfaces'

/**
 * FAMOUS POEMS ARE INDEXABLE AND IN THE SITEMAP — the mirror image of what this
 * file used to assert (it was `famousPoemNoindex.test.tsx` until 2026-11-18).
 *
 * 15,652 of 16,087 poems here are verbatim copies of poems on
 * poetryfoundation.org and poets.org. They were `noindex,follow` and out of the
 * sitemap from 2026-08-18; both were reversed on 2026-11-18.
 *
 * TWO THINGS THESE TESTS EXIST TO CATCH, both of which would look fine:
 *
 *   A ROUTE-LEVEL ROBOTS TAG. `/detail/[poemId]` serves all three origins. A
 *   `noIndex` on the ROUTE would deindex EVERY poem here — famous, human and AI
 *   alike — while the page still renders perfectly and every other test passes.
 *   So the fixtures below differ ONLY by `origin`, and none may emit a tag.
 *
 *   THE SITEMAP AND THE TAG FALLING OUT OF SYNC. A sitemap is a REQUEST TO
 *   INDEX, so listing URLs whose own response says `noindex` costs a crawl of
 *   each to discover the contradiction — which is exactly why the section left
 *   when the tag arrived. Reintroducing one without the other is the failure,
 *   so both halves are pinned in this one file.
 *
 * Note what is NOT asserted anywhere: that a poem disappears. It never did —
 * this was always about the request to rank, not about the content.
 */

const heads: React.ReactNode[] = []
jest.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
        heads.push(children)
        return null
    }
}))

jest.mock('../components/Detail/Detail', () => ({ __esModule: true, default: () => <div /> }))
jest.mock('../components/SimpleAccordion', () => ({ __esModule: true, default: () => null }))
jest.mock('../components/AuthorsAccordion', () => ({ __esModule: true, default: () => null }))
jest.mock('next/router', () => ({ useRouter: () => ({ query: {}, push: jest.fn() }) }))

type AnyElement = React.ReactElement<Record<string, unknown>>

const robots = () =>
    (heads.flat(Infinity) as unknown[])
        .filter((c): c is AnyElement => !!c && typeof c === 'object' && 'props' in (c as object))
        .find(tag => tag.props.name === 'robots')?.props.content as string | undefined

const poem = (origin?: Poem['origin']): Poem => ({
    id: 'p1',
    slug: 'aubade',
    title: 'Aubade',
    poem: 'verse',
    author: 'Ada Brine',
    date: '2026-01-01',
    genre: 'love',
    likes: [],
    picture: '',
    userId: 'u1',
    ...(origin && { origin })
}) as Poem

const renderPoem = (origin?: Poem['origin']) => {
    heads.length = 0
    render(
        <DetailPage
            initialPoem={poem(origin)}
            initialNextPoem={null}
            initialRelated={null}
            initialUser={null}
            baseUrl='https://poemunity.com'
            poemId='aubade'
        />
    )
}

describe('no poem is ever noindexed, whatever its origin', () => {
    // The distractor set. Every one of these passes a rendering test and a
    // snapshot while being wrong — only the robots tag catches them.

    test('a famous poem is indexable — the reversal of 2026-11-18', () => {
        renderPoem('famous')

        expect(robots()).toBeUndefined()
    })

    test('a human-written poem has no robots tag at all', () => {
        renderPoem('user')

        expect(robots()).toBeUndefined()
    })

    test('an AI poem is still indexable — that is a separate, undecided call', () => {
        renderPoem('ai')

        expect(robots()).toBeUndefined()
    })

    test('a poem with NO origin is indexable', () => {
        // Poems created through the ordinary form carry no origin. Treating
        // "absent" as anything other than permissive would be the same shape as
        // the drafts bug, where a missing field had to mean the safe value.
        renderPoem(undefined)

        expect(robots()).toBeUndefined()
    })
})

describe('the sitemap advertises the famous poems again', () => {
    test('there are four sections, poems-famous among them', () => {
        expect(SITEMAP_SECTIONS).toEqual(['pages', 'authors', 'poems-community', 'poems-famous'])
    })

    test('the index it renders lists exactly those four', () => {
        const xml = renderSitemapIndex('https://poemunity.com', SITEMAP_SECTIONS)

        expect(xml).toContain('/sitemaps/pages.xml')
        expect(xml).toContain('/sitemaps/authors.xml')
        expect(xml).toContain('/sitemaps/poems-community.xml')
        // THE COUPLING. The tag on the poem page and this entry have to move
        // together: the section left in 2026-08-18 precisely because those
        // pages answered `noindex`, and returned when the tag came off.
        expect(xml).toContain('/sitemaps/poems-famous.xml')
        expect(xml.match(/<sitemap>/g)).toHaveLength(4)
    })

    test('/sitemaps/poems-famous.xml is a valid section again', () => {
        // The route resolves the section through this guard, so this is what
        // decides whether the URL 404s or serves 15,652 entries.
        expect(isSitemapSection('poems-famous')).toBe(true)
        expect(isSitemapSection('poems-community')).toBe(true)
        // Unknown names still 404 — restoring one section must not loosen the
        // allowlist itself.
        expect(isSitemapSection('poems')).toBe(false)
    })
})
