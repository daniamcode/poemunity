/* eslint-disable no-undef */
import { renderHook } from '@testing-library/react-hooks'
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
        global.IntersectionObserver = jest.fn((callback) => {
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

    test('should create IntersectionObserver with default threshold', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

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
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false,
                threshold: 0.5
            })
        )

        expect(global.IntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({
                threshold: 0.5
            })
        )
    })

    test('should return a ref object for the sentinel element', () => {
        const onLoadMore = jest.fn()
        const { result } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // Verify it returns a ref object
        expect(result.current).toBeDefined()
        expect(result.current).toHaveProperty('current')
        expect(result.current.current).toBeNull() // Initially null
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

        const sentinelElement = document.createElement('div')
        result.current.current = sentinelElement

        // Simulate intersection
        intersectionObserverCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )

        expect(onLoadMore).toHaveBeenCalledTimes(1)
    })

    test('should NOT call onLoadMore when sentinel is not intersecting', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // Simulate non-intersection
        intersectionObserverCallback(
            [{ isIntersecting: false } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )

        expect(onLoadMore).not.toHaveBeenCalled()
    })

    test('should NOT call onLoadMore when hasMore is false', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: false,
                isLoading: false
            })
        )

        // Simulate intersection
        intersectionObserverCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )

        expect(onLoadMore).not.toHaveBeenCalled()
    })

    test('should NOT call onLoadMore when isLoading is true', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: true
            })
        )

        // Simulate intersection
        intersectionObserverCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )

        expect(onLoadMore).not.toHaveBeenCalled()
    })

    test('should cleanup IntersectionObserver on unmount', () => {
        const onLoadMore = jest.fn()
        const { unmount } = renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // Verify observer was created
        expect(global.IntersectionObserver).toHaveBeenCalled()

        // Unmount should not throw
        expect(() => unmount()).not.toThrow()
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

        // Should still return a ref
        expect(result.current).toBeDefined()
        expect(result.current.current).toBeNull()

        // Restore
        global.IntersectionObserver = originalIntersectionObserver
    })

    test('should not observe when sentinel is null', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // Sentinel ref is null by default, should not call observe
        expect(mockObserve).not.toHaveBeenCalled()
    })

    test('should update observer when dependencies change', () => {
        const onLoadMore = jest.fn()
        const { rerender } = renderHook(
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

        // Simulate intersection with initial props
        intersectionObserverCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )
        expect(onLoadMore).toHaveBeenCalledTimes(1)

        // Change isLoading to true
        rerender({ hasMore: true, isLoading: true })

        // Simulate intersection again - should not call onLoadMore
        intersectionObserverCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )
        expect(onLoadMore).toHaveBeenCalledTimes(1) // Still 1, not called again

        // Change isLoading back to false
        rerender({ hasMore: true, isLoading: false })

        // Simulate intersection again - should call onLoadMore
        intersectionObserverCallback(
            [{ isIntersecting: true } as IntersectionObserverEntry],
            {} as IntersectionObserver
        )
        expect(onLoadMore).toHaveBeenCalledTimes(2)
    })

    test('should handle multiple intersection entries correctly', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // Simulate multiple entries (hook only uses the first one)
        intersectionObserverCallback(
            [
                { isIntersecting: true } as IntersectionObserverEntry,
                { isIntersecting: false } as IntersectionObserverEntry
            ],
            {} as IntersectionObserver
        )

        expect(onLoadMore).toHaveBeenCalledTimes(1)
    })

    test('should not crash when callback is called with empty entries', () => {
        const onLoadMore = jest.fn()
        renderHook(() =>
            useInfiniteScroll({
                onLoadMore,
                hasMore: true,
                isLoading: false
            })
        )

        // This shouldn't happen in practice, but test defensive programming
        expect(() => {
            intersectionObserverCallback([], {} as IntersectionObserver)
        }).not.toThrow()

        expect(onLoadMore).not.toHaveBeenCalled()
    })
})
