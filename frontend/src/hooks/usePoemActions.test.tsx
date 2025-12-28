import { renderHook } from '@testing-library/react-hooks'
import { usePoemActions } from './usePoemActions'
import * as poemActions from '../redux/actions/poemActions'
import * as poemsActions from '../redux/actions/poemsActions'
import * as notifications from '../utils/notifications'
import { Poem, Context } from '../typescript/interfaces'

// Mock dependencies
jest.mock('../redux/actions/poemActions')
jest.mock('../redux/actions/poemsActions')
jest.mock('../utils/notifications')

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        push: mockHistoryPush
    })
}))

const mockDispatch = jest.fn()

jest.mock('../redux/store', () => ({
    useAppDispatch: () => mockDispatch
}))

describe('usePoemActions', () => {
    const mockPoem: Poem = {
        id: 'poem-123',
        title: 'Test Poem',
        author: 'Test Author',
        poem: 'Test content',
        genre: 'love',
        likes: ['user-1'],
        userId: 'user-1',
        picture: 'pic.jpg',
        date: '2024-01-01'
    }

    const mockContext: Context = {
        user: 'user-token',
        userId: 'user-1',
        username: 'testuser',
        picture: 'avatar.jpg',
        adminId: 'admin-1',
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(poemActions.deletePoemAction as jest.Mock).mockReturnValue({ type: 'DELETE_POEM' })
        ;(poemActions.likePoemAction as jest.Mock).mockReturnValue({ type: 'LIKE_POEM' })
        ;(poemsActions.updatePoemsListCacheAfterDeletePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_CACHE_DELETE'
        })
        ;(poemsActions.updateRankingCacheAfterDeletePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_RANKING_DELETE'
        })
        ;(poemsActions.updateMyPoemsCacheAfterDeletePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_MY_POEMS_DELETE'
        })
        ;(poemsActions.updatePoemsListCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_CACHE_LIKE'
        })
        ;(poemsActions.updateRankingCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_RANKING_LIKE'
        })
        ;(poemsActions.updateAllPoemsCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_ALL_POEMS_LIKE'
        })
        ;(poemsActions.updateMyFavouritePoemsCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_MY_FAVOURITE_POEMS_LIKE'
        })
        ;(poemActions.updatePoemCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_POEM_LIKE'
        })
    })

    test('should return onDelete, onLike, and onEdit functions', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        expect(result.current.onDelete).toBeDefined()
        expect(result.current.onLike).toBeDefined()
        expect(result.current.onEdit).toBeDefined()
        expect(typeof result.current.onDelete).toBe('function')
        expect(typeof result.current.onLike).toBe('function')
        expect(typeof result.current.onEdit).toBe('function')
    })

    test('onDelete should dispatch deletePoemAction', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onDelete(mockEvent)

        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(poemActions.deletePoemAction).toHaveBeenCalledWith({
            params: { poemId: 'poem-123' },
            context: mockContext,
            callbacks: expect.objectContaining({
                success: expect.any(Function),
                error: expect.any(Function)
            })
        })
    })

    test('onDelete success callback should update caches and show success notification', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onDelete(mockEvent)

        // Get the success callback and call it
        const deletePoemCall = (poemActions.deletePoemAction as jest.Mock).mock.calls[0][0]
        deletePoemCall.callbacks.success()

        expect(poemsActions.updatePoemsListCacheAfterDeletePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123'
        })
        expect(poemsActions.updateRankingCacheAfterDeletePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123'
        })
        expect(poemsActions.updateMyPoemsCacheAfterDeletePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123'
        })
        expect(notifications.manageSuccess).toHaveBeenCalledWith('Poem deleted')
    })

    test('onDelete success callback with custom onDeleteSuccess should call it', () => {
        const mockOnDeleteSuccess = jest.fn()
        const { result } = renderHook(() =>
            usePoemActions({ poem: mockPoem, context: mockContext, onDeleteSuccess: mockOnDeleteSuccess })
        )

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onDelete(mockEvent)

        // Get the success callback and call it
        const deletePoemCall = (poemActions.deletePoemAction as jest.Mock).mock.calls[0][0]
        deletePoemCall.callbacks.success()

        expect(mockOnDeleteSuccess).toHaveBeenCalled()
    })

    test('onDelete error callback should show error notification', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onDelete(mockEvent)

        // Get the error callback and call it
        const deletePoemCall = (poemActions.deletePoemAction as jest.Mock).mock.calls[0][0]
        deletePoemCall.callbacks.error()

        expect(notifications.manageError).toHaveBeenCalledWith('Sorry. There was an error deleting the poem')
    })

    test('onLike should dispatch likePoemAction', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onLike(mockEvent)

        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(poemActions.likePoemAction).toHaveBeenCalledWith({
            params: { poemId: 'poem-123' },
            context: mockContext,
            callbacks: expect.objectContaining({
                success: expect.any(Function)
            })
        })
    })

    test('onLike success callback should update all caches', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onLike(mockEvent)

        // Get the success callback and call it
        const likePoemCall = (poemActions.likePoemAction as jest.Mock).mock.calls[0][0]
        likePoemCall.callbacks.success()

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
        expect(poemsActions.updateMyFavouritePoemsCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemActions.updatePoemCacheAfterLikePoemAction).toHaveBeenCalledWith({
            context: mockContext
        })
    })

    test('onEdit should navigate to profile with edit query param', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        result.current.onEdit()

        expect(mockHistoryPush).toHaveBeenCalledWith({
            pathname: '/profile',
            search: '?edit=poem-123',
            state: {
                poemData: mockPoem
            }
        })
    })
})
