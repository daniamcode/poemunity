import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ListItem from './ListItem'
import { Poem, Context } from '../../typescript/interfaces'
import * as poemActions from '../../redux/actions/poemActions'
import * as poemsActions from '../../redux/actions/poemsActions'

// Mock the actions
jest.mock('../../redux/actions/poemActions')
jest.mock('../../redux/actions/poemsActions')
jest.mock('../../utils/notifications')

const mockStore = configureStore([])

describe('ListItem - Like Functionality Integration Tests', () => {
    let store: ReturnType<typeof mockStore>
    let likePoemActionSpy: jest.SpyInstance
    let updateCacheSpy: jest.SpyInstance

    const mockPoem: Poem = {
        id: 'poem-123',
        title: 'Test Poem',
        author: 'Test Author',
        poem: 'This is test content',
        genre: 'love',
        likes: ['user-1', 'user-2'], // User 456 has NOT liked this poem yet
        userId: 'user-999',
        picture: 'https://example.com/pic.jpg',
        date: '2024-01-15T10:30:00.000Z'
    }

    const mockPoemLikedByUser: Poem = {
        ...mockPoem,
        id: 'poem-liked-456',
        likes: ['user-1', 'user-456', 'user-2'] // User 456 HAS liked this poem
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

        store = mockStore({
            poemsListQuery: {
                item: [mockPoem, mockPoemLikedByUser],
                isFetching: false
            }
        })

        // Mock the action creators to return actions with callbacks
        likePoemActionSpy = jest.spyOn(poemActions, 'likePoemAction')
        updateCacheSpy = jest.spyOn(poemsActions, 'updatePoemsListCacheAfterLikePoemAction')

        // Make sure the mocked actions return objects
        ;(poemsActions.updatePoemsListCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_CACHE_LIKE'
        })
        ;(poemsActions.updateRankingCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_RANKING_LIKE'
        })
        ;(poemsActions.updateAllPoemsCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_ALL_POEMS_LIKE'
        })
        ;(poemsActions.updateMyFavouritePoemsCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_MY_FAVOURITE_POEMS_LIKE'
        })
        ;(poemActions.updatePoemCacheAfterLikePoemAction as jest.Mock).mockReturnValue({
            type: 'UPDATE_POEM_LIKE'
        })
    })

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <Provider store={store}>
                <BrowserRouter>{component}</BrowserRouter>
            </Provider>
        )
    }

    test('should show unlike icon (empty heart) for poem not yet liked by user', () => {
        renderWithProviders(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()
        expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
    })

    test('should show like icon (filled heart) for poem already liked by user', () => {
        renderWithProviders(<ListItem poem={mockPoemLikedByUser} filter='' context={mockContext} />)

        expect(screen.getByTestId('like-icon')).toBeInTheDocument()
        expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
    })

    test('should have correct CSS class for unlike icon', () => {
        renderWithProviders(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        const unlikeIcon = screen.getByTestId('unlike-icon')
        expect(unlikeIcon).toHaveClass('poem__unlikes-icon')
    })

    test('should have correct CSS class for like icon', () => {
        renderWithProviders(<ListItem poem={mockPoemLikedByUser} filter='' context={mockContext} />)

        const likeIcon = screen.getByTestId('like-icon')
        expect(likeIcon).toHaveClass('poem__likes-icon')
    })

    test('should dispatch likePoemAction when clicking unlike icon', () => {
        // Setup: poem not liked by user
        likePoemActionSpy.mockReturnValue({ type: 'LIKE_POEM' })

        renderWithProviders(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        const unlikeIcon = screen.getByTestId('unlike-icon')
        fireEvent.click(unlikeIcon)

        expect(likePoemActionSpy).toHaveBeenCalledWith({
            params: { poemId: 'poem-123' },
            context: mockContext,
            callbacks: expect.objectContaining({
                success: expect.any(Function)
            })
        })
    })

    test('should dispatch likePoemAction when clicking like icon to unlike', () => {
        // Setup: poem already liked by user
        likePoemActionSpy.mockReturnValue({ type: 'LIKE_POEM' })

        renderWithProviders(<ListItem poem={mockPoemLikedByUser} filter='' context={mockContext} />)

        const likeIcon = screen.getByTestId('like-icon')
        fireEvent.click(likeIcon)

        expect(likePoemActionSpy).toHaveBeenCalledWith({
            params: { poemId: 'poem-liked-456' },
            context: mockContext,
            callbacks: expect.objectContaining({
                success: expect.any(Function)
            })
        })
    })

    test('should update all caches in success callback when liking', () => {
        likePoemActionSpy.mockReturnValue({ type: 'LIKE_POEM' })

        renderWithProviders(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        const unlikeIcon = screen.getByTestId('unlike-icon')
        fireEvent.click(unlikeIcon)

        // Get the success callback that was passed
        const callArgs = likePoemActionSpy.mock.calls[0][0]
        const successCallback = callArgs.callbacks.success

        // Call the success callback
        successCallback()

        // Verify all cache updates were called
        expect(poemsActions.updatePoemsListCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemsActions.updateRankingCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemsActions.updateAllPoemsCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemsActions.updateMyFavouritePoemsCacheAfterLikePoemAction).toHaveBeenCalledWith({
            poemId: 'poem-123',
            context: mockContext
        })
        expect(poemActions.updatePoemCacheAfterLikePoemAction).toHaveBeenCalledWith({
            context: mockContext
        })
    })

    test('should update UI when poem prop changes from not liked to liked', () => {
        const { rerender } = renderWithProviders(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        // Initially should show unlike icon
        expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()

        // Simulate Redux update: poem is now liked by user
        const updatedPoem: Poem = {
            ...mockPoem,
            likes: ['user-1', 'user-2', 'user-456'] // User 456 now in likes array
        }

        // Re-render with updated poem prop
        rerender(
            <Provider store={store}>
                <BrowserRouter>
                    <ListItem poem={updatedPoem} filter='' context={mockContext} />
                </BrowserRouter>
            </Provider>
        )

        // Should now show like icon
        expect(screen.getByTestId('like-icon')).toBeInTheDocument()
        expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
    })

    test('should update UI when poem prop changes from liked to not liked', () => {
        const { rerender } = renderWithProviders(
            <ListItem poem={mockPoemLikedByUser} filter='' context={mockContext} />
        )

        // Initially should show like icon
        expect(screen.getByTestId('like-icon')).toBeInTheDocument()

        // Simulate Redux update: poem is now unliked by user
        const updatedPoem: Poem = {
            ...mockPoemLikedByUser,
            likes: ['user-1', 'user-2'] // User 456 removed from likes array
        }

        // Re-render with updated poem prop
        rerender(
            <Provider store={store}>
                <BrowserRouter>
                    <ListItem poem={updatedPoem} filter='' context={mockContext} />
                </BrowserRouter>
            </Provider>
        )

        // Should now show unlike icon
        expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()
        expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
    })

    test('should update likes count when poem prop changes', () => {
        const { rerender } = renderWithProviders(<ListItem poem={mockPoem} filter='' context={mockContext} />)

        // Initially has 2 likes
        expect(screen.getByText(/2 Likes/i)).toBeInTheDocument()

        // Simulate Redux update: add a like
        const updatedPoem: Poem = {
            ...mockPoem,
            likes: ['user-1', 'user-2', 'user-456']
        }

        rerender(
            <Provider store={store}>
                <BrowserRouter>
                    <ListItem poem={updatedPoem} filter='' context={mockContext} />
                </BrowserRouter>
            </Provider>
        )

        // Should now show 3 likes
        expect(screen.getByText(/3 Likes/i)).toBeInTheDocument()
    })
})
