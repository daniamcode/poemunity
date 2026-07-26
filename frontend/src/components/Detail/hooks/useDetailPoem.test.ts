import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useDetailPoem } from './useDetailPoem'
import store from '../../../redux/store'
import * as poemActions from '../../../redux/actions/poemActions'
import { poemUpserted, poemUpdated, poemRemoved } from '../../../redux/reducers/poemEntitiesReducers'
import { Poem } from '../../../typescript/interfaces'
import React from 'react'

jest.mock('../../../redux/actions/poemActions')

describe('useDetailPoem', () => {
    const wrapper = ({ children }: any) => React.createElement(
        Provider as React.ComponentType<any>,
        { store },
        children
    )

    beforeEach(() => {
        jest.clearAllMocks()
        ;(poemActions.getPoemAction as jest.Mock).mockReturnValue({ type: 'GET_POEM' })
    })

    test('should initialize with empty poem state', () => {
        const { result } = renderHook(() => useDetailPoem('poem-123'), { wrapper })

        expect(result.current.poem).toEqual({
            id: '',
            author: '',
            date: '',
            genre: '',
            likes: [],
            picture: '',
            poem: '',
            title: '',
            userId: ''
        })
    })

    test('should dispatch getPoemAction with reset on mount', () => {
        renderHook(() => useDetailPoem('poem-123'), { wrapper })

        expect(poemActions.getPoemAction).toHaveBeenCalledWith({
            options: { reset: true, fetch: false }
        })
    })

    test('should dispatch getPoemAction with fetch when poemId is provided', () => {
        const poemId = 'poem-456'
        renderHook(() => useDetailPoem(poemId), { wrapper })

        expect(poemActions.getPoemAction).toHaveBeenCalledWith({
            params: { poemId },
            options: { reset: true, fetch: true }
        })
    })

    test('should NOT fetch poem when poemId is empty', () => {
        ;(poemActions.getPoemAction as jest.Mock).mockClear()
        renderHook(() => useDetailPoem(''), { wrapper })

        // Should only be called once for the reset on mount
        expect(poemActions.getPoemAction).toHaveBeenCalledTimes(1)
        expect(poemActions.getPoemAction).toHaveBeenCalledWith({
            options: { reset: true, fetch: false }
        })
    })

    test('should fetch new poem when poemId changes', () => {
        const { rerender } = renderHook(({ poemId }) => useDetailPoem(poemId), {
            wrapper,
            initialProps: { poemId: 'poem-123' }
        })

        ;(poemActions.getPoemAction as jest.Mock).mockClear()

        rerender({ poemId: 'poem-456' })

        expect(poemActions.getPoemAction).toHaveBeenCalledWith({
            params: { poemId: 'poem-456' },
            options: { reset: true, fetch: true }
        })
    })

    test('should return isLoading as false initially', () => {
        const { result } = renderHook(() => useDetailPoem('poem-123'), { wrapper })

        expect(result.current.isLoading).toBe(false)
    })

    // Regression: Detail now derives its poem from the normalized poemEntities
    // store (the single source of truth) rather than a bespoke single-poem cache.
    describe('reads from the normalized entity store', () => {
        const entityPoem: Poem = {
            id: 'poem-detail-entity',
            author: 'Ada Lovelace',
            date: '2024-01-01',
            genre: 'love',
            likes: [],
            picture: 'ada.jpg',
            poem: 'Analytical verses',
            title: 'The Engine',
            userId: 'author-ada'
        }

        afterEach(() => {
            act(() => {
                store.dispatch(poemRemoved(entityPoem.id))
            })
        })

        test('returns the poem held in poemEntities', () => {
            act(() => {
                store.dispatch(poemUpserted(entityPoem))
            })

            const { result } = renderHook(() => useDetailPoem(entityPoem.id), { wrapper })

            expect(result.current.poem).toEqual(entityPoem)
        })

        test('reflects a like applied to the entity without a separate cache patch', () => {
            act(() => {
                store.dispatch(poemUpserted(entityPoem))
            })

            const { result } = renderHook(() => useDetailPoem(entityPoem.id), { wrapper })
            expect(result.current.poem.likes).toEqual([])

            // A like updates the ONE entity; the Detail view re-reads it live —
            // this is exactly what the deleted updatePoemCacheAfterLikePoemAction did.
            act(() => {
                store.dispatch(poemUpdated({ id: entityPoem.id, changes: { likes: ['user-99'] } }))
            })

            expect(result.current.poem.likes).toEqual(['user-99'])
        })
    })
})
