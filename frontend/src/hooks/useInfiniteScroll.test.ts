/* eslint-disable no-undef */
import { renderHook, act } from '@testing-library/react-hooks'
import { useInfiniteScroll } from './useInfiniteScroll'

describe('useInfiniteScroll', () => {
    let mockObserve: jest.Mock
    let mockUnobserve: jest.Mock
    let mockDisconnect: jest.Mock
    let intersectionObserverCallback: (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void

    beforeEach(() => {
        mockObserve = jest.fn()
        mockUnobserve = jest.fn()
        mockDisconnect = jest.fn()

        // Mock IntersectionObserver
        global.IntersectionObserver = jest.fn(callback => {
            intersectionObserverCallback = callback
            return {
                observe: mockObserve,
                unobserve: mockUnobserve,
                disconnect: mockDisconnect,
                root: null,
                rootMargin: '',
                thresholds: [],
                takeRecords: jest.fn()
            }
        }) as any
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    function attachSentinel(callbackRef: (node: HTMLDivElement | null) => void) {
        const element = document.createElement('div')
        act(() => {
            callbackRef(element)
        })
        return element
    }

    test('should create IntersectionObserver with default threshold when sentinel attaches', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        attachSentinel(result.current)

        expect(global.IntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                root: null,
                rootMargin: '100px',
                threshold: 0.8
            })
        )
    })

    test('should create IntersectionObserver with custom threshold', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false,
                threshold: 0.5
            })
        )

        attachSentinel(result.current)

        expect(global.IntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                threshold: 0.5
            })
        )
    })

    test('should return a callback ref function for the sentinel element', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        expect(result.current).toBeDefined()
        expect(typeof result.current).toBe('function')
    })

    test('should call onLoadMore when sentinel intersects and hasMore is true', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        attachSentinel(result.current)

        // Simulate intersection
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        expect(onLoadMore).toHaveBeenCalledTimes(1)
    })

    test('should NOT call onLoadMore when sentinel is not intersecting', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        attachSentinel(result.current)

        // Simulate non-intersection
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: false } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        expect(onLoadMore).not.toHaveBeenCalled()
    })

    test('should NOT call onLoadMore when hasMore is false', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: false,
                isLoading: false
            })
        )

        attachSentinel(result.current)

        // Simulate intersection
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        expect(onLoadMore).not.toHaveBeenCalled()
    })

    test('should NOT call onLoadMore when isLoading is true', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: true
            })
        )

        attachSentinel(result.current)

        // Simulate intersection
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        expect(onLoadMore).not.toHaveBeenCalled()
    })

    test('should cleanup IntersectionObserver on unmount', () => {
        const onLoadMore = jest.fn()
        const { result, unmount } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        attachSentinel(result.current)

        // Verify observer was created
        expect(global.IntersectionObserver).toHaveBeenCalled()

        // Unmount should not throw
        expect(() => unmount()).not.toThrow()
        expect(mockDisconnect).toHaveBeenCalled()
    })

    test('should handle IntersectionObserver not being supported', () => {
        // Remove IntersectionObserver
        const originalIntersectionObserver = global.IntersectionObserver
        // @ts-expect-error - Intentionally setting to undefined for test
        global.IntersectionObserver = undefined

        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // Should still return a callback ref function
        expect(result.current).toBeDefined()
        expect(typeof result.current).toBe('function')

        // Restore
        global.IntersectionObserver = originalIntersectionObserver
    })

    test('should not observe when sentinel is null (not attached)', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // Sentinel not attached, observer should not be created
        expect(global.IntersectionObserver).not.toHaveBeenCalled()
        expect(mockObserve).not.toHaveBeenCalled()
    })

    test('should use latest isLoading via stateRef when intersection fires', () => {
        const onLoadMore = jest.fn()
        const { result, rerender } = renderHook(
            ({ hasMore, isLoading }) =>
                useInfiniteScroll({
                    onLoadMore,
                    hasMore,
                    isLoading
                }),
            {
                initialProps: {
                    hasMore: true,
                    isLoading: false
                }
            }
        )

        attachSentinel(result.current)

        // Simulate intersection with initial props
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })
        expect(onLoadMore).toHaveBeenCalledTimes(1)

        // Sentinel scrolls out of view while loading
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: false } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        // Change isLoading to true
        rerender({ hasMore: true, isLoading: true })

        // Simulate intersection while loading - should not call onLoadMore
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })
        expect(onLoadMore).toHaveBeenCalledTimes(1) // Still 1, not called again

        // Sentinel scrolls out again
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: false } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })

        // Change isLoading back to false
        rerender({ hasMore: true, isLoading: false })

        // Simulate intersection again - should call onLoadMore
        act(() => {
            intersectionObserverCallback(
                [{ isIntersecting: true } as IntersectionObserverEntry],
                {} as IntersectionObserver
            )
        })
        expect(onLoadMore).toHaveBeenCalledTimes(2)
    })

    test('should handle multiple intersection entries correctly', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        attachSentinel(result.current)

        // Simulate multiple entries (hook only uses the first one)
        act(() => {
            intersectionObserverCallback(
                [
                    { isIntersecting: true } as IntersectionObserverEntry,
                    { isIntersecting: false } as IntersectionObserverEntry
                ],
                {} as IntersectionObserver
            )
        })

        expect(onLoadMore).toHaveBeenCalledTimes(1)
    })

    test('should not crash when callback is called with empty entries', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        attachSentinel(result.current)

        // This shouldn't happen in practice, but test defensive programming
        expect(() => {
            act(() => {
                intersectionObserverCallback([], {} as IntersectionObserver)
            })
        }).not.toThrow()

        expect(onLoadMore).not.toHaveBeenCalled()
    })
})
