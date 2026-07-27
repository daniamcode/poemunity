import { render } from '@testing-library/react'
import { SeoHead } from './SeoHead'

// next/head defers children into <head> via a side effect that doesn't run in
// jsdom; render the children inline so we can assert on the emitted meta tags.
jest.mock('next/head', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>
}))

function metaContent(container: HTMLElement, selector: string): string | null {
    return container.querySelector(selector)?.getAttribute('content') ?? null
}

describe('SeoHead social image URLs', () => {
    // The core regression: scrapers ignore relative og:image/twitter:image, so
    // the card renders blank. Both MUST be absolute.
    test('the default og:image and twitter:image are absolute URLs', () => {
        const { container } = render(<SeoHead title='Home' />)
        const og = metaContent(container, 'meta[property="og:image"]')
        const tw = metaContent(container, 'meta[name="twitter:image"]')

        expect(og).toBe('https://poemunity.com/og-image.png')
        expect(tw).toBe('https://poemunity.com/og-image.png')
        expect(og).toMatch(/^https?:\/\//)
        expect(tw).toMatch(/^https?:\/\//)
    })

    test('a relative image prop is resolved against the site origin', () => {
        const { container } = render(<SeoHead title='Poem' image='/detail/abc.png' />)
        expect(metaContent(container, 'meta[property="og:image"]')).toBe('https://poemunity.com/detail/abc.png')
    })

    test('an already-absolute image prop is passed through unchanged', () => {
        const abs = 'https://cdn.example.com/custom.png'
        const { container } = render(<SeoHead title='Poem' image={abs} />)
        expect(metaContent(container, 'meta[property="og:image"]')).toBe(abs)
        expect(metaContent(container, 'meta[name="twitter:image"]')).toBe(abs)
    })
})
