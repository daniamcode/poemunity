import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommentsSection from './CommentsSection'
import { AppContext } from '../../App'
import * as useCommentsModule from './useComments'
import { Context, Comment } from '../../typescript/interfaces'
import API from '../../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import { manageError } from '../../utils/notifications'

jest.mock('./useComments')
jest.mock('./components/CommentItem', () => ({
    __esModule: true,
    default: ({ comment }: any) => <li data-testid='comment-item'>{comment.body}</li>
}))
jest.mock('./components/CommentForm', () => ({
    __esModule: true,
    default: ({ placeholder, onSubmit }: any) => (
        <form
            data-testid='comment-form'
            onSubmit={e => {
                e.preventDefault()
                onSubmit('A comment')
            }}
        >
            <input placeholder={placeholder} />
        </form>
    )
}))
// Notifications are toasts; axios is the network. Both are asserted on directly.
jest.mock('../../utils/notifications', () => ({ manageError: jest.fn(), manageSuccess: jest.fn() }))
jest.mock('../../redux/actions/axiosInstance', () => ({ __esModule: true, default: jest.fn() }))

const loggedInContext: Context = {
    user: 'jwt-token',
    userId: 'user-123',
    username: 'tester',
    picture: '',
    bio: '',
    preferredGenres: [],
    name: '',
    surname: '',
    city: '',
    country: '',
    birthYear: null,
    gender: '',
    privateFields: [],
    config: { headers: { Authorization: 'Bearer jwt-token' } },
    isAdmin: false,
    setState: jest.fn()
}

const loggedOutContext: Context = { ...loggedInContext, user: '', userId: '', config: {} }

const renderSection = (ctx: Context = loggedInContext) =>
    render(
        <AppContext.Provider value={ctx}>
            <CommentsSection targetType='poem' targetId='poem-123' />
        </AppContext.Provider>
    )

const mockUseComments = (overrides = {}) =>
    (useCommentsModule.useComments as jest.Mock).mockReturnValue({
        comments: [],
        isLoading: false,
        error: null,
        addComment: jest.fn(),
        deleteComment: jest.fn(),
        ...overrides
    })

const makeComment = (overrides = {}): Comment => ({
    id: 'c1',
    targetType: 'poem',
    targetId: 'poem-123',
    authorId: 'author-1',
    authorName: 'Alice',
    authorPicture: null,
    authorSlug: 'alice',
    body: 'Nice poem',
    parentId: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
})

describe('CommentsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('auth gate', () => {
        test('shows CommentForm when logged in', () => {
            mockUseComments()
            renderSection(loggedInContext)
            expect(screen.getByTestId('comment-form')).toBeInTheDocument()
        })

        test('shows login link when logged out', () => {
            mockUseComments()
            renderSection(loggedOutContext)
            expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument()
            expect(screen.getByText(/Log in/)).toBeInTheDocument()
        })

        test('login link points to /login', () => {
            mockUseComments()
            renderSection(loggedOutContext)
            expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/login')
        })
    })

    describe('loading and error states', () => {
        test('shows loading message while fetching', () => {
            mockUseComments({ isLoading: true })
            renderSection()
            expect(screen.getByText(/Loading comments/)).toBeInTheDocument()
        })

        test('does not render comment list while loading', () => {
            mockUseComments({ isLoading: true })
            renderSection()
            expect(screen.queryByTestId('comment-item')).not.toBeInTheDocument()
        })

        test('shows error message when fetch fails', () => {
            mockUseComments({ error: 'Failed to load comments' })
            renderSection()
            expect(screen.getByText('Failed to load comments')).toBeInTheDocument()
        })
    })

    describe('comment count', () => {
        test('shows "0 Comments" when empty', () => {
            mockUseComments({ comments: [] })
            renderSection()
            expect(screen.getByText('0 Comments')).toBeInTheDocument()
        })

        test('shows "1 Comment" (singular) for one comment', () => {
            mockUseComments({ comments: [makeComment()] })
            renderSection()
            expect(screen.getByText('1 Comment')).toBeInTheDocument()
        })

        test('shows "3 Comments" for multiple comments', () => {
            mockUseComments({
                comments: [
                    makeComment({ id: 'c1' }),
                    makeComment({ id: 'c2' }),
                    makeComment({ id: 'c3' })
                ]
            })
            renderSection()
            expect(screen.getByText('3 Comments')).toBeInTheDocument()
        })
    })

    describe('comment rendering', () => {
        test('renders a CommentItem for each top-level comment', () => {
            mockUseComments({
                comments: [
                    makeComment({ id: 'c1', body: 'First', parentId: null }),
                    makeComment({ id: 'c2', body: 'Second', parentId: null })
                ]
            })
            renderSection()
            const items = screen.getAllByTestId('comment-item')
            expect(items).toHaveLength(2)
        })

        test('does not render reply comments as top-level items', () => {
            mockUseComments({
                comments: [
                    makeComment({ id: 'c1', parentId: null }),
                    makeComment({ id: 'c2', parentId: 'c1' })
                ]
            })
            renderSection()
            expect(screen.getAllByTestId('comment-item')).toHaveLength(1)
        })

        test('shows empty message when there are no top-level comments', () => {
            mockUseComments({ comments: [] })
            renderSection()
            expect(screen.getByText(/No comments yet/)).toBeInTheDocument()
        })
    })

    describe('calls useComments with correct params', () => {
        test('passes targetType and targetId to useComments', () => {
            mockUseComments()
            renderSection()
            expect(useCommentsModule.useComments).toHaveBeenCalledWith('poem', 'poem-123')
        })
    })

    describe('email verification gate', () => {
        const unverifiedContext: Context = { ...loggedInContext, emailVerified: false }
        const verifiedContext: Context = { ...loggedInContext, emailVerified: true }

        test('unverified user gets the verification notice instead of the composer', () => {
            mockUseComments()
            renderSection(unverifiedContext)
            expect(screen.queryByTestId('comment-form')).not.toBeInTheDocument()
            expect(screen.getByRole('status')).toHaveTextContent(
                'Please verify your email address to leave a comment.'
            )
        })

        test('verified user gets the composer and no notice', () => {
            mockUseComments()
            renderSection(verifiedContext)
            expect(screen.getByTestId('comment-form')).toBeInTheDocument()
            expect(screen.queryByText(/Please verify your email address/)).not.toBeInTheDocument()
        })

        test('an admin is exempt even when flagged unverified', () => {
            mockUseComments()
            renderSection({ ...unverifiedContext, isAdmin: true })
            expect(screen.getByTestId('comment-form')).toBeInTheDocument()
            expect(screen.queryByText(/Please verify your email address/)).not.toBeInTheDocument()
        })

        test('a context with no emailVerified field is NOT treated as unverified', () => {
            mockUseComments()
            renderSection(loggedInContext)
            expect(screen.getByTestId('comment-form')).toBeInTheDocument()
        })

        test('resending the verification link posts to VERIFY_RESEND and confirms', async () => {
            const post = jest.fn().mockResolvedValue({})
            ;(API as jest.Mock).mockReturnValue({ post })
            mockUseComments()
            renderSection(unverifiedContext)

            fireEvent.click(screen.getByRole('button', { name: /resend verification link/i }))

            expect(post).toHaveBeenCalledWith(API_ENDPOINTS.VERIFY_RESEND)
            expect(await screen.findByText('Verification email sent.')).toBeInTheDocument()
        })

        test('a rejected comment surfaces the server EMAIL_UNVERIFIED message', async () => {
            const addComment = jest.fn().mockRejectedValue({
                response: {
                    data: {
                        code: 'EMAIL_UNVERIFIED',
                        error: 'Please verify your email address before commenting.'
                    }
                }
            })
            mockUseComments({ addComment })
            renderSection(verifiedContext)

            fireEvent.submit(screen.getByTestId('comment-form'))

            await waitFor(() =>
                expect(manageError).toHaveBeenCalledWith(
                    'Please verify your email address before commenting.'
                )
            )
        })
    })
})
