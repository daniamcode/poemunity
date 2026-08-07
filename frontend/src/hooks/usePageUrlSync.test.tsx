import React from 'react'
import { render, act } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import { usePageUrlSync } from './usePageUrlSync'

/**
 * The address bar follows the scroll.
 *
 * Infinite scroll is untouched; this only rewrites the URL as the reader
 * crosses a page boundary. It is NOT an SEO device — crawlers do not scroll and
 * already have the `<a href>` nav. It fixes two reader-facing problems: sharing
 * a URL from deep in a list used to send someone to poem 1, and coming Back
 * from a poem used to dump you at the top with everything you had loaded gone.
 *
 * jsdom has no IntersectionObserver and no layout, so both are driven by hand:
 * the observer callback is captured and fired, and `getBoundingClientRect` is
 * stubbed per marker. That is the point — the logic under test is "which page
 * owns the top of the viewport", not the browser's geometry.
 */
let fireObserver: () => void
let observed: Set<Element>

beforeEach(() => {
    observed = new Set()
    mockRouter.setCurrentUrl('/love')
    jest.spyOn(mockRouter, 'replace')

    class FakeObserver {
        constructor(callback: () => void) {
            fireObserver = callback
        }

        observe(element: Element) { observed.add(element) }
        unobserve(element: Element) { observed.delete(element) }
        disconnect() { observed.clear() }
    }
    ;(global as never as Record<string, unknown>).IntersectionObserver = FakeObserver
})

afterEach(() => {
    jest.restoreAllMocks()
})

/** A marker whose top edge sits `top` pixels down the viewport. */
function positioned(top: number) {
    return (element: HTMLElement | null) => {
        if (element) {
            element.getBoundingClientRect = () => ({ top } as DOMRect)
        }
    }
}

interface HarnessProps {
    /** page -> its marker's distance from the top of the viewport. */
    tops: Record<number, number>
    startPage?: number
    query?: Record<string, string | undefined>
    enabled?: boolean
    basePath?: string
}

function Harness({ tops, startPage = 1, query, enabled, basePath = '/love' }: HarnessProps) {
    const { visiblePage, markerRef } = usePageUrlSync({ basePath, startPage, query, enabled })
    return (
        <div>
            <span data-testid='visible'>{visiblePage}</span>
            {Object.entries(tops).map(([page, top]) => (
                <span
                    key={page}
                    ref={element => {
                        positioned(top)(element)
                        markerRef(Number(page))(element)
                    }}
                />
            ))}
        </div>
    )
}

const scroll = () => act(() => { fireObserver() })

describe('usePageUrlSync', () => {
    test('starts on the page the server rendered, and writes nothing', () => {
        const { getByTestId } = render(<Harness tops={{ 1: 0, 2: 900 }} />)

        expect(getByTestId('visible')).toHaveTextContent('1')
        expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    test('crossing into page 2 rewrites the URL', () => {
        const { getByTestId, rerender } = render(<Harness tops={{ 1: 0, 2: 900 }} />)
        // Page 2's marker has scrolled up past the activation line.
        rerender(<Harness tops={{ 1: -900, 2: 10 }} />)
        scroll()

        expect(getByTestId('visible')).toHaveTextContent('2')
        expect(mockRouter.replace).toHaveBeenCalledWith(
            '/love?page=2', undefined, { shallow: true, scroll: false }
        )
    })

    test('scrolling back up returns to page 1 and the CLEAN url, never ?page=1', () => {
        const { getByTestId, rerender } = render(<Harness tops={{ 1: 0, 2: 900 }} />)
        rerender(<Harness tops={{ 1: -900, 2: 10 }} />)
        scroll()
        rerender(<Harness tops={{ 1: 0, 2: 900 }} />)
        scroll()

        expect(getByTestId('visible')).toHaveTextContent('1')
        expect(mockRouter.replace).toHaveBeenLastCalledWith(
            '/love', undefined, { shallow: true, scroll: false }
        )
    })

    test('the gap between two markers keeps the page you are IN, not the last event', () => {
        // Scrolling up out of page 3: its marker has dropped below the line but
        // page 2's has not arrived. Answering from the entry that fired would
        // report 3 while the reader looks at page 2. Recomputing from every
        // marker is what makes this right.
        const { getByTestId } = render(<Harness tops={{ 1: -2000, 2: -400, 3: 700 }} startPage={1} />)
        scroll()

        expect(getByTestId('visible')).toHaveTextContent('2')
    })

    test('a marker exactly at the activation line has not been crossed yet', () => {
        // 120px is the offset; a boundary grazing it must not flip the URL, or a
        // one-pixel jitter renumbers the page under the reader.
        const { getByTestId } = render(<Harness tops={{ 1: -900, 2: 121 }} />)
        scroll()

        expect(getByTestId('visible')).toHaveTextContent('1')
    })

    test('never pushes history — one entry per boundary would trap the reader', () => {
        const push = jest.spyOn(mockRouter, 'push')
        const { rerender } = render(<Harness tops={{ 1: 0, 2: 900 }} />)
        rerender(<Harness tops={{ 1: -900, 2: 10 }} />)
        scroll()

        expect(push).not.toHaveBeenCalled()
    })

    test('a search query rides along, so the shared URL is still the search', () => {
        mockRouter.setCurrentUrl('/love?q=rain')
        const { rerender } = render(<Harness tops={{ 1: 0, 2: 900 }} query={{ q: 'rain' }} />)
        rerender(<Harness tops={{ 1: -900, 2: 10 }} query={{ q: 'rain' }} />)
        scroll()

        expect(mockRouter.replace).toHaveBeenCalledWith(
            '/love?q=rain&page=2', undefined, { shallow: true, scroll: false }
        )
    })

    test('disabled observes nothing, so scrolling can never move the URL', () => {
        // The list is showing client-side search results the URL does not
        // describe; naming a page of a different result set would be wrong.
        render(<Harness tops={{ 1: 0, 2: 900 }} enabled={false} />)

        expect(observed.size).toBe(0)
    })

    test('disabled does not write even when the URL and the hook disagree', () => {
        // The write guard, tested apart from the observer guard: here the href
        // the hook would build (`/love?q=rain`) differs from the URL it is on,
        // so an implementation that ignored `enabled` writes. An earlier version
        // of this test never fired the observer, so the two agreed and it passed
        // against a hook with no `enabled` handling at all.
        render(<Harness tops={{ 1: 0 }} enabled={false} query={{ q: 'rain' }} />)

        expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    test('...and DOES write in the same situation when enabled', () => {
        // The other half of the pair — otherwise "never writes" would also pass
        // against a hook that never writes at all.
        render(<Harness tops={{ 1: 0 }} enabled query={{ q: 'rain' }} />)

        expect(mockRouter.replace).toHaveBeenCalledWith(
            '/love?q=rain', undefined, { shallow: true, scroll: false }
        )
    })

    test('starting deep in the list starts there, not at page 1', () => {
        // Landing on /love?page=41 must not immediately rewrite itself. The URL
        // has to be set too: `startPage` only ever comes FROM the URL, so a
        // fixture with one and not the other is a state the app cannot be in.
        mockRouter.setCurrentUrl('/love?page=41')
        const { getByTestId } = render(<Harness tops={{ 41: 0 }} startPage={41} />)

        expect(getByTestId('visible')).toHaveTextContent('41')
        expect(mockRouter.replace).not.toHaveBeenCalled()
    })

    test('survives an environment with no IntersectionObserver', () => {
        delete (global as never as Record<string, unknown>).IntersectionObserver

        expect(() => render(<Harness tops={{ 1: 0 }} />)).not.toThrow()
    })
})
