import { renderHook } from '@testing-library/react'
import mockRouter from 'next-router-mock'
import { usePoemActions } from './usePoemActions'
import * as poemActions from '../redux/actions/poemActions'
import * as poemsActions from '../redux/actions/poemsActions'
import * as notifications from '../utils/notifications'
import * as statsActions from '../redux/actions/statsActions'
import { poemUpdated, poemRemoved } from '../redux/reducers/poemEntitiesReducers'
import { Poem, Context } from '../typescript/interfaces'

// Mock dependencies
jest.mock('../redux/actions/poemActions')
jest.mock('../redux/actions/poemsActions')
jest.mock('../utils/notifications')
jest.mock('../redux/actions/statsActions')

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
        isAdmin: false,
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(statsActions.getUserStatsAction as jest.Mock).mockReturnValue({ type: 'GET_USER_STATS' })
        ;(poemActions.savePoemAction as jest.Mock).mockReturnValue({ type: 'SAVE_POEM' })
        ;(poemActions.deletePoemAction as jest.Mock).mockReturnValue({ type: 'DELETE_POEM' })
        ;(poemActions.likePoemAction as jest.Mock).mockReturnValue({ type: 'LIKE_POEM' })
        ;(poemsActions.dropPoemFromCaches as jest.Mock).mockReturnValue({ type: 'DROP_POEM_FROM_CACHES' })
        ;(poemsActions.dropPoemFromFavouritesCache as jest.Mock).mockReturnValue({
            type: 'DROP_POEM_FROM_FAVOURITES'
        })
        ;(poemsActions.addPoemToFavouritesCache as jest.Mock).mockReturnValue({
            type: 'ADD_POEM_TO_FAVOURITES'
        })
        ;(poemsActions.setRanking as jest.Mock).mockReturnValue({ type: 'SET_RANKING' })
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

        // Get the success callback and call it with the server response (which
        // carries the recomputed ranking).
        const deleteRanking = [{ userId: 'user-2', author: 'Bea', picture: 'b.jpg', points: 5 }]
        const deletePoemCall = (poemActions.deletePoemAction as jest.Mock).mock.calls[0][0]
        deletePoemCall.callbacks.success({ ranking: deleteRanking })

        // Remove the ONE entity, then drop its id from every list cache.
        expect(mockDispatch).toHaveBeenCalledWith(poemRemoved('poem-123'))
        expect(poemsActions.dropPoemFromCaches).toHaveBeenCalledWith({ poemId: 'poem-123' })
        // Ranking: adopt the server-recomputed list from the response verbatim.
        expect(poemsActions.setRanking).toHaveBeenCalledWith(deleteRanking)
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

    test('onLike success callback updates the single entity and syncs favourites', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onLike(mockEvent)

        // Get the success callback and call it with the server response (carries
        // the recomputed ranking).
        const likeRanking = [{ userId: 'user-1', author: 'Ana', picture: 'a.jpg', points: 7 }]
        const likePoemCall = (poemActions.likePoemAction as jest.Mock).mock.calls[0][0]
        likePoemCall.callbacks.success({ poem: {}, ranking: likeRanking })

        // mockPoem is already liked by user-1, so this like toggles to an UNLIKE:
        // one poemUpdated with user-1 removed from the likes array. Every view
        // (including Detail) re-reads that entity — no separate cache patch.
        expect(mockDispatch).toHaveBeenCalledWith(poemUpdated({ id: 'poem-123', changes: { likes: [] } }))
        // Unliking removes the poem from the filtered "my favourites" view...
        expect(poemsActions.dropPoemFromFavouritesCache).toHaveBeenCalledWith({ poemId: 'poem-123' })
        // ...and never ADDS it back on an unlike.
        expect(poemsActions.addPoemToFavouritesCache).not.toHaveBeenCalled()
        // Ranking: adopt the server-recomputed list from the response verbatim.
        expect(poemsActions.setRanking).toHaveBeenCalledWith(likeRanking)
    })

    test('onLike success callback (liking a not-yet-liked poem) adds to favourites and credits ranking', () => {
        // A poem the current user has NOT yet liked, authored by someone else.
        const unlikedPoem: Poem = { ...mockPoem, likes: [], userId: 'author-9' }
        const { result } = renderHook(() => usePoemActions({ poem: unlikedPoem, context: mockContext }))

        const mockEvent = { preventDefault: jest.fn() } as any
        result.current.onLike(mockEvent)

        const likeRanking = [{ userId: 'author-9', author: 'Cid', picture: 'c.jpg', points: 4 }]
        const likePoemCall = (poemActions.likePoemAction as jest.Mock).mock.calls[0][0]
        likePoemCall.callbacks.success({ poem: {}, ranking: likeRanking })

        // Toggles to a LIKE: user-1 added to the entity's likes.
        expect(mockDispatch).toHaveBeenCalledWith(
            poemUpdated({ id: 'poem-123', changes: { likes: ['user-1'] } })
        )
        // Liking adds the poem to the favourites view (symmetric to the unlike drop).
        expect(poemsActions.addPoemToFavouritesCache).toHaveBeenCalledWith({ poemId: 'poem-123' })
        expect(poemsActions.dropPoemFromFavouritesCache).not.toHaveBeenCalled()
        // Ranking: adopt the server-recomputed list from the response verbatim.
        expect(poemsActions.setRanking).toHaveBeenCalledWith(likeRanking)
    })

    // -----------------------------------------------------------------------
    // The stats panel showed mount-time numbers until a reload — reported the
    // day it shipped: publishing a poem left "Poems published" on its old value.
    //
    // The rule these pin: THE MUTATIONS THAT ADOPT A FRESH RANKING ARE THE
    // MUTATIONS THAT CHANGE YOUR STATS. Liking is the deliberate exception —
    // it changes the stats of the poem's author, who is somebody else.
    // -----------------------------------------------------------------------
    describe('keeping the stats panel current', () => {
        test('deleting a poem refetches your stats', () => {
            const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))
            const mockEvent = { preventDefault: jest.fn() } as any

            result.current.onDelete(mockEvent)
            const successCallback = (poemActions.deletePoemAction as jest.Mock).mock.calls[0][0].callbacks.success
            successCallback({ ranking: [] })

            expect(statsActions.getUserStatsAction).toHaveBeenCalledTimes(1)
        })

        test('publishing a draft refetches your stats', () => {
            const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))
            const mockEvent = { preventDefault: jest.fn() } as any

            result.current.onPublish(mockEvent)
            const successCallback = (poemActions.savePoemAction as jest.Mock).mock.calls[0][0].callbacks.success
            successCallback({ ranking: [] })

            expect(statsActions.getUserStatsAction).toHaveBeenCalledTimes(1)
        })

        test('withdrawing a poem refetches your stats too', () => {
            // Not symmetry for its own sake: withdrawing also removes that
            // poem's likes from `likesReceived`, and the client has no idea how
            // many it had — which is why this refetches rather than adjusting
            // the count by one.
            const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))
            const mockEvent = { preventDefault: jest.fn() } as any

            result.current.onUnpublish(mockEvent)
            const successCallback = (poemActions.savePoemAction as jest.Mock).mock.calls[0][0].callbacks.success
            successCallback({ ranking: [] })

            expect(statsActions.getUserStatsAction).toHaveBeenCalledTimes(1)
        })

        test('liking somebody else’s poem does NOT refetch your stats', () => {
            // The distractor. A like changes the POEM AUTHOR's likesReceived,
            // not the liker's — refetching here would be a request per like
            // that can only ever return the same two numbers.
            const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))
            const mockEvent = { preventDefault: jest.fn() } as any

            result.current.onLike(mockEvent)
            const successCallback = (poemActions.likePoemAction as jest.Mock).mock.calls[0][0].callbacks.success
            successCallback({ likes: ['user-1'], ranking: [] })

            expect(statsActions.getUserStatsAction).not.toHaveBeenCalled()
        })
    })

    test('onEdit should navigate to profile with edit query param', () => {
        const { result } = renderHook(() => usePoemActions({ poem: mockPoem, context: mockContext }))

        result.current.onEdit()

        expect(mockRouter.pathname).toBe('/profile')
        expect(mockRouter.query).toEqual({ edit: 'poem-123' })
    })
})
