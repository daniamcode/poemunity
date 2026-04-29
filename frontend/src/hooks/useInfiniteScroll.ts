import { useEffect, useRef, useState, useCallback } from 'react'

interface UseInfiniteScrollProps {
    onLoadMore: () => void
    hasMore: boolean
    isLoading: boolean
    threshold?: number
}

export function useInfiniteScroll({ onLoadMore, hasMore, isLoading, threshold = 0.8 }: UseInfiniteScrollProps) {
    const stateRef = useRef({ hasMore, isLoading, onLoadMore })
    const isIntersectingRef = useRef(false)
    const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null)

    // Keep ref in sync without recreating the observer
    stateRef.current = { hasMore, isLoading, onLoadMore }

    // When a batch finishes loading and the sentinel is still visible, load the next batch
    useEffect(() => {
        if (!isLoading && hasMore && isIntersectingRef.current) {
            onLoadMore()
        }
    }, [isLoading, hasMore, onLoadMore])

    // Re-create observer whenever the sentinel element mounts/unmounts/remounts
    useEffect(() => {
        if (!sentinel || typeof IntersectionObserver === 'undefined') {
            return
        }

        const options = {
            root: null,
            rootMargin: '100px',
            threshold
        }

        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries
            isIntersectingRef.current = entry?.isIntersecting ?? false
            const { hasMore: more, isLoading: loading, onLoadMore: load } = stateRef.current
            if (entry && entry.isIntersecting && more && !loading) {
                load()
            }
        }, options)

        observer.observe(sentinel)

        return () => {
            observer.disconnect()
        }
    }, [sentinel, threshold])

    const sentinelRef = useCallback((node: HTMLDivElement | null) => {
        setSentinel(node)
    }, [])

    return sentinelRef
}
