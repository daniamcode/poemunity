import { genreStructuredData, authorStructuredData } from './structuredData'
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
