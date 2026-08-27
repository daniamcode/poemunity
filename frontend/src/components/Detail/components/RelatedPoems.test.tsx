import { render, screen, within } from '@testing-library/react'
import { RelatedPoems } from './RelatedPoems'
import { RelatedPoem, RelatedPoemsResponse } from '../hooks/useRelatedPoems'

// The module that stops a poem page being a dead end. Its whole value is the
// LINKS, so every assertion here is about hrefs and about what a reader is
// promised on the way to them.
//
// Fixtures keep `id` and `slug` deliberately different, for the reason
// src/test-utils/fixtures.ts documents: one value playing two roles makes a
// whole class of bug untestable, and did once already.

jest.mock('next/link', () => {
    const Link = ({ children, href, ...rest }: Record<string, never>) => <a href={href} {...rest}>{children}</a>
    Link.displayName = 'Link'
    return Link
})

const poem = (overrides: Partial<RelatedPoem> = {}): RelatedPoem => ({
    id: '69f0cb2d9496d1ecf2660f6c',
    slug: 'rock-of-my-salvation',
    title: 'Rock of My Salvation',
    author: 'Mordecai ben Isaac',
    authorSlug: 'mordecai-ben-isaac',
    genre: 'faith',
    ...overrides
})

const related = (overrides: Partial<RelatedPoemsResponse> = {}): RelatedPoemsResponse => ({
    byAuthor: [],
    byGenre: [],
    ...overrides
})

const hrefsIn = (heading: RegExp) =>
    within(screen.getByRole('region', { name: heading }))
        .getAllByRole('link')
        .map(link => link.getAttribute('href'))

describe('RelatedPoems', () => {
    test('links each poem by SLUG, not by id', () => {
        render(
            <RelatedPoems
                related={related({ byAuthor: [poem({ id: 'aaa111', slug: 'the-going', title: 'The Going' })] })}
                authorName='Thomas Hardy'
                authorSlug='thomas-hardy'
                genre='love'
            />
        )

        expect(screen.getByRole('link', { name: 'The Going' })).toHaveAttribute(
            'href', '/detail/the-going'
        )
    })

    test('falls back to the id for a poem with no slug', () => {
        render(
            <RelatedPoems
                related={related({ byAuthor: [poem({ id: 'aaa111', slug: undefined, title: 'Untitled' })] })}
                authorName='Thomas Hardy'
            />
        )

        expect(screen.getByRole('link', { name: 'Untitled' })).toHaveAttribute('href', '/detail/aaa111')
    })

    test('names the author in the heading, and does not repeat it on every row', () => {
        render(
            <RelatedPoems
                related={related({
                    byAuthor: [
                        poem({ id: 'a1', slug: 'the-going', title: 'The Going', author: 'Thomas Hardy' }),
                        poem({ id: 'a2', slug: 'the-voice', title: 'The Voice', author: 'Thomas Hardy' })
                    ]
                })}
                authorName='Thomas Hardy'
                authorSlug='thomas-hardy'
            />
        )

        expect(screen.getByRole('heading', { name: 'More by Thomas Hardy' })).toBeInTheDocument()
        // Naming the same poet under all six titles is noise on screen and in a
        // screen reader; the heading already said it.
        expect(screen.getByRole('link', { name: 'The Going' })).toBeInTheDocument()
        // Scoped to the rows: the "see all" link legitimately says the name.
        const rows = within(screen.getByRole('region', { name: /More by Thomas Hardy/ })).getAllByRole('listitem')
        rows.forEach(row => expect(row).not.toHaveTextContent(/by Thomas Hardy/))
    })

    test('names the author on every genre row, where they differ', () => {
        render(
            <RelatedPoems
                related={related({
                    byGenre: [
                        poem({ id: 'g1', slug: 'the-going', title: 'The Going', author: 'Thomas Hardy' }),
                        poem({ id: 'g2', slug: 'ariel', title: 'Ariel', author: 'Sylvia Plath' })
                    ]
                })}
                genre='love'
            />
        )

        expect(screen.getByRole('link', { name: 'The Going by Thomas Hardy' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Ariel by Sylvia Plath' })).toBeInTheDocument()
    })

    test('turns a genre slug into its display name in the heading and the link', () => {
        render(
            <RelatedPoems
                related={related({ byGenre: [poem({ id: 'g1', slug: 'ariel', title: 'Ariel' })] })}
                genre='love'
            />
        )

        expect(screen.getByRole('heading', { name: 'More Love poems' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'All Love poems' })).toHaveAttribute('href', '/love')
    })

    test('links on to the author page and the genre page — the two hubs above this poem', () => {
        render(
            <RelatedPoems
                related={related({
                    byAuthor: [poem({ id: 'a1', slug: 'the-going', title: 'The Going' })],
                    byGenre: [poem({ id: 'g1', slug: 'ariel', title: 'Ariel' })]
                })}
                authorName='Thomas Hardy'
                authorSlug='thomas-hardy'
                genre='love'
            />
        )

        expect(hrefsIn(/More by Thomas Hardy/)).toContain('/authors/thomas-hardy')
        expect(hrefsIn(/More Love poems/)).toContain('/love')
    })

    test('omits the "see all" link when there is no page to send the reader to', () => {
        render(
            <RelatedPoems
                related={related({ byAuthor: [poem({ id: 'a1', slug: 'the-going', title: 'The Going' })] })}
                authorName='Thomas Hardy'
                authorSlug={undefined}
            />
        )

        expect(screen.queryByRole('link', { name: /All poems by/ })).not.toBeInTheDocument()
        // The poem links still work — a missing author slug loses the hub link,
        // not the module.
        expect(screen.getByRole('link', { name: 'The Going' })).toBeInTheDocument()
    })

    test('badges an AI author, and leaves a human one unbadged', () => {
        render(
            <RelatedPoems
                related={related({
                    byGenre: [
                        poem({ id: 'g1', slug: 'circuit', title: 'Circuit', author: 'Muse', authorType: 'ai' }),
                        poem({ id: 'g2', slug: 'ariel', title: 'Ariel', author: 'Sylvia Plath', authorType: 'user' })
                    ]
                })}
                genre='love'
            />
        )

        // The disclosure must not depend on which page names the author.
        expect(screen.getAllByText('AI')).toHaveLength(1)
    })

    test('drops the poem the Next-poem card already offers', () => {
        // The walk continues with the same author, so its destination is
        // normally the first row here — the identical title twice on one
        // screen, four lines apart, as though they were two poems.
        render(
            <RelatedPoems
                related={related({
                    byAuthor: [
                        poem({ id: 'a1', slug: 'feasting', title: 'Feasting' }),
                        poem({ id: 'a2', slug: 'the-bridal-shop', title: 'At the Bridal Shop' })
                    ],
                    byGenre: [poem({ id: 'g1', slug: 'feasting', title: 'Feasting' })]
                })}
                authorName='Joseph O. Legaspi'
                authorSlug='joseph-o-legaspi'
                genre='mother'
                excludeHref='/detail/feasting'
            />
        )

        expect(screen.queryByRole('link', { name: /^Feasting/ })).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'At the Bridal Shop' })).toBeInTheDocument()
        // Dropping the last poem of a group drops the group, not just the row —
        // a heading over nothing is the shape this module exists to avoid.
        expect(screen.queryByRole('heading', { name: /More Mother poems/ })).not.toBeInTheDocument()
    })

    test('renders NOTHING when the only poems on offer are the next one', () => {
        const { container } = render(
            <RelatedPoems
                related={related({ byAuthor: [poem({ id: 'a1', slug: 'feasting', title: 'Feasting' })] })}
                authorName='Joseph O. Legaspi'
                excludeHref='/detail/feasting'
            />
        )

        expect(container).toBeEmptyDOMElement()
    })

    test('renders NOTHING when both lists are empty', () => {
        const { container } = render(
            <RelatedPoems related={related()} authorName='Thomas Hardy' genre='love' />
        )

        // A heading over no poems is the soft-404 shape, and it tells a reader
        // only that there is nothing here.
        expect(container).toBeEmptyDOMElement()
    })

    test('renders only the group that has poems', () => {
        render(
            <RelatedPoems
                related={related({ byGenre: [poem({ id: 'g1', slug: 'ariel', title: 'Ariel' })] })}
                authorName='Thomas Hardy'
                genre='love'
            />
        )

        expect(screen.queryByRole('heading', { name: /More by Thomas Hardy/ })).not.toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'More Love poems' })).toBeInTheDocument()
    })
})
