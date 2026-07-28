import type { ChangeEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDebouncedValue } from './useDebouncedValue'
import { SEARCH_MIN_LENGTH } from '../data/constants'

/**
 * The client half of server-backed search, shared by every list that has a
 * search box.
 *
 * Splits the raw input (what the box shows, updated on every keystroke) from
 * the query actually sent to the server (`q` — debounced, trimmed, and empty
 * until the minimum length is reached).
 *
 * `initialQuery` seeds the box, e.g. from `?q=` in the URL.
 */
export function useSearchQuery(initialQuery: string = '') {
    // Seeded from the URL so a "search all poems" link can carry the query
    // across a navigation instead of dropping what the user typed.
    const [input, setInput] = useState(initialQuery)
    const debounced = useDebouncedValue(input)

    const trimmed = debounced.trim()
    const q = trimmed.length >= SEARCH_MIN_LENGTH ? trimmed : ''

    // A list never wants two of its own fetches in flight at once, so starting
    // one always cancels the one it replaces. That makes "latest wins"
    // structural: the response for "lov" cannot land after "love" and overwrite
    // it, however slow the network is. The signal is handed out per fetch
    // rather than held in state, so requesting one never itself causes a
    // render (which would fire a second, redundant request).
    const controllerRef = useRef<AbortController | null>(null)

    const nextSignal = useCallback(() => {
        controllerRef.current?.abort()
        const controller = new AbortController()
        controllerRef.current = controller
        return controller.signal
    }, [])

    useEffect(() => () => controllerRef.current?.abort(), [])

    const onSearchChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInput(event.target.value)
    }, [])

    return { input, q, nextSignal, onSearchChange }
}

export default useSearchQuery
