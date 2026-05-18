import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CommentItem from './CommentItem'
import { Comment, Context } from '../../../typescript/interfaces'

// CSS module mock already handles styles via moduleNameMapper

const styles: Record<string, string> = {}

const baseComment: Comment = {
    id: 'c1',
    targetType: 'poem',
    targetId: 'poem-123',
    authorId: 'author-1',
    authorName: 'Alice',
    authorPicture: null,
    authorSlug: 'alice-slug',
    body: 'A wonderful read',
    parentId: null,
    createdAt: '2024-03-15T12:00:00.000Z',
    updatedAt: '2024-03-15T12:00:00.000Z'
}

const loggedInCtx: Context = {
    user: 'jwt-token',
    userId: 'other-user',
    username: 'viewer',
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
    config: {},
    adminId: 'admin-id',
    elementToEdit: '',
    setState: jest.fn()
}

const ownerCtx: Context = { ...loggedInCtx, userId: 'author-1' }
const adminCtx: Context = { ...loggedInCtx, userId: 'admin-id' }
const loggedOutCtx: Context = { ...loggedInCtx, user: '', userId: '' }

const renderItem = (
    comment = baseComment,
    ctx = loggedInCtx,
    replies: Comment[] = []
) => {
    const onDelete = jest.fn().mockResolvedValue(undefined)
    const onReply = jest.fn().mockResolvedValue(undefined)

    render(
        <ul>
            <CommentItem
                comment={comment}
                replies={replies}
                context={ctx}
                onDelete={onDelete}
                onReply={onReply}
                styles={styles}
            />
        </ul>
    )

    return { onDelete, onReply }
}

describe('CommentItem', () => {
    describe('content rendering', () => {
        test('renders comment body', () => {
            renderItem()
            expect(screen.getByText('A wonderful read')).toBeInTheDocument()
        })

        test('renders the author name', () => {
            renderItem()
            expect(screen.getByText('Alice')).toBeInTheDocument()
        })

        test('renders a formatted date', () => {
            renderItem()
            expect(screen.getByText(/15 Mar 2024/)).toBeInTheDocument()
        })

        test('renders author name as a link when authorSlug is present', () => {
            renderItem()
            const link = screen.getByRole('link', { name: 'Alice' })
            expect(link).toHaveAttribute('href', '/authors/alice-slug')
        })

        test('renders author name as plain text when authorSlug is absent', () => {
            renderItem({ ...baseComment, authorSlug: null })
            expect(screen.getByText('Alice')).toBeInTheDocument()
            expect(screen.queryByRole('link', { name: 'Alice' })).not.toBeInTheDocument()
        })

        test('renders initials avatar when no picture', () => {
            renderItem({ ...baseComment, authorName: 'Alice Long', authorPicture: null })
            expect(screen.getByText('AL')).toBeInTheDocument()
        })

        test('renders img avatar when picture is present', () => {
            renderItem({ ...baseComment, authorPicture: 'https://example.com/pic.jpg' })
            expect(screen.getByRole('img', { name: 'Alice' })).toHaveAttribute('src', 'https://example.com/pic.jpg')
        })
    })

    describe('delete button', () => {
        test('visible to comment owner', () => {
            renderItem(baseComment, ownerCtx)
            expect(screen.getByRole('button', { name: /delete comment/i })).toBeInTheDocument()
        })

        test('visible to admin', () => {
            renderItem(baseComment, adminCtx)
            expect(screen.getByRole('button', { name: /delete comment/i })).toBeInTheDocument()
        })

        test('hidden for a logged-in non-owner', () => {
            renderItem(baseComment, loggedInCtx)
            expect(screen.queryByRole('button', { name: /delete comment/i })).not.toBeInTheDocument()
        })

        test('hidden when logged out even if userId matches', () => {
            const ctx = { ...loggedOutCtx, userId: 'author-1' }
            renderItem(baseComment, ctx)
            expect(screen.queryByRole('button', { name: /delete comment/i })).not.toBeInTheDocument()
        })

        test('clicking delete button opens confirmation modal', () => {
            renderItem(baseComment, ownerCtx)
            fireEvent.click(screen.getByRole('button', { name: /delete comment/i }))
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Delete comment')).toBeInTheDocument()
            expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
        })

        test('calls onDelete after confirming in modal', () => {
            const { onDelete } = renderItem(baseComment, ownerCtx)
            fireEvent.click(screen.getByRole('button', { name: /delete comment/i }))
            fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
            expect(onDelete).toHaveBeenCalledWith('c1')
        })

        test('does not call onDelete when modal is cancelled', () => {
            const { onDelete } = renderItem(baseComment, ownerCtx)
            fireEvent.click(screen.getByRole('button', { name: /delete comment/i }))
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
            expect(onDelete).not.toHaveBeenCalled()
        })

        test('modal is dismissed after cancelling', () => {
            renderItem(baseComment, ownerCtx)
            fireEvent.click(screen.getByRole('button', { name: /delete comment/i }))
            expect(screen.getByRole('dialog')).toBeInTheDocument()
            fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })

    describe('reply button', () => {
        test('visible when logged in', () => {
            renderItem(baseComment, loggedInCtx)
            expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument()
        })

        test('hidden when logged out', () => {
            renderItem(baseComment, loggedOutCtx)
            expect(screen.queryByRole('button', { name: /reply/i })).not.toBeInTheDocument()
        })

        test('shows reply form on click', () => {
            renderItem(baseComment, loggedInCtx)
            fireEvent.click(screen.getByRole('button', { name: /reply/i }))
            expect(screen.getByPlaceholderText('Write a reply…')).toBeInTheDocument()
        })

        test('hides reply form when Cancel is clicked', () => {
            renderItem(baseComment, loggedInCtx)
            fireEvent.click(screen.getByRole('button', { name: /reply/i }))
            expect(screen.getByPlaceholderText('Write a reply…')).toBeInTheDocument()
            fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
            expect(screen.queryByPlaceholderText('Write a reply…')).not.toBeInTheDocument()
        })

        test('calls onReply with body text and closes form', async () => {
            const { onReply } = renderItem(baseComment, loggedInCtx)
            fireEvent.click(screen.getByRole('button', { name: /reply/i }))

            const textarea = screen.getByPlaceholderText('Write a reply…')
            fireEvent.change(textarea, { target: { value: 'My reply' } })
            fireEvent.submit(textarea.closest('form')!)

            await waitFor(() => expect(onReply).toHaveBeenCalledWith('My reply'))
            await waitFor(() => expect(screen.queryByPlaceholderText('Write a reply…')).not.toBeInTheDocument())
        })
    })

    describe('nested replies', () => {
        const reply: Comment = {
            ...baseComment,
            id: 'c2',
            body: 'A reply comment',
            parentId: 'c1'
        }

        test('renders nested reply items', () => {
            renderItem(baseComment, loggedInCtx, [reply])
            expect(screen.getByText('A reply comment')).toBeInTheDocument()
        })

        test('renders no replies when array is empty', () => {
            renderItem(baseComment, loggedInCtx, [])
            expect(screen.getAllByText('A wonderful read')).toHaveLength(1)
        })
    })
})
