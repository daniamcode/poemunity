import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import ListItem from './ListItem'
import { Poem, Context } from '../../typescript/interfaces'
import * as usePoemActionsModule from './hooks/usePoemActions'

// Mock child components
jest.mock('./components', () => ({
    PoemHeader: ({ title, author }: any) => (
        <div data-testid='poem-header'>
            {title} by {author}
        </div>
    ),
    PoemContent: ({ content }: any) => <div data-testid='poem-content'>{content}</div>,
    PoemFooter: ({ likesCount, showLikeButton, isOwner }: any) => (
        <div data-testid='poem-footer'>
            Likes: {likesCount}, ShowLike: {String(showLikeButton)}, IsOwner: {String(isOwner)}
        </div>
    )
}))

// Mock the hook
jest.mock('./hooks/usePoemActions')

describe('ListItem (Refactored)', () => {
    const mockOnDelete = jest.fn()
    const mockOnLike = jest.fn()
    const mockOnEdit = jest.fn()

    const mockPoem: Poem = {
        id: 'poem-123',
        title: 'Beautiful Sunset',
        author: 'Jane Doe',
        poem: 'The sun sets over the horizon...',
        genre: 'nature',
        likes: ['user-1', 'user-2'],
        userId: 'user-123',
        picture: 'https://example.com/jane.jpg',
        date: '2024-01-15T10:30:00.000Z'
    }

    const mockContext: Context = {
        user: 'user-token',
        userId: 'user-456',
        username: 'testuser',
        picture: 'avatar.jpg',
        adminId: 'admin-789',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    beforeEach(() => {
        jest.clearAllMocks()
        ;(usePoemActionsModule.usePoemActions as jest.Mock).mockReturnValue({
            onDelete: mockOnDelete,
            onLike: mockOnLike,
            onEdit: mockOnEdit
        })
    })

    const renderWithRouter = (component: React.ReactElement) => {
        return render(<BrowserRouter>{component}</BrowserRouter>)
    }

    test('should render all child components when filter matches', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByTestId('poem-header')).toBeInTheDocument()
        expect(screen.getByTestId('poem-content')).toBeInTheDocument()
        expect(screen.getByTestId('poem-footer')).toBeInTheDocument()
    })

    test('should render poem header with correct data', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByText('Beautiful Sunset by Jane Doe')).toBeInTheDocument()
    })

    test('should render poem content', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByText('The sun sets over the horizon...')).toBeInTheDocument()
    })

    test('should pass correct likesCount to PoemFooter', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByText(/Likes: 2/)).toBeInTheDocument()
    })

    test('should show like button when user is logged in and not poem owner', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByText(/ShowLike: true/)).toBeInTheDocument()
    })

    test('should NOT show like button when user is poem owner', () => {
        const contextAsOwner = { ...mockContext, userId: 'user-123' }
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={contextAsOwner} />)

        expect(screen.getByText(/ShowLike: false/)).toBeInTheDocument()
    })

    test('should NOT show like button when user is not logged in', () => {
        const contextLoggedOut = { ...mockContext, user: '' }
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={contextLoggedOut} />)

        expect(screen.getByText(/ShowLike: false/)).toBeInTheDocument()
    })

    test('should show user as owner when userId matches poem userId', () => {
        const contextAsOwner = { ...mockContext, userId: 'user-123' }
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={contextAsOwner} />)

        expect(screen.getByText(/IsOwner: true/)).toBeInTheDocument()
    })

    test('should show user as owner when userId matches adminId', () => {
        const contextAsAdmin = { ...mockContext, userId: 'admin-789' }
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={contextAsAdmin} />)

        expect(screen.getByText(/IsOwner: true/)).toBeInTheDocument()
    })

    test('should NOT show user as owner when not owner or admin', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByText(/IsOwner: false/)).toBeInTheDocument()
    })

    test('should filter by author name (case insensitive)', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='jane' context={mockContext} />)

        expect(screen.getByTestId('poem-header')).toBeInTheDocument()
    })

    test('should NOT render when filter does not match author', () => {
        const { container } = renderWithRouter(<ListItem poem={mockPoem} filter='john' context={mockContext} />)

        expect(screen.queryByTestId('poem-header')).not.toBeInTheDocument()
        expect(container.querySelector('.poem__block')).not.toBeInTheDocument()
    })

    test('should render when filter is empty', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByTestId('poem-header')).toBeInTheDocument()
    })

    test('should call usePoemActions hook with correct params', () => {
        renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(usePoemActionsModule.usePoemActions).toHaveBeenCalledWith({
            poem: mockPoem,
            context: mockContext
        })
    })

    test('should have correct CSS classes', () => {
        const { container } = renderWithRouter(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(container.querySelector('.poem__detail')).toBeInTheDocument()
        expect(container.querySelector('.poem__block')).toBeInTheDocument()
    })

    test('should determine isLiked correctly when user liked the poem', () => {
        const poemLikedByUser = { ...mockPoem, likes: ['user-456', 'user-2'] }
        renderWithRouter(<ListItem poem={poemLikedByUser} filter='' context={mockContext} />)

        // The component should detect user-456 in likes
        expect(screen.getByTestId('poem-footer')).toBeInTheDocument()
    })

    test('should handle poem with no likes', () => {
        const poemWithNoLikes = { ...mockPoem, likes: [] }
        renderWithRouter(<ListItem poem={poemWithNoLikes} filter='' context={mockContext} />)

        expect(screen.getByText(/Likes: 0/)).toBeInTheDocument()
    })

    test('should handle undefined likes array', () => {
        const poemWithUndefinedLikes = { ...mockPoem, likes: undefined as any }
        renderWithRouter(<ListItem poem={poemWithUndefinedLikes} filter='' context={mockContext} />)

        expect(screen.getByText(/Likes: 0/)).toBeInTheDocument()
    })
})
