/**
 * Integration tests: CommentsSection + useComments wired together.
 * axios is mocked at module level; no other component is stubbed.
 */
import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import CommentsSection from './CommentsSection'
import { AppContext } from '../../App'
import { Context } from '../../typescript/interfaces'

jest.mock('../../redux/actions/axiosInstance', () => ({
    __esModule: true,
    default: jest.fn()
}))

import API from '../../redux/actions/axiosInstance'

const makeComment = (overrides = {}) => ({
    id: `c-${Math.random()}`,
    targetType: 'poem' as const,
    targetId: 'poem-1',
    authorId: 'user-a',
    authorName: 'Alice',
    authorPicture: null,
    authorSlug: 'alice',
    body: 'Nice poem',
    parentId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
})

const buildCtx = (overrides: Partial<Context> = {}): Context => ({
    user: 'jwt-token',
    userId: 'user-a',
    username: 'alice',
    picture: '',
    bio: '',
    preferredGenres: [],
    name: 'Alice',
    surname: '',
    city: '',
    country: '',
    birthYear: null,
    gender: '',
    privateFields: [],
    config: { headers: { Authorization: 'Bearer jwt-token' } },
    adminId: 'admin-1',
    elementToEdit: '',
    setState: jest.fn(),
    ...overrides
})

let mockGet: jest.Mock
let mockPost: jest.Mock
let mockDelete: jest.Mock

beforeEach(() => {
    jest.clearAllMocks()
    mockGet = jest.fn().mockResolvedValue({ data: [] })
    mockPost = jest.fn()
    mockDelete = jest.fn()
    ;(API as jest.Mock).mockReturnValue({ get: mockGet, post: mockPost, delete: mockDelete })
})

const renderSection = (ctx = buildCtx()) =>
    render(
        <AppContext.Provider value={ctx}>
            <CommentsSection targetType='poem' targetId='poem-1' />
        </AppContext.Provider>
    )

// ─── Loading & fetch ──────────────────────────────────────────────────────────

describe('initial load', () => {
    test('shows loading state while fetching', () => {
        mockGet.mockReturnValue(new Promise(() => {}))
        renderSection()
        expect(screen.getByText(/Loading comments/)).toBeInTheDocument()
    })

    test('shows "0 Comments" after empty fetch', async () => {
        renderSection()
        await waitFor(() => expect(screen.getByText('0 Comments')).toBeInTheDocument())
    })

    test('renders fetched comments', async () => {
        mockGet.mockResolvedValue({ data: [makeComment({ body: 'Hello world' })] })
        renderSection()
        await waitFor(() => expect(screen.getByText('Hello world')).toBeInTheDocument())
    })

    test('shows "1 Comment" for a single comment', async () => {
        mockGet.mockResolvedValue({ data: [makeComment()] })
        renderSection()
        await waitFor(() => expect(screen.getByText('1 Comment')).toBeInTheDocument())
    })

    test('shows error when fetch fails', async () => {
        mockGet.mockRejectedValue(new Error('Network error'))
        renderSection()
        await waitFor(() => expect(screen.getByText('Failed to load comments')).toBeInTheDocument())
    })

    test('GET is called with correct query params', async () => {
        renderSection()
        await waitFor(() => expect(mockGet).toHaveBeenCalledWith(
            expect.stringContaining('targetType=poem&targetId=poem-1')
        ))
    })
})

// ─── Auth gate ───────────────────────────────────────────────────────────────

describe('auth gate', () => {
    test('logged-in user sees the comment form', async () => {
        renderSection()
        await waitFor(() => expect(screen.getByPlaceholderText('Add a comment…')).toBeInTheDocument())
    })

    test('logged-out user sees login link instead of form', async () => {
        renderSection(buildCtx({ user: '', userId: '' }))
        await waitFor(() => expect(screen.queryByPlaceholderText('Add a comment…')).not.toBeInTheDocument())
        expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login')
    })
})

// ─── Add comment ─────────────────────────────────────────────────────────────

describe('adding a comment', () => {
    test('POSTs to API and new comment appears in list', async () => {
        const newComment = makeComment({ id: 'c-new', body: 'My new comment' })
        mockPost.mockResolvedValue({ data: newComment })

        renderSection()
        await waitFor(() => expect(screen.getByPlaceholderText('Add a comment…')).toBeInTheDocument())

        fireEvent.change(screen.getByPlaceholderText('Add a comment…'), { target: { value: 'My new comment' } })
        fireEvent.submit(screen.getByPlaceholderText('Add a comment…').closest('form')!)

        await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
            expect.stringContaining('/comments'),
            expect.objectContaining({ body: 'My new comment', targetType: 'poem', targetId: 'poem-1' }),
            expect.any(Object)
        ))
        await waitFor(() => expect(screen.getByText('My new comment')).toBeInTheDocument())
    })

    test('comment count increments after adding', async () => {
        const newComment = makeComment({ id: 'c-new', body: 'Plus one' })
        mockPost.mockResolvedValue({ data: newComment })

        renderSection()
        await waitFor(() => expect(screen.getByText('0 Comments')).toBeInTheDocument())

        fireEvent.change(screen.getByPlaceholderText('Add a comment…'), { target: { value: 'Plus one' } })
        fireEvent.submit(screen.getByPlaceholderText('Add a comment…').closest('form')!)

        await waitFor(() => expect(screen.getByText('1 Comment')).toBeInTheDocument())
    })

    test('textarea is cleared after successful submit', async () => {
        mockPost.mockResolvedValue({ data: makeComment({ body: 'Cleared' }) })

        renderSection()
        await waitFor(() => expect(screen.getByPlaceholderText('Add a comment…')).toBeInTheDocument())

        const textarea = screen.getByPlaceholderText('Add a comment…')
        fireEvent.change(textarea, { target: { value: 'Cleared' } })
        fireEvent.submit(textarea.closest('form')!)

        await waitFor(() => expect(textarea).toHaveValue(''))
    })
})

// ─── Delete comment ───────────────────────────────────────────────────────────

describe('deleting a comment', () => {
    test('clicking delete button shows confirmation modal', async () => {
        const comment = makeComment({ id: 'c-del', body: 'Delete me', authorId: 'user-a' })
        mockGet.mockResolvedValue({ data: [comment] })

        renderSection()
        await waitFor(() => expect(screen.getByText('Delete me')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /delete comment/i }))

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Delete comment')).toBeInTheDocument()
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    test('DELETEs from API and comment disappears after modal confirm', async () => {
        const comment = makeComment({ id: 'c-del', body: 'Delete me', authorId: 'user-a' })
        mockGet.mockResolvedValue({ data: [comment] })
        mockDelete.mockResolvedValue({})

        renderSection()
        await waitFor(() => expect(screen.getByText('Delete me')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /delete comment/i }))
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

        await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(
            expect.stringContaining('/c-del'),
            expect.any(Object)
        ))
        await waitFor(() => expect(screen.queryByText('Delete me')).not.toBeInTheDocument())
    })

    test('does not call DELETE when modal is cancelled', async () => {
        const comment = makeComment({ id: 'c-keep', body: 'Keep me', authorId: 'user-a' })
        mockGet.mockResolvedValue({ data: [comment] })

        renderSection()
        await waitFor(() => expect(screen.getByText('Keep me')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /delete comment/i }))
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

        expect(mockDelete).not.toHaveBeenCalled()
        expect(screen.getByText('Keep me')).toBeInTheDocument()
    })

    test('non-owner does not see delete button on other user comment', async () => {
        const comment = makeComment({ id: 'c-other', body: 'Not mine', authorId: 'user-b' })
        mockGet.mockResolvedValue({ data: [comment] })

        renderSection()
        await waitFor(() => expect(screen.getByText('Not mine')).toBeInTheDocument())
        expect(screen.queryByRole('button', { name: /delete comment/i })).not.toBeInTheDocument()
    })
})

// ─── Reply flow ───────────────────────────────────────────────────────────────

describe('reply flow', () => {
    test('clicking Reply shows the reply form', async () => {
        const comment = makeComment({ id: 'c1', body: 'Top level' })
        mockGet.mockResolvedValue({ data: [comment] })

        renderSection()
        await waitFor(() => expect(screen.getByText('Top level')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /reply/i }))
        expect(screen.getByPlaceholderText('Write a reply…')).toBeInTheDocument()
    })

    test('submitting reply POSTs with parentId and reply appears nested', async () => {
        const topLevel = makeComment({ id: 'c1', body: 'Top level' })
        const reply = makeComment({ id: 'c2', body: 'My reply', parentId: 'c1' })
        mockGet.mockResolvedValue({ data: [topLevel] })
        mockPost.mockResolvedValue({ data: reply })

        renderSection()
        await waitFor(() => expect(screen.getByText('Top level')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /reply/i }))
        const replyTextarea = screen.getByPlaceholderText('Write a reply…')
        fireEvent.change(replyTextarea, { target: { value: 'My reply' } })
        fireEvent.submit(replyTextarea.closest('form')!)

        await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ parentId: 'c1', body: 'My reply' }),
            expect.any(Object)
        ))
        await waitFor(() => expect(screen.getByText('My reply')).toBeInTheDocument())
    })

    test('reply form closes after successful submit', async () => {
        const topLevel = makeComment({ id: 'c1', body: 'Top level' })
        mockGet.mockResolvedValue({ data: [topLevel] })
        mockPost.mockResolvedValue({ data: makeComment({ id: 'c2', parentId: 'c1', body: 'Done' }) })

        renderSection()
        await waitFor(() => expect(screen.getByText('Top level')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /reply/i }))
        const replyTextarea = screen.getByPlaceholderText('Write a reply…')
        fireEvent.change(replyTextarea, { target: { value: 'Done' } })
        fireEvent.submit(replyTextarea.closest('form')!)

        await waitFor(() => expect(screen.queryByPlaceholderText('Write a reply…')).not.toBeInTheDocument())
    })

    test('Cancel button on reply form hides it without posting', async () => {
        const topLevel = makeComment({ id: 'c1', body: 'Top level' })
        mockGet.mockResolvedValue({ data: [topLevel] })

        renderSection()
        await waitFor(() => expect(screen.getByText('Top level')).toBeInTheDocument())

        fireEvent.click(screen.getByRole('button', { name: /reply/i }))
        expect(screen.getByPlaceholderText('Write a reply…')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
        expect(screen.queryByPlaceholderText('Write a reply…')).not.toBeInTheDocument()
        expect(mockPost).not.toHaveBeenCalled()
    })
})

// ─── Cross-user rendering ────────────────────────────────────────────────────

describe('cross-user rendering', () => {
    test('User B sees User A comment with correct author name', async () => {
        const aliceComment = makeComment({ authorId: 'user-a', authorName: 'Alice', body: 'Alice said this' })
        mockGet.mockResolvedValue({ data: [aliceComment] })

        const bobCtx = buildCtx({ userId: 'user-b', username: 'bob' })
        render(
            <AppContext.Provider value={bobCtx}>
                <CommentsSection targetType='poem' targetId='poem-1' />
            </AppContext.Provider>
        )

        await waitFor(() => expect(screen.getByText('Alice said this')).toBeInTheDocument())
        expect(screen.getByText('Alice')).toBeInTheDocument()
    })

    test('User B does not see delete button on User A comment', async () => {
        const aliceComment = makeComment({ id: 'c-alice', authorId: 'user-a', authorName: 'Alice', body: 'Alice said this' })
        mockGet.mockResolvedValue({ data: [aliceComment] })

        const bobCtx = buildCtx({ userId: 'user-b', username: 'bob' })
        render(
            <AppContext.Provider value={bobCtx}>
                <CommentsSection targetType='poem' targetId='poem-1' />
            </AppContext.Provider>
        )

        await waitFor(() => expect(screen.getByText('Alice said this')).toBeInTheDocument())
        expect(screen.queryByRole('button', { name: /delete comment/i })).not.toBeInTheDocument()
    })

    test('admin sees delete button on any comment', async () => {
        const aliceComment = makeComment({ id: 'c-alice', authorId: 'user-a', body: 'Admins can delete me' })
        mockGet.mockResolvedValue({ data: [aliceComment] })

        const adminCtx = buildCtx({ userId: 'admin-1', adminId: 'admin-1' })
        render(
            <AppContext.Provider value={adminCtx}>
                <CommentsSection targetType='poem' targetId='poem-1' />
            </AppContext.Provider>
        )

        await waitFor(() => expect(screen.getByText('Admins can delete me')).toBeInTheDocument())
        expect(screen.getByRole('button', { name: /delete comment/i })).toBeInTheDocument()
    })

    test('replies from other users appear nested under correct parent', async () => {
        const parent = makeComment({ id: 'c1', authorId: 'user-a', authorName: 'Alice', body: 'Parent' })
        const reply = makeComment({ id: 'c2', authorId: 'user-b', authorName: 'Bob', body: 'Bob replies', parentId: 'c1' })
        mockGet.mockResolvedValue({ data: [parent, reply] })

        renderSection()
        await waitFor(() => {
            expect(screen.getByText('Parent')).toBeInTheDocument()
            expect(screen.getByText('Bob replies')).toBeInTheDocument()
        })

        // Only the parent is a top-level item; reply is nested inside it
        expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2)
    })
})
