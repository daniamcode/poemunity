import { render, screen } from '@testing-library/react'
import { Breadcrumbs } from './Breadcrumbs'
import { breadcrumbStructuredData } from '../utils/structuredData'

const heads: React.ReactNode[] = []
jest.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => {
        heads.push(children)
        return null
    }
}))

const BASE = 'https://poemunity.com'
const CRUMBS = [
    { name: 'Poemunity', path: '/' },
    { name: 'Love poems', path: '/love' },
    { name: 'The moon and the sun' }
]

describe('breadcrumbStructuredData', () => {
    test('numbers the trail from 1, as schema.org requires', () => {
        const data = breadcrumbStructuredData(CRUMBS, BASE)

        expect(data['@type']).toBe('BreadcrumbList')
        expect(data.itemListElement).toMatchObject([
            { position: 1, name: 'Poemunity', item: `${BASE}/` },
            { position: 2, name: 'Love poems', item: `${BASE}/love` },
            { position: 3, name: 'The moon and the sun' }
        ])
    })

    // The current page is not a link on screen, so it carries no `item` in the
    // markup either. Google accepts both forms; matching the visible state is
    // the one that stays honest.
    test('the final crumb has no item', () => {
        const data = breadcrumbStructuredData(CRUMBS, BASE)
        const last = (data.itemListElement as Record<string, unknown>[])[2]

        expect(last).not.toHaveProperty('item')
    })
})

describe('Breadcrumbs', () => {
    beforeEach(() => { heads.length = 0 })

    test('renders the trail as a labelled nav', () => {
        render(<Breadcrumbs crumbs={CRUMBS} baseUrl={BASE} />)

        expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Poemunity' })).toHaveAttribute('href', '/')
        expect(screen.getByRole('link', { name: 'Love poems' })).toHaveAttribute('href', '/love')
    })

    test('the current page is text, not a link, and says so', () => {
        render(<Breadcrumbs crumbs={CRUMBS} baseUrl={BASE} />)

        expect(screen.queryByRole('link', { name: 'The moon and the sun' })).not.toBeInTheDocument()
        expect(screen.getByText('The moon and the sun')).toHaveAttribute('aria-current', 'page')
    })

    // A trail of one is just the page you are on.
    test('renders nothing for a single crumb', () => {
        const { container } = render(<Breadcrumbs crumbs={[{ name: 'Poemunity' }]} baseUrl={BASE} />)

        expect(container).toBeEmptyDOMElement()
        expect(heads).toHaveLength(0)
    })

    test('emits the markup alongside the visible trail', () => {
        render(<Breadcrumbs crumbs={CRUMBS} baseUrl={BASE} />)

        expect(heads).toHaveLength(1)
    })
})
