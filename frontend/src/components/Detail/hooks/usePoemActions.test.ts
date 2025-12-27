import { renderHook, act } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { usePoemActions } from './usePoemActions'
import store from '../../../redux/store'
import * as poemActions from '../../../redux/actions/poemActions'
import * as poemsActions from '../../../redux/actions/poemsActions'
import { manageSuccess, manageError } from '../../../utils/notifications'
import React from 'react'

jest.mock('../../../redux/actions/poemActions')
jest.mock('../../../redux/actions/poemsActions')
jest.mock('../../../utils/notifications', () => ({
    manageSuccess: jest.fn(),
    manageError: jest.fn()
}))

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}))

describe('usePoemActions', () => {
    const wrapper = ({ children }: any) =>
        React.createElement(BrowserRouter, null, React.createElement(Provider, { store, children }))

    const mockContext: any = {
        user: 'testuser',
        userId: 'user-123',
        adminId: 'admin-456',
        setState: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(poemActions.likePoemAction as jest.Mock).mockReturnValue({ type: 'LIKE_POEM' })
        ;(poemActions.deletePoemAction as jest.Mock).mockReturnValue({ type: 'DELETE_POEM' })
        ;(poemsActions.updatePoemsListCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_POEMS_LIST_CACHE'
        })
        ;(poemsActions.updateRankingCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_RANKING_CACHE'
        })
        ;(poemsActions.updateAllPoemsCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_ALL_POEMS_CACHE'
        })
        ;(poemActions.updatePoemCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_POEM_CACHE'
        })
    })

    test('should return handler functions', () => {
        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        expect(result.current.handleLike).toBeDefined()
        expect(result.current.handleDelete).toBeDefined()
        expect(result.current.handleEdit).toBeDefined()
        expect(typeof result.current.handleLike).toBe('function')
        expect(typeof result.current.handleDelete).toBe('function')
        expect(typeof result.current.handleEdit).toBe('function')
    })

    test('should call preventDefault when handleLike is invoked', () => {
        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.SyntheticEvent

        act(() => {
            result.current.handleLike(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    test('should dispatch likePoemAction when handleLike is called', () => {
        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.SyntheticEvent

        act(() => {
            result.current.handleLike(mockEvent)
        })

        expect(poemActions.likePoemAction).toHaveBeenCalledWith({
            params: { poemId: 'poem-123' },
            context: mockContext,
            callbacks: expect.objectContaining({
                success: expect.any(Function)
            })
        })
    })

    test('should dispatch all cache update actions on like success', () => {
        ;(poemActions.likePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success()
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.SyntheticEvent

        act(() => {
            result.current.handleLike(mockEvent)
        })

        expect(poemsActions.updatePoemsListCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemsActions.updateRankingCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemsActions.updateAllPoemsCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemActions.updatePoemCacheAfterLikePoemAction).toHaveBeenCalledWith({
            context: mockContext
        })
    })

    test('should call preventDefault when handleDelete is invoked', () => {
        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.SyntheticEvent

        act(() => {
            result.current.handleDelete(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    test('should dispatch deletePoemAction when handleDelete is called', () => {
        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.SyntheticEvent

        act(() => {
            result.current.handleDelete(mockEvent)
        })

        expect(poemActions.deletePoemAction).toHaveBeenCalledWith({
            params: { poemId: 'poem-123' },
            context: mockContext,
            callbacks: expect.objectContaining({
                success: expect.any(Function),
                error: expect.any(Function)
            })
        })
    })

    test('should navigate to home and show success message on delete success', () => {
        ;(poemActions.deletePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success()
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.SyntheticEvent

        act(() => {
            result.current.handleDelete(mockEvent)
        })

        expect(mockHistoryPush).toHaveBeenCalledWith('/')
        expect(manageSuccess).toHaveBeenCalledWith('Poem deleted')
    })

    test('should show error message on delete failure', () => {
        ;(poemActions.deletePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.error) {
                    callbacks.error()
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.SyntheticEvent

        act(() => {
            result.current.handleDelete(mockEvent)
        })

        expect(manageError).toHaveBeenCalledWith('Sorry. There was an error deleting the poem')
    })

    test('should update context and navigate to profile when handleEdit is called', () => {
        const { result } = renderHook(() => usePoemActions('poem-123', mockContext), { wrapper })

        act(() => {
            result.current.handleEdit()
        })

        expect(mockContext.setState).toHaveBeenCalledWith({
            ...mockContext,
            elementToEdit: 'poem-123'
        })
        expect(mockHistoryPush).toHaveBeenCalledWith('/profile')
    })
})
