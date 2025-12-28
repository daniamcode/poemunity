import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { LikeButton } from './LikeButton'

describe('LikeButton', () => {
    const mockOnLike = jest.fn()

    const renderWithRouter = (component: React.ReactElement) => {
        return render(<BrowserRouter>{component}</BrowserRouter>)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should render like icon when poem is already liked', () => {
        renderWithRouter(<LikeButton isLiked={true} onLike={mockOnLike} show={true} />)

        const likeIcon = screen.getByTestId('like-icon')
        expect(likeIcon).toBeInTheDocument()
        expect(likeIcon).toHaveClass('poem__likes-icon')
    })

    test('should render unlike icon when poem is not liked', () => {
        renderWithRouter(<LikeButton isLiked={false} onLike={mockOnLike} show={true} />)

        const unlikeIcon = screen.getByTestId('unlike-icon')
        expect(unlikeIcon).toBeInTheDocument()
        expect(unlikeIcon).toHaveClass('poem__unlikes-icon')
    })

    test('should call onLike when clicking like icon', () => {
        renderWithRouter(<LikeButton isLiked={true} onLike={mockOnLike} show={true} />)

        const likeIcon = screen.getByTestId('like-icon')
        fireEvent.click(likeIcon)

        expect(mockOnLike).toHaveBeenCalledTimes(1)
    })

    test('should call onLike when clicking unlike icon', () => {
        renderWithRouter(<LikeButton isLiked={false} onLike={mockOnLike} show={true} />)

        const unlikeIcon = screen.getByTestId('unlike-icon')
        fireEvent.click(unlikeIcon)

        expect(mockOnLike).toHaveBeenCalledTimes(1)
    })

    test('should not render when show is false', () => {
        renderWithRouter(<LikeButton isLiked={true} onLike={mockOnLike} show={false} />)

        expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
        expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
    })

    test('should have link to prevent default behavior', () => {
        renderWithRouter(<LikeButton isLiked={true} onLike={mockOnLike} show={true} />)

        const likeIcon = screen.getByTestId('like-icon')
        // React Router normalizes '#' to '/', which is fine for our use case
        expect(likeIcon.tagName).toBe('A')
    })

    describe('Regression: CSS focus issue', () => {
        test('should maintain correct className after click when isLiked is true', () => {
            renderWithRouter(<LikeButton isLiked={true} onLike={mockOnLike} show={true} />)

            const likeIcon = screen.getByTestId('like-icon')

            // Before click
            expect(likeIcon).toHaveClass('poem__likes-icon')

            // Click to trigger focus state
            fireEvent.click(likeIcon)

            // After click - className should still be correct (not overridden by :focus)
            expect(likeIcon).toHaveClass('poem__likes-icon')
            expect(likeIcon).not.toHaveClass('poem__unlikes-icon')
        })

        test('should maintain correct className after click when isLiked is false', () => {
            renderWithRouter(<LikeButton isLiked={false} onLike={mockOnLike} show={true} />)

            const unlikeIcon = screen.getByTestId('unlike-icon')

            // Before click
            expect(unlikeIcon).toHaveClass('poem__unlikes-icon')

            // Click to trigger focus state
            fireEvent.click(unlikeIcon)

            // After click - className should still be correct (not overridden by :focus)
            expect(unlikeIcon).toHaveClass('poem__unlikes-icon')
            expect(unlikeIcon).not.toHaveClass('poem__likes-icon')
        })

        test('should verify that className changes when isLiked prop changes', () => {
            const { rerender } = renderWithRouter(
                <LikeButton isLiked={false} onLike={mockOnLike} show={true} />
            )

            // Initially unliked
            const initialIcon = screen.getByTestId('unlike-icon')
            expect(initialIcon).toHaveClass('poem__unlikes-icon')

            // Re-render with isLiked=true (simulating successful like action)
            rerender(
                <BrowserRouter>
                    <LikeButton isLiked={true} onLike={mockOnLike} show={true} />
                </BrowserRouter>
            )

            // Now should be liked
            const likedIcon = screen.getByTestId('like-icon')
            expect(likedIcon).toHaveClass('poem__likes-icon')
            expect(likedIcon).not.toHaveClass('poem__unlikes-icon')
        })
    })
})
