import {
    genreStructuredData,
    authorStructuredData,
    poemStructuredData,
    websiteStructuredData,
    organizationStructuredData,
    authorsIndexStructuredData
} from './structuredData'
import { Poem } from '../typescript/interfaces'

const poem = (over: Partial<Poem> & { id: string }): Poem => ({
    author: 'Ana Gil',
    date: '2024-01-15T10:30:00.000Z',
    genre: 'love',
    likes: [],
    picture: '',
    poem: 'content',
    title: `Title ${over.id}`,
    userId: 'user-1',
    ...over
})

const BASE = 'https://poemunity.com'

describe('genreStructuredData', () => {
    const build = (poems?: Poem[]) =>
        genreStructuredData({
            label: 'Love',
            description: 'Read 46 love poems on Poemunity.',
            url: `${BASE}/love`,
            baseUrl: BASE,
            poems
        })

    test('describes the page as a CollectionPage on this site', () => {
        const data = build()

        expect(data['@context']).toBe('https://schema.org')
        expect(data['@type']).toBe('CollectionPage')
        expect(data.url).toBe(`${BASE}/love`)
        expect(data.isPartOf).toMatchObject({ '@type': 'WebSite', name: 'Poemunity' })
    })

    test('lists the rendered poems in order, 1-based as schema.org requires', () => {
        const data = build([
            poem({ id: 'p1', title: 'First', slug: 'first-gil' }),
            poem({ id: 'p2', title: 'Second' })
        ])

        expect(data.mainEntity).toMatchObject({
            '@type': 'ItemList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'First', url: `${BASE}/detail/first-gil` },
                { '@type': 'ListItem', position: 2, name: 'Second', url: `${BASE}/detail/p2` }
            ]
        })
    })

    // Structured data must describe what the page actually shows. Listing more
    // than was rendered is a spam-policy violation, not an optimisation.
    test('lists only the poems the page rendered, never the total', () => {
        const data = build([poem({ id: 'p1' })])

        expect((data.mainEntity as { itemListElement: unknown[] }).itemListElement).toHaveLength(1)
    })

    test('skips entries with no title rather than emitting blanks', () => {
        const data = build([poem({ id: 'p1', title: '' }), poem({ id: 'p2', title: 'Real' })])

        const items = (data.mainEntity as { itemListElement: { name: string }[] }).itemListElement
        expect(items).toHaveLength(1)
        expect(items[0].name).toBe('Real')
    })
})

describe('authorStructuredData', () => {
    const build = (over: Partial<Parameters<typeof authorStructuredData>[0]> = {}) =>
        authorStructuredData({
            name: 'John Doe',
            description: '35 poems by John Doe on Poemunity.',
            url: `${BASE}/authors/john-doe`,
            baseUrl: BASE,
            ...over
        })

    test('describes the collection and names the author as a Person', () => {
        const data = build({ bio: 'Grew up in Cádiz.', image: `${BASE}/pic.jpg` })

        expect(data['@type']).toBe('CollectionPage')
        expect(data.author).toMatchObject({
            '@type': 'Person',
            name: 'John Doe',
            description: 'Grew up in Cádiz.',
            image: `${BASE}/pic.jpg`
        })
    })

    test('omits empty optional fields instead of emitting null', () => {
        const data = build()

        expect(data.author).toEqual({ '@type': 'Person', name: 'John Doe', url: `${BASE}/authors/john-doe` })
    })

    // The site discloses AI activity in the footer and badges every AI poem and
    // comment. Emitting Person for a generated account would assert in
    // machine-readable form that a human exists — undoing exactly that.
    describe('AI personas', () => {
        test('get no Person entity', () => {
            const data = build({ authorType: 'ai', bio: 'A generated voice.' })

            expect(data.author).toBeUndefined()
        })

        test('still get the collection describing their poems', () => {
            const data = build({ authorType: 'ai', poems: [poem({ id: 'p1', title: 'Machine Verse' })] })

            expect(data['@type']).toBe('CollectionPage')
            expect((data.mainEntity as { itemListElement: unknown[] }).itemListElement).toHaveLength(1)
        })

        test.each(['user', 'famous', undefined, null])('%s authors keep the Person', type => {
            const data = build({ authorType: type as string })

            expect(data.author).toMatchObject({ '@type': 'Person' })
        })
    })
})

describe('poemStructuredData', () => {
    const build = (over: Partial<Poem> = {}) =>
        poemStructuredData({
            poem: poem({ id: 'p1', title: 'The Sound of Rain', slug: 'rain-gil', ...over }),
            url: `${BASE}/detail/rain-gil`,
            baseUrl: BASE
        })

    // schema.org has an exact type for this, so there is no reason to describe
    // a poem as a generic Article.
    test('uses the Poem type', () => {
        expect(build()['@type']).toBe('Poem')
    })

    test('carries the poem text, genre and publication date', () => {
        const data = build({ poem: 'I miss you like the moon.', genre: 'love', date: '2024-01-15T10:30:00.000Z' })

        expect(data.text).toBe('I miss you like the moon.')
        expect(data.genre).toBe('love')
        expect(data.datePublished).toBe('2024-01-15T10:30:00.000Z')
    })

    // Visible in the footer as "N Likes", so the markup stays honest.
    test('reports the like count', () => {
        const data = build({ likes: ['a', 'b', 'c'] })

        expect(data.interactionStatistic).toMatchObject({
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/LikeAction',
            userInteractionCount: 3
        })
    })

    test('reports zero likes rather than omitting the counter', () => {
        expect(build({ likes: [] })).toMatchObject({
            interactionStatistic: { userInteractionCount: 0 }
        })
    })

    // Lazy-loaded, so the count is unknown at render time. Inventing one is
    // worse than leaving an optional field out.
    test('omits commentCount, which is not known at render time', () => {
        expect(build()).not.toHaveProperty('commentCount')
    })

    describe('authorship', () => {
        test('links the author to their page', () => {
            const data = build({ author: 'Ana Gil', authorSlug: 'ana-gil' })

            expect(data.author).toMatchObject({
                '@type': 'Person',
                name: 'Ana Gil',
                url: `${BASE}/authors/ana-gil`
            })
        })

        test('derives the slug when the poem carries none, matching the visible link', () => {
            const data = build({ author: 'Ana Gil', authorSlug: undefined })

            expect(data.author).toMatchObject({ url: `${BASE}/authors/ana-gil` })
        })

        // Same rule as the author pages: no machine-readable claim that a human
        // wrote this.
        test('emits no Person for an AI poem', () => {
            const data = build({ authorType: 'ai' })

            expect(data.author).toBeUndefined()
            expect(data['@type']).toBe('Poem')
        })
    })
})

describe('websiteStructuredData', () => {
    const data = websiteStructuredData(BASE)

    test('describes the site, not a page', () => {
        expect(data['@type']).toBe('WebSite')
        expect(data.url).toBe(BASE)
    })

    // The one part of the site-level markup with a visible payoff: this is what
    // can earn a sitelinks searchbox on the results page.
    test('declares a SearchAction pointing at the search URL the site really has', () => {
        // Not a guess at a conventional path: `/?q=` is what the homepage
        // search bar produces, and markup naming an endpoint the site does not
        // serve is a claim rather than a description.
        expect(data.potentialAction).toMatchObject({
            '@type': 'SearchAction',
            target: { urlTemplate: `${BASE}/?q={search_term_string}` },
            'query-input': 'required name=search_term_string'
        })
    })
})

describe('organizationStructuredData', () => {
    test('names the publisher and the logo the site actually serves', () => {
        const data = organizationStructuredData(BASE)

        expect(data['@type']).toBe('Organization')
        expect(data.logo).toBe(`${BASE}/og-image.png`)
    })
})

describe('authorsIndexStructuredData', () => {
    const authors = [
        { slug: 'ada-brine', name: 'Ada Brine' },
        { slug: 'milo-vance', name: 'Milo Vance' }
    ]

    const build = (over: Partial<Parameters<typeof authorsIndexStructuredData>[0]> = {}) =>
        authorsIndexStructuredData({
            letter: 'A',
            description: 'Poets whose name begins with A.',
            url: `${BASE}/authors`,
            baseUrl: BASE,
            authors,
            ...over
        })

    test('lists the authors the page rendered, addressed by slug', () => {
        const list = (build().mainEntity as { itemListElement: Record<string, unknown>[] })

        // Slug and name deliberately differ in the fixture: the URL is built
        // from the slug and the label from the name.
        expect(list.itemListElement).toEqual([
            { '@type': 'ListItem', position: 1, url: `${BASE}/authors/ada-brine`, name: 'Ada Brine' },
            { '@type': 'ListItem', position: 2, url: `${BASE}/authors/milo-vance`, name: 'Milo Vance' }
        ])
    })

    test('claims nothing when the page rendered nobody', () => {
        const list = (build({ authors: [] }).mainEntity as { itemListElement: unknown[] })

        expect(list.itemListElement).toEqual([])
    })

    // The index mixes real users, famous poets and AI personas, and `Person`
    // asserts in machine-readable form that a human exists — the claim the AI
    // disclosure exists to prevent. Flat ListItems say only "this page links
    // here", which is true of all three kinds.
    test('emits no Person entity for anyone on the list', () => {
        expect(JSON.stringify(build())).not.toContain('Person')
    })
})
