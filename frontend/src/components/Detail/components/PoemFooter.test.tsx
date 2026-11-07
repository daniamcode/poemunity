import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PoemFooter } from './PoemFooter'
import { Poem, Context } from '../../../typescript/interfaces'

const renderWithRouter = (component: React.ReactElement) => {
    return render(component)
}

describe('PoemFooter', () => {
    const mockPoem: Poem = {
        id: 'poem-123',
        author: 'John Doe',
        date: '2024-01-15T10:30:00.000Z',
        genre: 'love',
        likes: ['user1', 'user2'],
        picture: 'https://example.com/avatar.jpg',
        poem: 'Test poem content',
        title: 'Test Poem',
        userId: 'user-456'
    }

    const mockContext: Context = {
        user: 'testuser',
        userId: 'user-789',
        username: 'testuser',
        picture: 'default.jpg',
        config: {},
        isAdmin: false,
        setState: jest.fn()
    }

    const mockHandlers = {
        onLike: jest.fn(),
        onDelete: jest.fn(),
        onEdit: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should render singular "Like" when there is 1 like', () => {
        const poemWithOneLike = { ...mockPoem, likes: ['user1'] }
        renderWithRouter(<PoemFooter poem={poemWithOneLike} context={mockContext} {...mockHandlers} />)
        expect(screen.getByText('1 Like')).toBeInTheDocument()
    })

    test('should render plural "Likes" when there are 0 likes', () => {
        const poemWithNoLikes = { ...mockPoem, likes: [] }
        renderWithRouter(<PoemFooter poem={poemWithNoLikes} context={mockContext} {...mockHandlers} />)
        expect(screen.getByText('0 Likes')).toBeInTheDocument()
    })

    test('should render plural "Likes" when there are multiple likes', () => {
        renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)
        expect(screen.getByText('2 Likes')).toBeInTheDocument()
    })

    test('should show liked icon when user has liked the poem', () => {
        const contextWithLike = { ...mockContext, userId: 'user1' }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextWithLike} {...mockHandlers} />)
        expect(screen.getByTestId('like-icon')).toBeInTheDocument()
        expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
    })

    test('should show unlike icon when user has not liked the poem', () => {
        renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)
        expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()
        expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
    })

    test('should NOT show like/unlike icons when user is not logged in', () => {
        const contextNoUser = { ...mockContext, user: '' }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextNoUser} {...mockHandlers} />)
        expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
        expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
    })

    test('should NOT show like/unlike icons when user owns the poem', () => {
        const contextOwner = { ...mockContext, userId: mockPoem.userId }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)
        expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
        expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
    })

    test('should call onLike when like icon is clicked', () => {
        const contextWithLike = { ...mockContext, userId: 'user1' }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextWithLike} {...mockHandlers} />)
        fireEvent.click(screen.getByTestId('like-icon'))
        expect(mockHandlers.onLike).toHaveBeenCalledTimes(1)
    })

    test('should call onLike when unlike icon is clicked', () => {
        renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)
        fireEvent.click(screen.getByTestId('unlike-icon'))
        expect(mockHandlers.onLike).toHaveBeenCalledTimes(1)
    })

    test('should show edit and delete icons when user owns the poem', () => {
        const contextOwner = { ...mockContext, userId: mockPoem.userId }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
        expect(screen.getByTestId('delete-icon')).toBeInTheDocument()
    })

    test('should show edit and delete icons when user is admin', () => {
        const contextAdmin = { ...mockContext, isAdmin: true }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextAdmin} {...mockHandlers} />)
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument()
        expect(screen.getByTestId('delete-icon')).toBeInTheDocument()
    })

    test('should NOT show edit and delete icons when user does not own poem and is not admin', () => {
        renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)
        expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
        expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument()
    })

    test('should call onEdit when edit icon is clicked', () => {
        const contextOwner = { ...mockContext, userId: mockPoem.userId }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)
        fireEvent.click(screen.getByTestId('edit-icon'))
        expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1)
    })

    test('clicking delete opens a confirmation dialog and does NOT delete immediately', () => {
        const contextOwner = { ...mockContext, userId: mockPoem.userId }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)

        fireEvent.click(screen.getByTestId('delete-icon'))

        // The poem is not deleted on the first click — a confirm dialog appears.
        expect(mockHandlers.onDelete).not.toHaveBeenCalled()
        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    test('confirming the dialog calls onDelete once', () => {
        const contextOwner = { ...mockContext, userId: mockPoem.userId }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)

        fireEvent.click(screen.getByTestId('delete-icon'))
        fireEvent.click(screen.getByTestId('confirm-delete-poem'))

        expect(mockHandlers.onDelete).toHaveBeenCalledTimes(1)
    })

    test('cancelling the dialog dismisses it without deleting', () => {
        const contextOwner = { ...mockContext, userId: mockPoem.userId }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)

        fireEvent.click(screen.getByTestId('delete-icon'))
        fireEvent.click(screen.getByText('Cancel'))

        expect(mockHandlers.onDelete).not.toHaveBeenCalled()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('should render comments link with correct href', () => {
        renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)
        const commentsLink = screen.getByRole('link')
        expect(commentsLink).toHaveAttribute('href', '#comments')
    })

    test('should NOT show edit/delete icons when user is not logged in', () => {
        const contextNoUser = { ...mockContext, user: '' }
        renderWithRouter(<PoemFooter poem={mockPoem} context={contextNoUser} {...mockHandlers} />)
        expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
        expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument()
    })

    test('should render delete icon with red color', () => {
        const contextOwner = { ...mockContext, userId: mockPoem.userId }
        const { container } = renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)
        const deleteIcon = container.querySelector('.poem__delete-icon')
        expect(deleteIcon).toHaveStyle({ fill: 'red' })
    })

    describe('embed control', () => {
        // THE point of the feature: a backlink is produced by somebody who is
        // NOT you, so the control that produces one has to be reachable without
        // signing in. Every other action in this footer is gated on
        // `context.user` or `isOwner`, which is exactly why "it must not be"
        // needs its own test — a copy-paste of a neighbouring gate would pass
        // every existing assertion in this file.
        test('is shown to a LOGGED-OUT visitor', () => {
            const contextNoUser = { ...mockContext, user: '' }
            renderWithRouter(<PoemFooter poem={mockPoem} context={contextNoUser} {...mockHandlers} />)

            expect(screen.getByTestId('embed-icon')).toBeInTheDocument()
            // ...while the owner-only actions stay hidden, which is what makes
            // this a real distinction rather than "everything renders".
            expect(screen.queryByTestId('edit-icon')).not.toBeInTheDocument()
            expect(screen.queryByTestId('delete-icon')).not.toBeInTheDocument()
        })

        test('is shown to a signed-in non-owner', () => {
            renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)

            expect(screen.getByTestId('embed-icon')).toBeInTheDocument()
        })

        test('is shown to the owner as well', () => {
            const contextOwner = { ...mockContext, userId: mockPoem.userId }
            renderWithRouter(<PoemFooter poem={mockPoem} context={contextOwner} {...mockHandlers} />)

            expect(screen.getByTestId('embed-icon')).toBeInTheDocument()
        })

        test('stays out of the way until asked for', () => {
            renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            // Guards the older assertion that the footer contains exactly one
            // link: a dialog rendered open would put its own controls in the
            // tree on every poem page.
            expect(screen.getAllByRole('link')).toHaveLength(1)
        })

        test('clicking it opens the snippet for THIS poem', () => {
            renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)

            fireEvent.click(screen.getByTestId('embed-icon'))

            const dialog = screen.getByRole('dialog')
            expect(dialog).toBeInTheDocument()
            expect((screen.getByTestId('embed-snippet') as HTMLTextAreaElement).value)
                .toContain('/embed/poem-123')
        })

        test('the dialog opens, and Escape puts it away again', () => {
            renderWithRouter(<PoemFooter poem={mockPoem} context={mockContext} {...mockHandlers} />)

            fireEvent.click(screen.getByTestId('embed-icon'))
            fireEvent.keyDown(window, { key: 'Escape' })

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })
    })
})
