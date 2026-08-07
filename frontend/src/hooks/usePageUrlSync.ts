import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { buildPageHref } from '../utils/pagination'

/**
 * How far below the top of the viewport a page's first poem must sit before the
 * URL claims you are on that page. Zero would flip the address bar the instant a
 * boundary grazed the top edge, including on a one-pixel scroll jitter.
 */
const ACTIVATION_OFFSET = 120

interface UsePageUrlSyncParams {
    /** Path with no query string, e.g. `/love` or `/`. */
    basePath: string
    /** The page `getServerSideProps` rendered — where the reader started. */
    startPage: number
    /** Params to keep on the URL (`q`), so paging a search stays a search. */
    query?: Record<string, string | undefined>
    /** Off during a search-in-flight or when there is nothing to page through. */
    enabled?: boolean
}

/**
 * KEEPS THE ADDRESS BAR HONEST WHILE INFINITE SCROLL RUNS.
 *
 * Infinite scroll stays exactly as it was; this only rewrites the URL, via
 * `history.replaceState`, as the reader crosses from one page of poems into the
 * next. Nothing refetches and nothing re-renders the list.
 *
 * It is not an SEO device — crawlers do not scroll, and they already have the
 * `<a href>` nav. It fixes two things readers hit today:
 *
 *   SHARING — scroll to poem 400, copy the URL, send it: today the recipient
 *   lands on poem 1.
 *
 *   THE BACK BUTTON — open a poem from deep in the list and come back, and you
 *   were returned to the top with 10 poems, everything you had loaded gone.
 *
 * `replaceState`, never `pushState`: one entry per page boundary would mean 40
 * taps of Back to escape a list you scrolled through once.
 *
 * Known and accepted: Back lands on `?page=41`, which server-renders poems
 * 401-410 — not all 400 you had scrolled. Restoring the whole scrolled list
 * means caching it, which is a much larger job for a smaller gain.
 */
export function usePageUrlSync({
    basePath,
    startPage,
    query = {},
    enabled = true
}: UsePageUrlSyncParams) {
    const router = useRouter()
    const [visiblePage, setVisiblePage] = useState(startPage)

    /** page -> the element marking where that page's poems begin. */
    const markersRef = useRef(new Map<number, HTMLElement>())
    const observerRef = useRef<IntersectionObserver | null>(null)

    // A real navigation (clicking a page link) re-runs getServerSideProps and
    // hands down a new startPage; the scroll position resets with it.
    useEffect(() => {
        setVisiblePage(startPage)
    }, [startPage])

    /**
     * The page whose block currently owns the top of the viewport.
     *
     * Recomputed from every marker rather than from the entry that fired,
     * because "which page am I in" is not answerable from one crossing: scroll
     * upward out of page 3 and its marker stops intersecting while page 2's has
     * not yet arrived, leaving a gap where the last event is simply wrong.
     * Scanning is cheap — one marker per ten poems.
     */
    const recompute = useCallback(() => {
        let current = startPage
        const byPage = Array.from(markersRef.current.entries()).sort((a, b) => a[0] - b[0])
        for (const [page, element] of byPage) {
            if (element.getBoundingClientRect().top <= ACTIVATION_OFFSET) current = page
            else break
        }
        setVisiblePage(current)
    }, [startPage])

    useEffect(() => {
        if (!enabled || typeof IntersectionObserver === 'undefined') return

        const observer = new IntersectionObserver(recompute, {
            rootMargin: `-${ACTIVATION_OFFSET}px 0px 0px 0px`,
            threshold: 0
        })
        observerRef.current = observer
        // `Array.from`, not a spread: this project's TS target compiles a
        // spread of a Map iterator to an empty array at runtime, so the
        // existing markers would silently never be observed.
        for (const element of Array.from(markersRef.current.values())) observer.observe(element)

        return () => {
            observer.disconnect()
            observerRef.current = null
        }
    }, [enabled, recompute])

    /** Callback ref for the marker that opens `page`'s block of poems. */
    const markerRef = useCallback((page: number) => (element: HTMLElement | null) => {
        const existing = markersRef.current.get(page)
        if (existing && existing !== element) observerRef.current?.unobserve(existing)

        if (element) {
            markersRef.current.set(page, element)
            observerRef.current?.observe(element)
        } else {
            markersRef.current.delete(page)
        }
    }, [])

    // The write itself. Shallow so `getServerSideProps` does not re-run, and
    // `scroll: false` so the browser does not jump to the top of the page the
    // reader is in the middle of.
    useEffect(() => {
        if (!enabled) return

        const href = buildPageHref(basePath, visiblePage, query)
        if (href === router.asPath) return

        router.replace(href, undefined, { shallow: true, scroll: false })
        // `router` is deliberately absent: it is a new object on every render,
        // and depending on it would rewrite the URL in a loop.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visiblePage, basePath, enabled])

    return { visiblePage, markerRef }
}
