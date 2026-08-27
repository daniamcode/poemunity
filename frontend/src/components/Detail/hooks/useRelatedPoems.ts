import { useEffect, useMemo, useState } from 'react'
import API from '../../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../../data/API_ENDPOINTS'

/**
 * A poem as it appears in a related-poems card.
 *
 * Deliberately NOT `Poem`: the endpoint selects only the fields a card renders,
 * so it carries no body, no likes and no date. Reusing `Poem` here would let a
 * component read `poem.poem` and get `undefined` at runtime while typechecking
 * cleanly.
 */
export interface RelatedPoem {
    id: string
    title: string
    slug?: string
    genre?: string
    author?: string
    authorSlug?: string
    authorType?: 'famous' | 'user' | 'ai'
}

/** Response shape of GET /api/v1/poem/:poemId/related. */
export interface RelatedPoemsResponse {
    byAuthor: RelatedPoem[]
    byGenre: RelatedPoem[]
}

export const EMPTY_RELATED: RelatedPoemsResponse = { byAuthor: [], byGenre: [] }

/**
 * Resolve "More by this author" and "More in this genre".
 *
 * The same shape as useNextPoem, and for the same reasons: the server answer
 * arrives through getServerSideProps (which re-runs on client-side navigation
 * between detail pages, so it is normally already correct), and the fetch below
 * only covers a poem resolved without fresh props.
 *
 * A failure is not an error state. These are two supplementary lists — the page
 * renders without them rather than showing a reader an apology for a module
 * they did not ask for.
 */
export function useRelatedPoems(
    currentPoemId: string,
    initialRelated?: RelatedPoemsResponse | null
): RelatedPoemsResponse {
    const [fetched, setFetched] = useState<RelatedPoemsResponse | null>(null)
    const hasServerAnswer = initialRelated !== undefined && initialRelated !== null

    useEffect(() => {
        if (!currentPoemId || hasServerAnswer) {
            setFetched(null)
            return
        }
        const controller = new AbortController()
        let active = true
        API()
            .get(`${API_ENDPOINTS.POEM}/${currentPoemId}/related`, { signal: controller.signal })
            .then(response => {
                if (active) setFetched(response.data)
            })
            .catch(() => undefined)
        return () => {
            active = false
            controller.abort()
        }
    }, [currentPoemId, hasServerAnswer])

    return useMemo(() => {
        const related = initialRelated || fetched
        return {
            byAuthor: related?.byAuthor ?? [],
            byGenre: related?.byGenre ?? []
        }
    }, [initialRelated, fetched])
}
