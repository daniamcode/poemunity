import { render, screen, waitFor, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import ListItem from './ListItem'
import { Poem, Context } from '../../typescript/interfaces'
import store from '../../redux/store'

// We'll test against the real Redux store to catch the flicker issue
jest.mock('../../utils/notifications')

describe('ListItem - No Flicker Tests', () => {
    const mockPoemLikedByUser: Poem = {
        id: 'poem-liked-123',
        title: 'Liked Poem',
        author: 'Test Author',
        poem: 'This is test content',
        genre: 'love',
        likes: ['user-1', 'user-456', 'user-2'], // User 456 HAS liked this
        userId: 'user-999',
        picture: 'https://example.com/pic.jpg',
        date: '2024-01-15T10:30:00.000Z'
    }

    const mockPoemNotLikedByUser: Poem = {
        id: 'poem-not-liked-456',
        title: 'Not Liked Poem',
        author: 'Test Author',
        poem: 'This is test content',
        genre: 'love',
        likes: ['user-1', 'user-2'], // User 456 has NOT liked this
        userId: 'user-999',
        picture: 'https://example.com/pic.jpg',
        date: '2024-01-15T10:30:00.000Z'
    }

    const mockContext: Context = {
        user: 'user-token',
        userId: 'user-456',
        username: 'testuser',
        picture: 'avatar.jpg',
        adminId: 'admin-789',
        elementToEdit: '',
        setState: jest.fn(),
        config: { headers: { Authorization: 'Bearer token' } }
    }

    const renderWithProviders = (component: React.ReactElement) => {
        return render(
            <Provider store={store}>
                <BrowserRouter>{component}</BrowserRouter>
            </Provider>
        )
    }

    describe('Unliking a liked poem', () => {
        test('should NOT flicker when unliking - icon should stay as unlike after click', async () => {
            const { rerender } = renderWithProviders(
                <ListItem poem={mockPoemLikedByUser} filter='' context={mockContext} />
            )

            // Initially should show like icon (filled heart)
            expect(screen.getByTestId('like-icon')).toBeInTheDocument()
            expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
            expect(screen.getByText(/3 Likes/i)).toBeInTheDocument()

            // Simulate the cache update that happens after clicking unlike
            const updatedPoem: Poem = {
                ...mockPoemLikedByUser,
                likes: ['user-1', 'user-2'] // User 456 removed
            }

            // Re-render with updated poem
            await act(async () => {
                rerender(
                    <Provider store={store}>
                        <BrowserRouter>
                            <ListItem poem={updatedPoem} filter='' context={mockContext} />
                        </BrowserRouter>
                    </Provider>
                )
            })

            // Should now show unlike icon (empty heart) and stay that way
            await waitFor(
                () => {
                    expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()
                    expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
                },
                { timeout: 3000 }
            )

            // Likes count should be updated
            expect(screen.getByText(/2 Likes/i)).toBeInTheDocument()

            // Wait a bit more to ensure no flicker happens
            await new Promise(resolve => setTimeout(resolve, 500))

            // Icon should STILL be unlike (not flicker back to like)
            expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()
            expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
            expect(screen.getByText(/2 Likes/i)).toBeInTheDocument()
        })

        test('should maintain consistent state during multiple rapid re-renders after unlike', async () => {
            const { rerender } = renderWithProviders(
                <ListItem poem={mockPoemLikedByUser} filter='' context={mockContext} />
            )

            // Track all icon states during re-renders
            const iconStates: string[] = []

            const updatedPoem: Poem = {
                ...mockPoemLikedByUser,
                likes: ['user-1', 'user-2']
            }

            // Simulate rapid re-renders (like what might happen with multiple Redux dispatches)
            await act(async () => {
                for (let i = 0; i < 5; i++) {
                    rerender(
                        <Provider store={store}>
                            <BrowserRouter>
                                <ListItem poem={updatedPoem} filter='' context={mockContext} />
                            </BrowserRouter>
                        </Provider>
                    )

                    // Capture icon state after each render
                    await new Promise(resolve => setTimeout(resolve, 10))
                    if (screen.queryByTestId('like-icon')) {
                        iconStates.push('liked')
                    } else if (screen.queryByTestId('unlike-icon')) {
                        iconStates.push('unliked')
                    }
                }
            })

            // All states should be 'unliked' - no flicker to 'liked'
            expect(iconStates).toEqual(['unliked', 'unliked', 'unliked', 'unliked', 'unliked'])
        })
    })

    describe('Liking an unliked poem', () => {
        test('should NOT flicker when liking - icon should stay as like after click', async () => {
            const { rerender } = renderWithProviders(
                <ListItem poem={mockPoemNotLikedByUser} filter='' context={mockContext} />
            )

            // Initially should show unlike icon (empty heart)
            expect(screen.getByTestId('unlike-icon')).toBeInTheDocument()
            expect(screen.queryByTestId('like-icon')).not.toBeInTheDocument()
            expect(screen.getByText(/2 Likes/i)).toBeInTheDocument()

            // Simulate the cache update that happens after clicking like
            const updatedPoem: Poem = {
                ...mockPoemNotLikedByUser,
                likes: ['user-1', 'user-2', 'user-456'] // User 456 added
            }

            // Re-render with updated poem
            await act(async () => {
                rerender(
                    <Provider store={store}>
                        <BrowserRouter>
                            <ListItem poem={updatedPoem} filter='' context={mockContext} />
                        </BrowserRouter>
                    </Provider>
                )
            })

            // Should now show like icon (filled heart) and stay that way
            await waitFor(
                () => {
                    expect(screen.getByTestId('like-icon')).toBeInTheDocument()
                    expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
                },
                { timeout: 3000 }
            )

            // Likes count should be updated
            expect(screen.getByText(/3 Likes/i)).toBeInTheDocument()

            // Wait a bit more to ensure no flicker happens
            await new Promise(resolve => setTimeout(resolve, 500))

            // Icon should STILL be like (not flicker back to unlike)
            expect(screen.getByTestId('like-icon')).toBeInTheDocument()
            expect(screen.queryByTestId('unlike-icon')).not.toBeInTheDocument()
            expect(screen.getByText(/3 Likes/i)).toBeInTheDocument()
        })

        test('should maintain consistent state during multiple rapid re-renders after like', async () => {
            const { rerender } = renderWithProviders(
                <ListItem poem={mockPoemNotLikedByUser} filter='' context={mockContext} />
            )

            // Track all icon states during re-renders
            const iconStates: string[] = []

            const updatedPoem: Poem = {
                ...mockPoemNotLikedByUser,
                likes: ['user-1', 'user-2', 'user-456']
            }

            // Simulate rapid re-renders
            await act(async () => {
                for (let i = 0; i < 5; i++) {
                    rerender(
                        <Provider store={store}>
                            <BrowserRouter>
                                <ListItem poem={updatedPoem} filter='' context={mockContext} />
                            </BrowserRouter>
                        </Provider>
                    )

                    // Capture icon state after each render
                    await new Promise(resolve => setTimeout(resolve, 10))
                    if (screen.queryByTestId('like-icon')) {
                        iconStates.push('liked')
                    } else if (screen.queryByTestId('unlike-icon')) {
                        iconStates.push('unliked')
                    }
                }
            })

            // All states should be 'liked' - no flicker to 'unliked'
            expect(iconStates).toEqual(['liked', 'liked', 'liked', 'liked', 'liked'])
        })
    })

    describe('Counter consistency', () => {
        test('counter should never temporarily show incorrect value when unliking', async () => {
            const { rerender } = renderWithProviders(
                <ListItem poem={mockPoemLikedByUser} filter='' context={mockContext} />
            )

            const likesCounts: number[] = []

            const updatedPoem: Poem = {
                ...mockPoemLikedByUser,
                likes: ['user-1', 'user-2']
            }

            await act(async () => {
                for (let i = 0; i < 5; i++) {
                    rerender(
                        <Provider store={store}>
                            <BrowserRouter>
                                <ListItem poem={updatedPoem} filter='' context={mockContext} />
                            </BrowserRouter>
                        </Provider>
                    )

                    await new Promise(resolve => setTimeout(resolve, 10))
                    const likesText = screen.getByText(/\d+ Like(s)?/i).textContent
                    const count = parseInt(likesText?.match(/\d+/)?.[0] || '0')
                    likesCounts.push(count)
                }
            })

            // All counts should be 2 - no flicker to 3
            expect(likesCounts).toEqual([2, 2, 2, 2, 2])
        })

        test('counter should never temporarily show incorrect value when liking', async () => {
            const { rerender } = renderWithProviders(
                <ListItem poem={mockPoemNotLikedByUser} filter='' context={mockContext} />
            )

            const likesCounts: number[] = []

            const updatedPoem: Poem = {
                ...mockPoemNotLikedByUser,
                likes: ['user-1', 'user-2', 'user-456']
            }

            await act(async () => {
                for (let i = 0; i < 5; i++) {
                    rerender(
                        <Provider store={store}>
                            <BrowserRouter>
                                <ListItem poem={updatedPoem} filter='' context={mockContext} />
                            </BrowserRouter>
                        </Provider>
                    )

                    await new Promise(resolve => setTimeout(resolve, 10))
                    const likesText = screen.getByText(/\d+ Like(s)?/i).textContent
                    const count = parseInt(likesText?.match(/\d+/)?.[0] || '0')
                    likesCounts.push(count)
                }
            })

            // All counts should be 3 - no flicker to 2
            expect(likesCounts).toEqual([3, 3, 3, 3, 3])
        })
    })
})
