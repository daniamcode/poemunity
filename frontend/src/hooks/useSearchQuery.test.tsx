import { renderHook, act } from '@testing-library/react'
import { useSearchQuery } from './useSearchQuery'
import { SEARCH_DEBOUNCE_MS } from './useDebouncedValue'
import { SEARCH_MIN_LENGTH } from '../data/constants'

// The client half of server-backed search. Every behaviour here exists to stop
// the previous implementation's failure modes: a request per keystroke, a
// request for a one-letter query that matches most of the collection, and a
// slow early response overwriting a fast later one.

const type = (result: { current: ReturnType<typeof useSearchQuery> }, value: string) => {
    act(() => {
        result.current.onSearchChange({
            target: { value }
        } as React.ChangeEvent<HTMLInputElement>)
    })
}

const advance = (ms: number) => {
    act(() => {
        jest.advanceTimersByTime(ms)
    })
}

describe('useSearchQuery', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    test('reflects typing immediately in the input value', () => {
        const { result } = renderHook(() => useSearchQuery())

        type(result, 'love')

        expect(result.current.input).toBe('love')
    })

    test('does not expose the query until the debounce elapses', () => {
        const { result } = renderHook(() => useSearchQuery())

        type(result, 'love')
        expect(result.current.q).toBe('')

        advance(SEARCH_DEBOUNCE_MS)
        expect(result.current.q).toBe('love')
    })

    // The point of debouncing rather than throttling: typing a word steadily
    // must cost ONE query, not one per letter.
    test('typing a whole word without pausing produces a single query', () => {
        const { result } = renderHook(() => useSearchQuery())
        const seen: string[] = []

        for (const value of ['l', 'lo', 'lov', 'love']) {
            type(result, value)
            advance(SEARCH_DEBOUNCE_MS - 50)
            if (result.current.q) seen.push(result.current.q)
        }
        advance(SEARCH_DEBOUNCE_MS)
        seen.push(result.current.q)

        expect(seen).toEqual(['love'])
    })

    describe('minimum length', () => {
        test('withholds the query below the threshold', () => {
            const { result } = renderHook(() => useSearchQuery())

            type(result, 'a'.repeat(SEARCH_MIN_LENGTH - 1))
            advance(SEARCH_DEBOUNCE_MS)

            expect(result.current.q).toBe('')
        })

        test('emits the query at the threshold', () => {
            const { result } = renderHook(() => useSearchQuery())

            type(result, 'a'.repeat(SEARCH_MIN_LENGTH))
            advance(SEARCH_DEBOUNCE_MS)

            expect(result.current.q).toBe('a'.repeat(SEARCH_MIN_LENGTH))
        })

        test('clearing the box clears the query, restoring the unfiltered list', () => {
            const { result } = renderHook(() => useSearchQuery())

            type(result, 'love')
            advance(SEARCH_DEBOUNCE_MS)
            expect(result.current.q).toBe('love')

            type(result, '')
            advance(SEARCH_DEBOUNCE_MS)
            expect(result.current.q).toBe('')
        })
    })

    describe('query normalisation', () => {
        test('trims the query sent to the server', () => {
            const { result } = renderHook(() => useSearchQuery())

            type(result, '  love  ')
            advance(SEARCH_DEBOUNCE_MS)

            expect(result.current.q).toBe('love')
        })

        test('whitespace alone never becomes a query', () => {
            const { result } = renderHook(() => useSearchQuery())

            type(result, '     ')
            advance(SEARCH_DEBOUNCE_MS)

            expect(result.current.q).toBe('')
        })

        test('counts length after trimming, so " a " stays below the threshold', () => {
            const { result } = renderHook(() => useSearchQuery())

            type(result, ' a ')
            advance(SEARCH_DEBOUNCE_MS)

            expect(result.current.q).toBe('')
        })
    })

    // Without this, a slow response for "lov" can land after a fast one for
    // "love" and replace the correct results with stale ones.
    describe('request cancellation', () => {
        test('starting a fetch aborts the one it replaces', () => {
            const { result } = renderHook(() => useSearchQuery())

            const first = result.current.nextSignal()
            expect(first.aborted).toBe(false)

            const second = result.current.nextSignal()

            expect(first.aborted).toBe(true)
            expect(second.aborted).toBe(false)
        })

        test('unmounting aborts the request still in flight', () => {
            const { result, unmount } = renderHook(() => useSearchQuery())

            const signal = result.current.nextSignal()
            unmount()

            expect(signal.aborted).toBe(true)
        })

        test('keeps a stable identity so it does not retrigger fetch effects', () => {
            const { result, rerender } = renderHook(() => useSearchQuery())
            const before = result.current.nextSignal

            type(result, 'love')
            advance(SEARCH_DEBOUNCE_MS)
            rerender()

            expect(result.current.nextSignal).toBe(before)
        })
    })
})
