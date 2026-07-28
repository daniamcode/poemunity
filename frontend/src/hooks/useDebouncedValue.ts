import { useEffect, useState } from 'react'

export const SEARCH_DEBOUNCE_MS = 300

/**
 * Returns `value` only once it has stopped changing for `delay` ms.
 *
 * Debounce, not throttle: throttle fires on a fixed cadence regardless of
 * pauses, which for a search box means firing mid-word. 300ms is the usual
 * recommendation for a network round trip — low enough to feel immediate,
 * high enough that typing a word costs one request instead of one per letter.
 */
export function useDebouncedValue<T>(value: T, delay: number = SEARCH_DEBOUNCE_MS): T {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}

export default useDebouncedValue
