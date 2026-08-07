import React from 'react'
import { render, screen } from '@testing-library/react'
import { Pagination } from '../components/Pagination'
import {
    buildPageHref,
    pageCount,
    pageWindow,
    parsePageParam
} from '../utils/pagination'

/**
 * Paginated list URLs.
 *
 * The lists load by infinite scroll, which no crawler performs, and the routes
 * hardcoded `page: 1` — so `/love?page=2` served byte-identical poems to
 * `/love` and poems 11..1,247 had no URL that reached them. Two rules carry the
 * weight here, and both fail silently if they regress:
 *
 *   ONE PAGE OF RESULTS HAS ONE ADDRESS. `?page=1` and junk redirect to the
 *   clean URL instead of rendering it, or every spelling of the parameter is
 *   another copy of the same poems.
 *
 *   A PAGE PAST THE END IS A 404. Rendering an empty list at 200 is the
 *   soft-404 shape, and there are infinitely many such URLs. (That rule lives
 *   in the routes; here we pin the parsing it is built on.)
 */
describe('parsePageParam', () => {
    test('a real page beyond the first is used as-is', () => {
        expect(parsePageParam('2')).toEqual({ kind: 'ok', page: 2 })
        expect(parsePageParam('125')).toEqual({ kind: 'ok', page: 125 })
    })

    test('page 1 redirects rather than rendering — the clean URL is page 1', () => {
        expect(parsePageParam('1')).toEqual({ kind: 'redirect' })
    })

    test('absent means page 1', () => {
        expect(parsePageParam(undefined)).toEqual({ kind: 'redirect' })
        expect(parsePageParam('')).toEqual({ kind: 'redirect' })
    })

    test.each(['0', '-3', 'abc', '1.5', ' 2 ', '0x3', '1e3', '02', '+2'])(
        'junk (%p) redirects instead of silently serving page 1',
        value => {
            // Silently falling back to page 1 is what the genre route used to
            // do, and it mints a limitless supply of URLs all serving the same
            // poems. `Number()` alone accepts every value in this list.
            expect(parsePageParam(value)).toEqual({ kind: 'redirect' })
        }
    )

    test('a repeated parameter (?page=2&page=3) redirects', () => {
        expect(parsePageParam(['2', '3'])).toEqual({ kind: 'redirect' })
    })
})

describe('buildPageHref', () => {
    test('page 1 is the clean URL, with no page parameter at all', () => {
        expect(buildPageHref('/love', 1)).toBe('/love')
        expect(buildPageHref('/', 1)).toBe('/')
    })

    test('later pages carry the parameter', () => {
        expect(buildPageHref('/love', 7)).toBe('/love?page=7')
    })

    test('other params survive, and empty ones are dropped', () => {
        expect(buildPageHref('/love', 3, { q: 'rain' })).toBe('/love?q=rain&page=3')
        expect(buildPageHref('/love', 1, { q: 'rain' })).toBe('/love?q=rain')
        expect(buildPageHref('/love', 3, { q: undefined })).toBe('/love?page=3')
    })

    test('a query value is encoded, not concatenated raw', () => {
        expect(buildPageHref('/', 2, { q: 'a b&c' })).toBe('/?q=a+b%26c&page=2')
    })
})

describe('pageCount', () => {
    test('rounds up — 11 poems at 10 per page is 2 pages', () => {
        expect(pageCount(11, 10)).toBe(2)
        expect(pageCount(20, 10)).toBe(2)
        expect(pageCount(21, 10)).toBe(3)
    })

    test('an empty list still has one page', () => {
        // Page 1 of an empty genre is a real page that says it is empty.
        expect(pageCount(0, 10)).toBe(1)
    })
})

describe('pageWindow', () => {
    test('a short list is listed in full, with no gaps', () => {
        expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5])
    })

    test('always includes the first and last page', () => {
        // Without them, page 125 sits 124 prev/next hops from page 1 and no
        // crawler walks that far.
        const window = pageWindow(60, 125)

        expect(window[0]).toBe(1)
        expect(window[window.length - 1]).toBe(125)
    })

    test('elides the long runs and keeps a window around the current page', () => {
        expect(pageWindow(60, 125)).toEqual([1, null, 58, 59, 60, 61, 62, null, 125])
    })

    test('a gap of exactly one page renders that page, not an ellipsis', () => {
        // "1 … 3" is longer than "1 2 3" and hides a link for no reason.
        expect(pageWindow(4, 20)).toEqual([1, 2, 3, 4, 5, 6, null, 20])
    })

    test('never repeats a page or emits one out of range', () => {
        for (const [current, total] of [[1, 1], [1, 2], [2, 3], [125, 125], [3, 4]]) {
            const window = pageWindow(current, total).filter((p): p is number => p !== null)

            expect(new Set(window).size).toBe(window.length)
            expect(window.every(p => p >= 1 && p <= total)).toBe(true)
        }
    })

    test('a single page is just itself', () => {
        expect(pageWindow(1, 1)).toEqual([1])
    })
})

describe('<Pagination>', () => {
    test('renders a real href per page — the whole point is crawlable links', () => {
        render(<Pagination basePath='/love' currentPage={1} totalPages={5} />)

        expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '/love?page=2')
        expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/love?page=2')
        expect(screen.getByRole('link', { name: 'Page 5' })).toHaveAttribute('href', '/love?page=5')
    })

    test('the last page is linked from page 1, not just the next one', () => {
        render(<Pagination basePath='/love' currentPage={1} totalPages={125} />)

        expect(screen.getByRole('link', { name: 'Page 125' })).toHaveAttribute('href', '/love?page=125')
    })

    test('the current page is not a link, and says so', () => {
        render(<Pagination basePath='/love' currentPage={3} totalPages={5} />)

        expect(screen.queryByRole('link', { name: 'Page 3' })).not.toBeInTheDocument()
        expect(screen.getByText('3')).toHaveAttribute('aria-current', 'page')
    })

    test('page 1 links back to the clean URL, never to ?page=1', () => {
        render(<Pagination basePath='/love' currentPage={2} totalPages={5} />)

        expect(screen.getByRole('link', { name: 'Previous' })).toHaveAttribute('href', '/love')
        expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('href', '/love')
    })

    test('no Previous on the first page and no Next on the last', () => {
        const { unmount } = render(<Pagination basePath='/love' currentPage={1} totalPages={5} />)
        expect(screen.queryByRole('link', { name: 'Previous' })).not.toBeInTheDocument()
        unmount()

        render(<Pagination basePath='/love' currentPage={5} totalPages={5} />)
        expect(screen.queryByRole('link', { name: 'Next' })).not.toBeInTheDocument()
    })

    test('a search query rides along, so paging a search stays a search', () => {
        render(<Pagination basePath='/love' currentPage={1} totalPages={3} query={{ q: 'rain' }} />)

        expect(screen.getByRole('link', { name: 'Next' })).toHaveAttribute('href', '/love?q=rain&page=2')
    })

    test('renders nothing at all when there is only one page', () => {
        // The distractor for a component that always draws a nav: a genre with
        // 4 poems must not get a pagination control.
        const { container } = render(<Pagination basePath='/love' currentPage={1} totalPages={1} />)

        expect(container).toBeEmptyDOMElement()
    })
})
