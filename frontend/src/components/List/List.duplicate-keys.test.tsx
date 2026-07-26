import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import store from '../../redux/store'
import List from './List'
import { AppContext } from '../../App'

jest.mock('axios', () => {
    const mockPutFn = jest.fn()
    const mockGetFn = jest.fn()
    const mockAxiosInstance = {
        put: mockPutFn,
        get: mockGetFn
    }
    const mockCreateFn = jest.fn(() => mockAxiosInstance)

    return {
        __esModule: true,
        default: {
            create: mockCreateFn,
            __mockPut: mockPutFn,
            __mockGet: mockGetFn
        }
    }
})

const mockContext = {
    elementToEdit: '',
    user: 'user123',
    userId: 'user123',
    username: 'testuser',
    picture: '',
    config: {},
    isAdmin: false,
    setState: jest.fn()
}

describe('List component - Duplicate keys bug', () => {
    const mockPoems = [
        {
            id: 'poem1',
            title: 'First Poem',
            author: 'Author 1',
            poem: 'Content 1',
            likes: [] as string[],
            date: new Date().toISOString(),
            userId: 'otherUser1',
            picture: '',
            origin: 'user',
            genre: 'test'
        },
        {
            id: 'poem2',
            title: 'Second Poem',
            author: 'Author 2',
            poem: 'Content 2',
            likes: [] as string[],
            date: new Date().toISOString(),
            userId: 'otherUser2',
            picture: '',
            origin: 'user',
            genre: 'test'
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
        // Reset Redux store to initial state
        store.dispatch({ type: 'poems-list_reset' })
    })

    test('Should not duplicate poems when liking, unliking, and liking again', async () => {
        // Mock axios responses
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const axios = require('axios')
        const mockGet = axios.default.__mockGet
        const mockPut = axios.default.__mockPut

        // Mock initial poems fetch
        mockGet.mockResolvedValueOnce({
            data: {
                poems: mockPoems,
                page: 1,
                total: 2,
                limit: 10,
                totalPages: 1,
                hasMore: false
            },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {}
        })

        // No per-cache patching is mocked: the real like flow toggles the ONE
        // poem entity (poemUpdated) and every view re-reads it. This test proves
        // that liking/unliking never duplicates a poem in the id-backed list.

        // Render the List component
        const { container } = render(
            <Provider store={store}>
                <AppContext.Provider value={mockContext}>
                        <List match={{ params: {}, isExact: true, path: '/', url: '/' }} />
                </AppContext.Provider>
            </Provider>
        )

        // Wait for poems to load
        await waitFor(() => {
            expect(screen.getByText('First Poem')).toBeInTheDocument()
            expect(screen.getByText('Second Poem')).toBeInTheDocument()
        })

        // Check initial state - should have 2 poems
        let poemElements = container.querySelectorAll('[class*="poem__detail"]')
        expect(poemElements.length).toBe(2)

        // Mock like action responses
        mockPut
            .mockResolvedValueOnce({
                data: { ...mockPoems[0], likes: ['user123'] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            })
            .mockResolvedValueOnce({
                data: { ...mockPoems[0], likes: [] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            })
            .mockResolvedValueOnce({
                data: { ...mockPoems[0], likes: ['user123'] },
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {}
            })

        // Like the first poem
        const unlikeIcons = screen.getAllByTestId('unlike-icon')
        fireEvent.click(unlikeIcons[0])

        await waitFor(() => {
            expect(mockPut).toHaveBeenCalledTimes(1)
        })

        // Check no duplicates after first like
        await waitFor(() => {
            poemElements = container.querySelectorAll('[class*="poem__detail"]')
            expect(poemElements.length).toBe(2)
        })

        // Unlike the first poem
        await waitFor(() => {
            const likeIcon = screen.getByTestId('like-icon')
            fireEvent.click(likeIcon)
        })

        await waitFor(() => {
            expect(mockPut).toHaveBeenCalledTimes(2)
        })

        // Check no duplicates after unlike
        await waitFor(() => {
            poemElements = container.querySelectorAll('[class*="poem__detail"]')
            expect(poemElements.length).toBe(2)
        })

        // Like again
        const unlikeIconsAgain = screen.getAllByTestId('unlike-icon')
        fireEvent.click(unlikeIconsAgain[0])

        await waitFor(() => {
            expect(mockPut).toHaveBeenCalledTimes(3)
        })

        // Check no duplicates after second like - THIS IS WHERE THE BUG HAPPENS
        await waitFor(
            () => {
                poemElements = container.querySelectorAll('[class*="poem__detail"]')
                expect(poemElements.length).toBe(2)

                // Check for duplicate keys in console warnings
                // Should not have any duplicate keys
                const poemIds = Array.from(poemElements).map(
                    el => el.closest('[data-testid]')?.getAttribute('data-testid') || ''
                )
                const uniqueIds = new Set(poemIds.filter(id => id))
                expect(uniqueIds.size).toBe(poemIds.filter(id => id).length)
            },
            { timeout: 5000 }
        )
    })
})
