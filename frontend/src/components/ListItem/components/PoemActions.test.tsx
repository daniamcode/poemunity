import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
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
        return render(<BrowserRouter>{component}</BrowserRouter>)
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

        const editIcon = screen.getByTestId('edit-poem')
        expect(editIcon).toBeInTheDocument()
        expect(editIcon).toHaveClass('poem__edit-icon')
    })

    test('should render delete icon when user is owner', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const deleteIcon = screen.getByTestId('delete-poem')
        expect(deleteIcon).toBeInTheDocument()
        expect(deleteIcon).toHaveClass('poem__delete-icon')
    })

    test('should call onEdit when clicking edit icon', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const editIcon = screen.getByTestId('edit-poem')
        fireEvent.click(editIcon)

        expect(mockOnEdit).toHaveBeenCalledTimes(1)
    })

    test('should call onDelete when clicking delete icon', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const deleteIcon = screen.getByTestId('delete-poem')
        fireEvent.click(deleteIcon)

        expect(mockOnDelete).toHaveBeenCalledTimes(1)
    })

    test('should link to correct detail page for comments', () => {
        const { container } = renderWithRouter(<PoemActions {...defaultProps} poemId='different-poem-123' />)

        const commentsLink = container.querySelector('.poem__comments-icon')
        expect(commentsLink).toHaveAttribute('href', '/detail/different-poem-123')
    })

    test('should have correct styles on delete icon', () => {
        renderWithRouter(<PoemActions {...defaultProps} isOwner={true} />)

        const deleteIcon = screen.getByTestId('delete-poem')
        expect(deleteIcon).toHaveStyle({ fill: 'red' })
    })
})
