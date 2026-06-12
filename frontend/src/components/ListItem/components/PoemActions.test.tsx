import { render, screen, fireEvent } from '@testing-library/react'
import { PoemActions } from './PoemActions'

describe('PoemActions', () => {
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const defaultProps = {
        poemId: 'poem-789',
        isOwner: false,
        onEdit: mockOnEdit,
        onDelete: mockOnDelete
    }

    const renderWithRouter = (component: React.ReactElement) => {
        return render(component)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should render comments icon for all users', () => {
        const { container } = renderWithRouter(<PoemActions {...defaultProps} />)

        const commentsLink = container.querySelector('.poem__comments-icon')
        expect(commentsLink).toBeInTheDocument()
        expect(commentsLink).toHaveAttribute('href', '/detail/poem-789')
    })

    test('should NOT render edit and delete icons when not owner', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={false} />)

        expect(screen.queryByTestId('edit-poem')).not.toBeInTheDocument()
        expect(screen.queryByTestId('delete-poem')).not.toBeInTheDocument()
    })

    test('should render edit icon when user is owner', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const editIcon = screen.getByRole('button', { name: 'Edit poem' })
        expect(editIcon).toBeInTheDocument()
        expect(editIcon).toHaveClass('poem__edit-icon')
    })

    test('should render delete icon when user is owner', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const deleteIcon = screen.getByRole('button', { name: 'Delete poem' })
        expect(deleteIcon).toBeInTheDocument()
        expect(deleteIcon).toHaveClass('poem__delete-icon')
    })

    test('should call onEdit when clicking edit icon', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const editIcon = screen.getByRole('button', { name: 'Edit poem' })
        fireEvent.click(editIcon)

        expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    test('should show confirmation dialog when clicking delete icon', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        fireEvent.click(screen.getByTestId('delete-poem'))

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Delete this poem?')).toBeInTheDocument()
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument()
    })

    test('should call onDelete only after confirming', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        fireEvent.click(screen.getByTestId('delete-poem'))
        expect(mockOnDelete).not.toHaveBeenCalled()

        fireEvent.click(screen.getByTestId('confirm-delete-poem'))
        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    test('should dismiss confirmation on cancel without deleting', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        fireEvent.click(screen.getByTestId('delete-poem'))
        fireEvent.click(screen.getByText('Cancel'))

        expect(mockOnDelete).not.toHaveBeenCalled()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('should link to correct detail page for comments', () => {
        renderWithRouter(<PoemActions {...defaultProps} poemId='different-poem-123' />)

        const commentsLink = screen.getByRole('link', { name: 'View comments' })
        expect(commentsLink).toHaveAttribute('href', '/detail/different-poem-123')
    })

    test('should have correct styles on delete icon', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const deleteIcon = screen.getByTestId('delete-poem')
        expect(deleteIcon).toHaveStyle({ fill: 'red' })
    })
})
