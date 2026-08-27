import { useEffect, useMemo, useState } from 'react'
import API from '../../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../../data/API_ENDPOINTS'
import { Poem } from '../../../typescript/interfaces'

/** Response shape of GET /api/v1/poem/:poemId/next. */
export interface NextPoemResponse {
    poem: Poem | null
}

export interface NextPoemTarget {
    href: string
    title: string
    author: string
}

// Structural, not `Poem`: the related-poems endpoint returns a trimmed record
// with no body or likes, and a link needs only these two fields.
export function poemHref(poem: { id: string; slug?: string }): string {
    return `/detail/${poem.slug || poem.id}`
}

/**
 * Resolve the destination of the "next poem" control.
 *
 * One rule, server-owned: the author's next poem, then the next author
 * alphabetically. It is deliberately independent of how the reader got here.
 *
 * An earlier version consulted the Redux list caches first so the control
 * continued whichever list you were scrolling. It was removed on purpose: the
 * same poem offered different destinations depending on your history, and a
 * refresh — which wipes the caches — silently changed the answer.
 *
 * `initialNext` comes from getServerSideProps, which also re-runs on client-side
 * navigation between detail pages, so it is normally already correct. The fetch
 * below only covers the case where the poem was resolved without fresh props.
 */
export function useNextPoem(
    currentPoemId: string,
    initialNext?: NextPoemResponse | null
): NextPoemTarget | null {
    const [fetched, setFetched] = useState<NextPoemResponse | null>(null)
    const hasServerAnswer = initialNext !== undefined && initialNext !== null

    useEffect(() => {
        if (!currentPoemId || hasServerAnswer) {
            setFetched(null)
            return
        }
        const controller = new AbortController()
        let active = true
        API()
            .get(`${API_ENDPOINTS.POEM}/${currentPoemId}/next`, { signal: controller.signal })
            .then(response => {
                if (active) setFetched(response.data)
            })
            // A failed walk is not an error state — the control simply renders
            // nothing rather than breaking the page.
            .catch(() => undefined)
        return () => {
            active = false
            controller.abort()
        }
    }, [currentPoemId, hasServerAnswer])

    return useMemo(() => {
        const poem = (initialNext || fetched)?.poem
        if (!poem?.id) return null
        return { href: poemHref(poem), title: poem.title, author: poem.author }
    }, [initialNext, fetched])
}
