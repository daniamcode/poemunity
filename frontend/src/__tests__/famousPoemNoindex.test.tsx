import React from 'react'
import { render } from '@testing-library/react'
import DetailPage from '../../pages/detail/[poemId]'
import { SITEMAP_SECTIONS, isSitemapSection, renderSitemapIndex } from '../lib/sitemap'
import { Poem } from '../typescript/interfaces'

/**
 * FAMOUS POEMS ARE noindex,follow AND OUT OF THE SITEMAP.
 *
 * 15,652 of 16,087 poems here are verbatim copies of poems on
 * poetryfoundation.org and poets.org. They cannot outrank their own source, and
 * Search Console already agrees — 17,349 URLs sit at "Discovered — currently
 * not indexed". docs/SEO_AUDIT.md has the measurement.
 *
 * TWO THINGS THESE TESTS EXIST TO CATCH, both of which would look fine:
 *
 *   A ROUTE-LEVEL RULE. `/detail/[poemId]` serves all three origins. Marking
 *   the ROUTE noindex would deindex the 19 human poems and 416 AI ones — the
 *   only pages worth rescuing — while the page still renders perfectly and
 *   every other test passes. So the fixtures below differ ONLY by `origin`.
 *
 *   nofollow INSTEAD OF follow. Both spellings are "noindex" to a casual read,
 *   and the audit measured 16,087 poems arranged as a single linked list. If
 *   these pages stop passing links, deindexing them also severs the paths
 *   through them.
 *
 * Note what is NOT asserted anywhere: that the poem disappears. It does not.
 * This withdraws a request to rank, not the content.
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
            initialUser={null}
            baseUrl='https://poemunity.com'
            poemId='aubade'
        />
    )
}

describe('a famous poem is noindex,follow', () => {
    test('it is noindex', () => {
        renderPoem('famous')

        expect(robots()).toBe('noindex,follow')
    })

    test('specifically follow, not nofollow — the link graph must survive', () => {
        renderPoem('famous')

        expect(robots()).not.toContain('nofollow')
    })
})

describe('everything written HERE stays indexable', () => {
    // The distractor set. A route-level noindex passes every rendering test and
    // fails only these — which is the entire point of the change.
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
        // "absent" as famous would deindex every poem a real user publishes
        // from now on — the same shape as the drafts bug, where a missing field
        // had to mean the permissive value.
        renderPoem(undefined)

        expect(robots()).toBeUndefined()
    })
})

describe('the sitemap no longer advertises the famous poems', () => {
    test('there are three sections, and poems-famous is not one', () => {
        expect(SITEMAP_SECTIONS).toEqual(['pages', 'authors', 'poems-community'])
    })

    test('the index it renders lists exactly those three', () => {
        const xml = renderSitemapIndex('https://poemunity.com', SITEMAP_SECTIONS)

        expect(xml).toContain('/sitemaps/poems-community.xml')
        expect(xml).toContain('/sitemaps/authors.xml')
        expect(xml).toContain('/sitemaps/pages.xml')
        // The assertion that matters: asking Google to index 15,652 URLs whose
        // own response says noindex is a contradiction that costs a crawl each.
        expect(xml).not.toContain('poems-famous')
        expect(xml.match(/<sitemap>/g)).toHaveLength(3)
    })

    test('/sitemaps/poems-famous.xml is no longer a valid section', () => {
        // The route resolves the section through this guard, so a stale
        // submitted URL 404s rather than quietly serving the old file.
        expect(isSitemapSection('poems-famous')).toBe(false)
        expect(isSitemapSection('poems-community')).toBe(true)
    })
})
