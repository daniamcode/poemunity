import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PoemFooter } from './PoemFooter'
import { LIKE, LIKES } from '../../../data/constants'

jest.mock('./LikeButton', () => ({
    LikeButton: ({ show }: any) => (show ? <div data-testid='like-button'>LikeButton</div> : null)
}))

jest.mock('./PoemActions', () => ({
    PoemActions: () => <div data-testid='poem-actions'>PoemActions</div>
}))

describe('PoemFooter', () => {
    const mockOnLike = jest.fn()
    const mockOnEdit = jest.fn()
    const mockOnDelete = jest.fn()

    const defaultProps = {
        poemId: 'poem-123',
        likesCount: 5,
        isLiked: true,
        showLikeButton: true,
        isOwner: false,
        onLike: mockOnLike,
        onEdit: mockOnEdit,
        onDelete: mockOnDelete
    }

    const renderWithRouter = (component: React.ReactElement) => {
        return render(<BrowserRouter>{component}</BrowserRouter>)
    }

    test('should render likes count with LIKES label when count is not 1', () => {
        renderWithRouter(<PoemFooter {...defaultProps} likesCount={5} />)

        expect(screen.getByText(`5 ${LIKES}`)).toBeInTheDocument()
    })

    test('should render likes count with LIKE label when count is 1', () => {
        renderWithRouter(<PoemFooter {...defaultProps} likesCount={1} />)

        expect(screen.getByText(`1 ${LIKE}`)).toBeInTheDocument()
    })

    test('should render likes count with LIKES label when count is 0', () => {
        renderWithRouter(<PoemFooter {...defaultProps} likesCount={0} />)

        expect(screen.getByText(`0 ${LIKES}`)).toBeInTheDocument()
    })

    test('should render separator', () => {
        const { container } = renderWithRouter(<PoemFooter {...defaultProps} />)

        expect(container.querySelector('.separator')).toBeInTheDocument()
    })

    test('should render LikeButton component', () => {
        renderWithRouter(<PoemFooter {...defaultProps} showLikeButton={true} />)

        expect(screen.getByTestId('like-button')).toBeInTheDocument()
    })

    test('should NOT render LikeButton when showLikeButton is false', () => {
        renderWithRouter(<PoemFooter {...defaultProps} showLikeButton={false} />)

        expect(screen.queryByTestId('like-button')).not.toBeInTheDocument()
    })

    test('should render PoemActions component', () => {
        renderWithRouter(<PoemFooter {...defaultProps} />)

        expect(screen.getByTestId('poem-actions')).toBeInTheDocument()
    })

    test('should have correct CSS class on footer', () => {
        const { container } = renderWithRouter(<PoemFooter {...defaultProps} />)

        expect(container.querySelector('.poem__footer')).toBeInTheDocument()
    })

    test('should have correct CSS class on likes count', () => {
        const { container } = renderWithRouter(<PoemFooter {...defaultProps} />)

        expect(container.querySelector('.poem__likes')).toBeInTheDocument()
    })
})
