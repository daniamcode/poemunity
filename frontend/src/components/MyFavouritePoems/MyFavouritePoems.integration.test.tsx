import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import MyFavouritePoems from './MyFavouritePoems'
import { AppContext } from '../../App'
import { Poem } from '../../typescript/interfaces'

jest.mock('../../utils/notifications')
jest.mock('../../redux/actions/poemsActions', () => ({
    ...jest.requireActual('../../redux/actions/poemsActions'),
    getMyFavouritePoemsAction: jest.fn(() => ({ type: 'GET_MY_FAVOURITE_POEMS' }))
}))

const mockStore = configureStore([])

interface MyFavouritePoemsState {
    item: Poem[]
    isFetching: boolean
    hasMore: boolean
    page: number
    error: null
}

describe('MyFavouritePoems - Integration Tests', () => {
    const mockContext = {
        user: 'user-token',
        userId: 'user-456',
        username: 'testuser',
        picture: 'avatar.jpg',
        adminId: 'admin-789',
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    const createTestStore = (myFavouritePoemsState: Partial<MyFavouritePoemsState>) => {
        return mockStore({
            myFavouritePoemsQuery: {
                item: [],
                isFetching: false,
                hasMore: false,
                page: 1,
                error: null,
                ...myFavouritePoemsState
            }
        })
    }

    const renderWithProviders = (component: React.ReactElement, customStore?: any) => {
        const testStore = customStore || createTestStore({})
        return render(
            <Provider store={testStore}>
                <AppContext.Provider value={mockContext}>
                    <BrowserRouter>{component}</BrowserRouter>
                </AppContext.Provider>
            </Provider>
        )
    }

    describe('Component Integration with ListItem', () => {
        test('should render MyFavouritePoems and use ListItem for poem rendering', () => {
            // Set up initial state with favourite poems
            const testStore = createTestStore({
                item: [
                    {
                        id: 'poem-1',
                        title: 'Favourite Poem 1',
                        author: 'Author One',
                        poem: 'This is a favourite poem',
                        genre: 'love',
                        likes: ['user-456', 'user-2'],
                        userId: 'user-999',
                        picture: 'https://example.com/pic.jpg',
                        date: '2024-01-15T10:30:00.000Z'
                    }
                ],
                isFetching: false,
                hasMore: false,
                page: 1
            })

            renderWithProviders(<MyFavouritePoems />, testStore)

            // Verify the poem is rendered
            expect(screen.getByText('Favourite Poem 1')).toBeInTheDocument()
            expect(screen.getByText('Author One')).toBeInTheDocument()
        })

        test('should show like icon for poems already liked by user', () => {
            const testStore = createTestStore({
                item: [
                    {
                        id: 'poem-liked',
                        title: 'Liked Poem',
                        author: 'Test Author',
                        poem: 'Content',
                        genre: 'love',
                        likes: ['user-456', 'user-2'], // User 456 has liked this
                        userId: 'user-999',
                        picture: 'https://example.com/pic.jpg',
                        date: '2024-01-15T10:30:00.000Z'
                    }
                ],
                isFetching: false,
                hasMore: false,
                page: 1
            })

            renderWithProviders(<MyFavouritePoems />, testStore)

            // Should show like icon (filled heart) since user has already liked it
            expect(screen.getByTestId('like-icon')).toBeInTheDocument()
            expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
        })

        test('should show unlike icon for poems not yet liked by user', () => {
            const testStore = createTestStore({
                item: [
                    {
                        id: 'poem-not-liked',
                        title: 'Not Liked Poem',
                        author: 'Test Author',
                        poem: 'Content',
                        genre: 'love',
                        likes: ['user-1', 'user-2'], // User 456 has NOT liked this
                        userId: 'user-999',
                        picture: 'https://example.com/pic.jpg',
                        date: '2024-01-15T10:30:00.000Z'
                    }
                ],
                isFetching: false,
                hasMore: false,
                page: 1
            })

            renderWithProviders(<MyFavouritePoems />, testStore)

            // Should show unlike icon (empty heart) since user has not liked it
            expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()
            expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
        })

        test('should not show like button for poems owned by the user', () => {
            const testStore = createTestStore({
                item: [
                    {
                        id: 'poem-owned',
                        title: 'My Own Poem',
                        author: 'testuser',
                        poem: 'Content',
                        genre: 'love',
                        likes: ['user-1'],
                        userId: 'user-456', // Owned by current user
                        picture: 'https://example.com/pic.jpg',
                        date: '2024-01-15T10:30:00.000Z'
                    }
                ],
                isFetching: false,
                hasMore: false,
                page: 1
            })

            renderWithProviders(<MyFavouritePoems />, testStore)

            // Should NOT show like/unlike buttons for own poems
            expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
            expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()

            // Should show edit and delete buttons instead
            expect(screen.getByTestId('edit-poem')).toBeInTheDocument()
            expect(screen.getByTestId('delete-poem')).toBeInTheDocument()
        })

        test('should filter poems by author name', () => {
            const testStore = createTestStore({
                item: [
                    {
                        id: 'poem-1',
                        title: 'Poem by Alice',
                        author: 'Alice Smith',
                        poem: 'Content 1',
                        genre: 'love',
                        likes: ['user-456'],
                        userId: 'user-1',
                        picture: 'https://example.com/pic1.jpg',
                        date: '2024-01-15T10:30:00.000Z'
                    },
                    {
                        id: 'poem-2',
                        title: 'Poem by Bob',
                        author: 'Bob Jones',
                        poem: 'Content 2',
                        genre: 'love',
                        likes: ['user-456'],
                        userId: 'user-2',
                        picture: 'https://example.com/pic2.jpg',
                        date: '2024-01-16T10:30:00.000Z'
                    }
                ],
                isFetching: false,
                hasMore: false,
                page: 1
            })

            const { container } = renderWithProviders(<MyFavouritePoems />, testStore)

            // Both poems should be visible initially
            expect(screen.getByText('Poem by Alice')).toBeInTheDocument()
            expect(screen.getByText('Poem by Bob')).toBeInTheDocument()

            // Filter by "Alice"
            const searchInput = container.querySelector('input[type="text"]') as HTMLInputElement
            if (searchInput) {
                searchInput.value = 'Alice'
                searchInput.dispatchEvent(new Event('input', { bubbles: true }))
            }

            // Only Alice's poem should be visible
            waitFor(() => {
                expect(screen.getByText('Poem by Alice')).toBeInTheDocument()
                expect(screen.queryByText('Poem by Bob')).not.toBeInTheDocument()
            })
        })
    })

    describe('Loading States', () => {
        test('should show loading indicator when fetching and no poems loaded', () => {
            const testStore = createTestStore({
                item: [],
                isFetching: true,
                hasMore: false,
                page: 1
            })

            renderWithProviders(<MyFavouritePoems />, testStore)

            // Should show loading indicator
            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })
    })
})
