import { renderHook, act } from '@testing-library/react-hooks'
import { Provider } from 'react-redux'
import { useProfileForm } from './useProfileForm'
import store from '../../../redux/store'
import * as poemActions from '../../../redux/actions/poemActions'
import * as poemsActions from '../../../redux/actions/poemsActions'
import React from 'react'

// Mock the notification utils
jest.mock('../../../utils/notifications', () => ({
    manageSuccess: jest.fn(),
    manageError: jest.fn()
}))

// Mock the Redux actions
jest.mock('../../../redux/actions/poemActions')
jest.mock('../../../redux/actions/poemsActions')

describe('useProfileForm', () => {
    const mockContext = {
        userId: 'user-123',
        adminId: 'admin-456',
        elementToEdit: '',
        setState: jest.fn()
    }

    const mockPoemQuery = {
        item: null
    }

    const mockPoemsListQuery = {
        item: null
    }

    const wrapper: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
        <Provider store={store}>{children}</Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        ;(poemActions.getPoemAction as jest.Mock).mockReturnValue({ type: 'GET_POEM' })
        ;(poemActions.savePoemAction as jest.Mock).mockReturnValue({ type: 'SAVE_POEM' })
        ;(poemsActions.createPoemAction as jest.Mock).mockReturnValue({ type: 'CREATE_POEM' })
        ;(poemsActions.updateAllPoemsCacheAfterCreatePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_CACHE'
        })
        ;(poemsActions.updateAllPoemsCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_ALL_POEMS_CACHE'
        })
        ;(poemsActions.updateMyPoemsCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_MY_POEMS_CACHE'
        })
        ;(poemsActions.updatePoemsListCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_POEMS_LIST_CACHE'
        })
    })

    test('should initialize with empty poem data', () => {
        const { result } = renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery, undefined), {
            wrapper
        })

        expect(result.current.poem).toEqual({
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        })
    })

    test('should update poem field when updatePoemField is called', () => {
        const { result } = renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery, undefined), {
            wrapper
        })

        act(() => {
            result.current.updatePoemField('title', 'New Poem Title')
        })

        expect(result.current.poem.title).toBe('New Poem Title')
    })

    test('should update multiple poem fields independently', () => {
        const { result } = renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery, undefined), {
            wrapper
        })

        act(() => {
            result.current.updatePoemField('title', 'My Poem')
            result.current.updatePoemField('content', 'Poem content here')
            result.current.updatePoemField('category', 'love')
        })

        expect(result.current.poem).toMatchObject({
            title: 'My Poem',
            content: 'Poem content here',
            category: 'love'
        })
    })

    test('should load poem data when elementToEdit is provided', () => {
        const mockPoemQueryWithItem = {
            item: {
                id: 'poem-123',
                title: 'Existing Poem',
                poem: 'This is the poem content',
                userId: 'user-456',
                genre: 'nature',
                origin: 'famous',
                likes: ['user1', 'user2']
            }
        }

        const contextWithEdit = {
            ...mockContext,
            elementToEdit: 'poem-123'
        }

        const { result } = renderHook(
            () => useProfileForm(contextWithEdit, mockPoemQueryWithItem, mockPoemsListQuery, undefined),
            {
                wrapper
            }
        )

        expect(result.current.poem).toEqual({
            title: 'Existing Poem',
            content: 'This is the poem content',
            fakeId: 'user-456',
            category: 'nature',
            origin: 'famous',
            likes: 'user1,user2'
        })
    })

    test('should reset poem data when handleReset is called', () => {
        const { result } = renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery, undefined), {
            wrapper
        })

        // Set some data first
        act(() => {
            result.current.updatePoemField('title', 'Test Poem')
            result.current.updatePoemField('content', 'Test content')
        })

        // Reset
        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleReset(mockEvent)
        })

        expect(result.current.poem).toEqual({
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        })
    })

    test('should update poem field with different types of values', () => {
        const { result } = renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery, undefined), {
            wrapper
        })

        act(() => {
            result.current.updatePoemField('likes', 'user1,user2,user3')
        })

        expect(result.current.poem.likes).toBe('user1,user2,user3')

        act(() => {
            result.current.updatePoemField('likes', [])
        })

        expect(result.current.poem.likes).toEqual([])
    })

    test('should maintain other poem fields when updating one field', () => {
        const { result } = renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery, undefined), {
            wrapper
        })

        act(() => {
            result.current.updatePoemField('title', 'Title')
            result.current.updatePoemField('content', 'Content')
            result.current.updatePoemField('category', 'love')
        })

        act(() => {
            result.current.updatePoemField('title', 'Updated Title')
        })

        expect(result.current.poem).toMatchObject({
            title: 'Updated Title',
            content: 'Content',
            category: 'love'
        })
    })

    test('should clear poem data when elementToEdit is removed', () => {
        const mockPoemQueryWithItem = {
            item: {
                id: 'poem-123',
                title: 'Existing Poem',
                poem: 'Content',
                userId: 'user-456',
                genre: 'nature',
                origin: 'famous',
                likes: []
            }
        }

        let testContext = {
            ...mockContext,
            elementToEdit: 'poem-123'
        }

        const { result, rerender } = renderHook(
            () => useProfileForm(testContext, mockPoemQueryWithItem, mockPoemsListQuery, undefined),
            {
                wrapper
            }
        )

        // Verify it loaded
        expect(result.current.poem.title).toBe('Existing Poem')

        // Remove elementToEdit
        testContext = {
            ...mockContext,
            elementToEdit: ''
        }

        rerender()

        // Should reset to initial state
        expect(result.current.poem).toEqual({
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        })
    })

    test('should call all cache update actions when saving a poem', () => {
        const mockPoemQueryWithItem = {
            item: {
                id: 'poem-123',
                title: 'Existing Poem',
                poem: 'This is the poem content',
                userId: 'user-123',
                genre: 'nature',
                origin: 'famous',
                likes: []
            }
        }

        const contextWithEdit = {
            ...mockContext,
            elementToEdit: 'poem-123'
        }

        // Mock savePoemAction to call the success callback
        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return (dispatch: any) => {
                // Simulate success callback
                if (callbacks && callbacks.success) {
                    callbacks.success()
                }
                return Promise.resolve()
            }
        })

        // Mock all cache update actions
        ;(poemsActions.updateAllPoemsCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_ALL_POEMS_CACHE'
        })
        ;(poemsActions.updateMyPoemsCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_MY_POEMS_CACHE'
        })
        ;(poemsActions.updatePoemsListCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_POEMS_LIST_CACHE'
        })

        const { result } = renderHook(
            () => useProfileForm(contextWithEdit, mockPoemQueryWithItem, mockPoemsListQuery, undefined),
            {
                wrapper
            }
        )

        // Update the poem
        act(() => {
            result.current.updatePoemField('title', 'Updated Poem')
            result.current.updatePoemField('content', 'Updated content')
        })

        // Trigger save
        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        // Verify all three cache update actions were called
        expect(poemsActions.updateAllPoemsCacheAfterSavePoemAction).toHaveBeenCalledWith({
            poem: expect.objectContaining({
                title: 'Updated Poem',
                poem: 'Updated content'
            }),
            poemId: 'poem-123'
        })

        expect(poemsActions.updateMyPoemsCacheAfterSavePoemAction).toHaveBeenCalledWith({
            poem: expect.objectContaining({
                title: 'Updated Poem',
                poem: 'Updated content'
            }),
            poemId: 'poem-123'
        })

        expect(poemsActions.updatePoemsListCacheAfterSavePoemAction).toHaveBeenCalledWith({
            poem: expect.objectContaining({
                title: 'Updated Poem',
                poem: 'Updated content'
            }),
            poemId: 'poem-123'
        })
    })

    test('should call savePoemAction with correct parameters when editing', () => {
        const mockPoemQueryWithItem = {
            item: {
                id: 'poem-123',
                title: 'Existing Poem',
                poem: 'Content',
                userId: 'user-123',
                genre: 'nature',
                origin: 'famous',
                likes: []
            }
        }

        const contextWithEdit = {
            ...mockContext,
            elementToEdit: 'poem-123'
        }

        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(() => {
            return () => Promise.resolve()
        })

        const { result } = renderHook(
            () => useProfileForm(contextWithEdit, mockPoemQueryWithItem, mockPoemsListQuery, undefined),
            {
                wrapper
            }
        )

        act(() => {
            result.current.updatePoemField('title', 'Updated Title')
        })

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        expect(poemActions.savePoemAction).toHaveBeenCalledWith(
            expect.objectContaining({
                params: { poemId: 'poem-123' },
                context: contextWithEdit,
                data: expect.objectContaining({
                    title: 'Updated Title'
                })
            })
        )
    })

    test('should NOT call cache update actions if save fails', () => {
        const mockPoemQueryWithItem = {
            item: {
                id: 'poem-123',
                title: 'Existing Poem',
                poem: 'Content',
                userId: 'user-123',
                genre: 'nature',
                origin: 'famous',
                likes: []
            }
        }

        const contextWithEdit = {
            ...mockContext,
            elementToEdit: 'poem-123'
        }

        // Mock savePoemAction to call the error callback
        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return (dispatch: any) => {
                // Simulate error callback
                if (callbacks && callbacks.error) {
                    callbacks.error()
                }
                return Promise.resolve() // Return resolved promise to avoid unhandled rejection
            }
        })
        ;(poemsActions.updateAllPoemsCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_ALL_POEMS_CACHE'
        })
        ;(poemsActions.updateMyPoemsCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_MY_POEMS_CACHE'
        })
        ;(poemsActions.updatePoemsListCacheAfterSavePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_POEMS_LIST_CACHE'
        })

        const { result } = renderHook(
            () => useProfileForm(contextWithEdit, mockPoemQueryWithItem, mockPoemsListQuery, undefined),
            {
                wrapper
            }
        )

        act(() => {
            result.current.updatePoemField('title', 'Updated Poem')
        })

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        // Cache updates should NOT have been called because save failed
        expect(poemsActions.updateAllPoemsCacheAfterSavePoemAction).not.toHaveBeenCalled()
        expect(poemsActions.updateMyPoemsCacheAfterSavePoemAction).not.toHaveBeenCalled()
        expect(poemsActions.updatePoemsListCacheAfterSavePoemAction).not.toHaveBeenCalled()
    })
})
