import React from 'react'
import { render, screen } from '@testing-library/react'
import CommentsSection from './CommentsSection'
import { AppContext } from '../../App'
import * as useCommentsModule from './useComments'
import { Context, Comment } from '../../typescript/interfaces'

jest.mock('./useComments')
jest.mock('./components/CommentItem', () => ({
    __esModule: true,
    default: ({ comment }: any) => <li data-testid='comment-item'>{comment.body}</li>
}))
jest.mock('./components/CommentForm', () => ({
    __esModule: true,
    default: ({ placeholder }: any) => <form data-testid='comment-form'><input placeholder={placeholder} /></form>
}))

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
    elementToEdit: '',
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
})
