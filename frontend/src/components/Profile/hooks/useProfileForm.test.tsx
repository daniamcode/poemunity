/* eslint-disable max-lines */
import { renderHook, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { useProfileForm } from './useProfileForm'
import store from '../../../redux/store'
import * as poemActions from '../../../redux/actions/poemActions'
import * as poemsActions from '../../../redux/actions/poemsActions'
import { poemUpdated } from '../../../redux/reducers/poemEntitiesReducers'
import { manageSuccess, manageError } from '../../../utils/notifications'
import React from 'react'
import mockRouter from 'next-router-mock'

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
        isAdmin: false,
        elementToEdit: '',
        setState: jest.fn()
    }

    const mockPoemQuery = {
        item: null
    }

    const mockPoemsListQuery = {
        item: null
    }

    const setEditUrl = (poemId: string) => {
        mockRouter.setCurrentUrl(`/profile?edit=${poemId}`)
    }

    const wrapper: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => (
        <Provider store={store}>{children}</Provider>
    )

    beforeEach(() => {
        jest.clearAllMocks()
        mockRouter.setCurrentUrl('/profile')
        ;(poemActions.getPoemAction as jest.Mock).mockReturnValue({ type: 'GET_POEM' })
        ;(poemActions.savePoemAction as jest.Mock).mockReturnValue({ type: 'SAVE_POEM' })
        ;(poemsActions.createPoemAction as jest.Mock).mockReturnValue({ type: 'CREATE_POEM' })
        ;(poemsActions.insertPoemIntoCaches as jest.Mock).mockReturnValue({
            type: 'INSERT_POEM_INTO_CACHES'
        })
        ;(poemsActions.setRanking as jest.Mock).mockReturnValue({
            type: 'SET_RANKING'
        })
    })

    test('should initialize with empty poem data', () => {
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

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
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        act(() => {
            result.current.updatePoemField('title', 'New Poem Title')
        })

        expect(result.current.poem.title).toBe('New Poem Title')
    })

    test('should update multiple poem fields independently', () => {
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

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

        setEditUrl('poem-123')

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQueryWithItem, mockPoemsListQuery),
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
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

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
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

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
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

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

        setEditUrl('poem-123')

        const { result, rerender } = renderHook(
            () => useProfileForm(mockContext, mockPoemQueryWithItem, mockPoemsListQuery),
            {
                wrapper
            }
        )

        // Verify it loaded
        expect(result.current.poem.title).toBe('Existing Poem')

        // Remove edit param from URL
        mockRouter.setCurrentUrl('/profile')

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

    test('should merge edits into the single poem entity when saving', () => {
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

        setEditUrl('poem-123')

        // Mock savePoemAction to call the success callback
        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                // Simulate success callback
                if (callbacks && callbacks.success) {
                    callbacks.success()
                }
                return Promise.resolve()
            }
        })

        const dispatchSpy = jest.spyOn(store, 'dispatch')

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQueryWithItem, mockPoemsListQuery),
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

        // Single source of truth: one poemUpdated merges the edited fields into
        // the entity; every view re-reads it (no per-cache patching).
        expect(dispatchSpy).toHaveBeenCalledWith(
            poemUpdated({
                id: 'poem-123',
                changes: expect.objectContaining({
                    title: 'Updated Poem',
                    poem: 'Updated content'
                })
            })
        )

        dispatchSpy.mockRestore()
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

        setEditUrl('poem-123')

        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(() => {
            return () => Promise.resolve()
        })

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQueryWithItem, mockPoemsListQuery),
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
                context: mockContext,
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

        setEditUrl('poem-123')

        // Mock savePoemAction to call the error callback
        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                // Simulate error callback
                if (callbacks && callbacks.error) {
                    callbacks.error()
                }
                return Promise.resolve() // Return resolved promise to avoid unhandled rejection
            }
        })
        const dispatchSpy = jest.spyOn(store, 'dispatch')

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQueryWithItem, mockPoemsListQuery),
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

        // The entity must NOT be mutated because the save failed.
        const dispatchedPoemUpdated = dispatchSpy.mock.calls.some(
            ([action]: any[]) => action?.type === poemUpdated({ id: 'x', changes: {} }).type
        )
        expect(dispatchedPoemUpdated).toBe(false)

        dispatchSpy.mockRestore()
    })

    test('should initialize from poemsListQuery cache when poemQuery is empty', () => {
        const mockPoemsListQueryWithData = {
            item: [
                {
                    id: 'poem-111',
                    title: 'Poem from List',
                    poem: 'Content from list cache',
                    userId: 'user-222',
                    genre: 'romance',
                    origin: 'user',
                    likes: ['user5']
                },
                {
                    id: 'poem-222',
                    title: 'Another Poem',
                    poem: 'More content',
                    userId: 'user-333',
                    genre: 'nature',
                    origin: 'user',
                    likes: []
                }
            ]
        }

        setEditUrl('poem-111')

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQueryWithData),
            { wrapper }
        )

        expect(result.current.poem).toEqual({
            title: 'Poem from List',
            content: 'Content from list cache',
            fakeId: 'user-222',
            category: 'romance',
            origin: 'user',
            likes: 'user5'
        })
    })

    test('should dispatch getPoemAction with reset when not editing', () => {
        renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery), { wrapper })

        expect(poemActions.getPoemAction).toHaveBeenCalledWith({
            options: { reset: true, fetch: false }
        })
    })

    test('should dispatch getPoemAction to fetch poem when editing and not in cache', () => {
        setEditUrl('poem-not-in-cache')

        renderHook(() => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery), { wrapper })

        expect(poemActions.getPoemAction).toHaveBeenCalledWith({
            params: { poemId: 'poem-not-in-cache' },
            options: { reset: false, fetch: true }
        })
    })

    test('should create a new poem when handleSend is called and not editing', () => {
        ;(poemsActions.createPoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success({ id: 'new-poem-123' })
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        act(() => {
            result.current.updatePoemField('title', 'New Poem')
            result.current.updatePoemField('content', 'New poem content')
            result.current.updatePoemField('category', 'love')
        })

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        expect(poemsActions.createPoemAction).toHaveBeenCalledWith(
            expect.objectContaining({
                poem: expect.objectContaining({
                    title: 'New Poem',
                    poem: 'New poem content'
                }),
                context: mockContext
            })
        )
    })

    test('should update cache after creating a poem successfully', () => {
        // The create response is the new poem with a `ranking` sibling.
        const createdPoem = { id: 'new-poem-456', title: 'Created Poem', userId: 'author-1' }
        const createdRanking = [{ userId: 'author-1', author: 'Ana', picture: 'a.jpg', points: 3 }]
        const mockResponse = { ...createdPoem, ranking: createdRanking }

        ;(poemsActions.createPoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success(mockResponse)
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        act(() => {
            result.current.updatePoemField('title', 'Test Create')
            result.current.updatePoemField('content', 'Test content')
        })

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        // The new poem is registered as an entity and its id is inserted into the
        // relevant list caches by a single thunk (replaces the create-cache family).
        // The poem is unwrapped from the { poem, ranking } envelope.
        expect(poemsActions.insertPoemIntoCaches).toHaveBeenCalledWith({
            response: createdPoem
        })
        // The server-recomputed ranking from the response is adopted verbatim.
        expect(poemsActions.setRanking).toHaveBeenCalledWith(createdRanking)
    })

    test('should reset form after creating a poem', () => {
        ;(poemsActions.createPoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success({ id: 'new-poem' })
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        act(() => {
            result.current.updatePoemField('title', 'Will be reset')
            result.current.updatePoemField('content', 'Will be reset too')
        })

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        // Form should be reset to initial state
        expect(result.current.poem).toEqual({
            content: '',
            fakeId: '',
            title: '',
            origin: '',
            category: '',
            likes: []
        })
    })

    test('should call manageError when create poem fails', () => {
        ;(poemsActions.createPoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.error) {
                    callbacks.error()
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        act(() => {
            result.current.updatePoemField('title', 'Failed Poem')
        })

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        expect(manageError).toHaveBeenCalledWith('Sorry. There was an error creating the poem')
    })

    test('should call preventDefault on handleSend', () => {
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.MouseEvent<HTMLButtonElement>

        act(() => {
            result.current.handleSend(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    test('should call preventDefault on handleReset', () => {
        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        const mockEvent = {
            preventDefault: jest.fn()
        } as unknown as React.MouseEvent<HTMLButtonElement>

        act(() => {
            result.current.handleReset(mockEvent)
        })

        expect(mockEvent.preventDefault).toHaveBeenCalled()
    })

    test('should clear form fields when handleReset is called', () => {
        setEditUrl('poem-to-clear')

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        // Set some values first
        act(() => {
            result.current.updatePoemField('title', 'Test Title')
            result.current.updatePoemField('content', 'Test Content')
            result.current.updatePoemField('category', 'love')
        })

        // Verify fields are set
        expect(result.current.poem.title).toBe('Test Title')
        expect(result.current.poem.content).toBe('Test Content')

        // Reset the form
        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleReset(mockEvent)
        })

        // Fields should be cleared
        expect(result.current.poem.title).toBe('')
        expect(result.current.poem.content).toBe('')
        expect(result.current.poem.category).toBe('')

        // Should NOT have navigated (still in edit mode - query unchanged)
        expect(mockRouter.asPath).toContain('edit=poem-to-clear')
    })

    test('should navigate away when handleCancel is called', () => {
        setEditUrl('poem-to-cancel')

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQuery, mockPoemsListQuery),
            {
                wrapper
            }
        )

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleCancel(mockEvent)
        })

        // Should navigate to /profile (clearing edit param)
        expect(mockRouter.pathname).toBe('/profile')
    })

    test('should call manageSuccess when save poem succeeds', () => {
        const mockPoemQueryWithItem = {
            item: {
                id: 'poem-123',
                title: 'Test',
                poem: 'Content',
                userId: 'user-123',
                genre: 'test',
                origin: 'user',
                likes: []
            }
        }

        setEditUrl('poem-123')

        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.success) {
                    callbacks.success()
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQueryWithItem, mockPoemsListQuery),
            { wrapper }
        )

        act(() => {
            result.current.updatePoemField('title', 'Updated')
        })

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        expect(manageSuccess).toHaveBeenCalledWith('Poem saved')
    })

    test('should call manageError when save poem fails', () => {
        const mockPoemQueryWithItem = {
            item: {
                id: 'poem-123',
                title: 'Test',
                poem: 'Content',
                userId: 'user-123',
                genre: 'test',
                origin: 'user',
                likes: []
            }
        }

        setEditUrl('poem-123')

        ;(poemActions.savePoemAction as jest.Mock).mockImplementation(({ callbacks }) => {
            return () => {
                if (callbacks && callbacks.error) {
                    callbacks.error()
                }
                return Promise.resolve()
            }
        })

        const { result } = renderHook(
            () => useProfileForm(mockContext, mockPoemQueryWithItem, mockPoemsListQuery),
            { wrapper }
        )

        act(() => {
            const mockEvent = {
                preventDefault: jest.fn()
            } as unknown as React.MouseEvent<HTMLButtonElement>
            result.current.handleSend(mockEvent)
        })

        expect(manageError).toHaveBeenCalledWith('Sorry. There was an error saving the poem')
    })
})
