import { renderHook, waitFor, act } from '@testing-library/react'
import { useComments } from './useComments'
import API from '../../redux/actions/axiosInstance'

jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

const mockComment = {
    id: 'c1',
    targetType: 'poem' as const,
    targetId: 'poem-123',
    authorId: 'author-1',
    authorName: 'Alice',
    authorPicture: null,
    authorSlug: 'alice',
    body: 'Lovely poem',
    parentId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
}

describe('useComments', () => {
    let mockGet: jest.Mock
    let mockPost: jest.Mock
    let mockDelete: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        mockGet = jest.fn()
        mockPost = jest.fn()
        mockDelete = jest.fn()
        ;(API as jest.Mock).mockReturnValue({ get: mockGet, post: mockPost, delete: mockDelete })
    })

    test('fetches comments on mount', async () => {
        mockGet.mockResolvedValue({ data: [mockComment] })

        const { result } = renderHook(() => useComments('poem', 'poem-123'))

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(mockGet).toHaveBeenCalledWith(
            expect.stringContaining('targetType=poem&targetId=poem-123')
        )
        expect(result.current.comments).toHaveLength(1)
        expect(result.current.comments[0].body).toBe('Lovely poem')
    })

    test('sets isLoading true while fetching', async () => {
        let resolve: (v: any) => void
        mockGet.mockReturnValue(new Promise(r => { resolve = r }))

        const { result } = renderHook(() => useComments('poem', 'poem-123'))

        expect(result.current.isLoading).toBe(true)
        act(() => resolve({ data: [] }))
        await waitFor(() => expect(result.current.isLoading).toBe(false))
    })

    test('sets error when fetch fails', async () => {
        mockGet.mockRejectedValue(new Error('Network error'))

        const { result } = renderHook(() => useComments('poem', 'poem-123'))

        await waitFor(() => expect(result.current.isLoading).toBe(false))
        expect(result.current.error).toBe('Failed to load comments')
        expect(result.current.comments).toHaveLength(0)
    })

    test('does not fetch when targetId is empty', async () => {
        renderHook(() => useComments('poem', ''))

        expect(mockGet).not.toHaveBeenCalled()
    })

    test('addComment posts to the API and appends to state', async () => {
        mockGet.mockResolvedValue({ data: [] })
        mockPost.mockResolvedValue({ data: mockComment })

        const { result } = renderHook(() => useComments('poem', 'poem-123'))
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        await act(async () => {
            await result.current.addComment('Lovely poem', { headers: { Authorization: 'Bearer t' } })
        })

        expect(mockPost).toHaveBeenCalledWith(
            expect.stringContaining('/comments'),
            expect.objectContaining({ body: 'Lovely poem', targetType: 'poem', targetId: 'poem-123' }),
            { headers: { Authorization: 'Bearer t' } }
        )
        expect(result.current.comments).toHaveLength(1)
    })

    test('addComment passes parentId when provided', async () => {
        mockGet.mockResolvedValue({ data: [] })
        mockPost.mockResolvedValue({ data: { ...mockComment, parentId: 'parent-1' } })

        const { result } = renderHook(() => useComments('poem', 'poem-123'))
        await waitFor(() => expect(result.current.isLoading).toBe(false))

        await act(async () => {
            await result.current.addComment('Reply', {}, 'parent-1')
        })

        expect(mockPost).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ parentId: 'parent-1' }),
            {}
        )
    })

    test('deleteComment calls DELETE and removes from state', async () => {
        mockGet.mockResolvedValue({ data: [mockComment] })
        mockDelete.mockResolvedValue({})

        const { result } = renderHook(() => useComments('poem', 'poem-123'))
        await waitFor(() => expect(result.current.comments).toHaveLength(1))

        await act(async () => {
            await result.current.deleteComment('c1', {})
        })

        expect(mockDelete).toHaveBeenCalledWith(
            expect.stringContaining('/c1'),
            {}
        )
        expect(result.current.comments).toHaveLength(0)
    })

    test('refetches when targetId changes', async () => {
        mockGet.mockResolvedValue({ data: [] })

        const { rerender } = renderHook(
            ({ targetId }) => useComments('poem', targetId),
            { initialProps: { targetId: 'poem-1' } }
        )

        await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1))

        rerender({ targetId: 'poem-2' })
        await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2))
        expect(mockGet).toHaveBeenLastCalledWith(expect.stringContaining('targetId=poem-2'))
    })
})
