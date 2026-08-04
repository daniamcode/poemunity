import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import NotificationBell from '../components/Notifications/NotificationBell'
import { rootReducer } from '../redux/reducers/rootReducer'
import API from '../redux/actions/axiosInstance'
import { API_ENDPOINTS } from '../data/API_ENDPOINTS'

/**
 * Opening the bell, end to end inside the app: real component, real thunks,
 * real reducers. ONLY the network is mocked.
 *
 * THIS IS THE SEAM THE UNIT TESTS COULD NOT COVER, and it is not hypothetical.
 * `NotificationBell.test.tsx` mocks the whole actions module, so it asserts
 * that `markNotificationsReadAction` was DISPATCHED — which it faithfully was,
 * every time, while the action itself sent no HTTP request at all because
 * `options: { fetch: false }` skips the axios call inside `postAction`. Every
 * notification stayed unread and the badge never cleared, in production, with
 * a green suite.
 *
 * So the assertions here are deliberately about THE WIRE: which requests were
 * made, in which order, with what body. A test that checked only what the
 * screen shows would have passed against the bug too — the panel rendered
 * perfectly, it just never told the server anything.
 */
jest.mock('../redux/actions/axiosInstance')
jest.mock('../App', () => {
    const context = {
        user: 'token', userId: 'me-1', username: 'me',
        isAdmin: false, setState: jest.fn(), config: {}
    }
    return { AppContext: React.createContext(context) }
})

const mockedAPI = API as jest.MockedFunction<typeof API>

const ROWS = [
    {
        id: 'n1',
        type: 'newPoem',
        actors: [{ id: 'a1', name: 'Nadia Novak', slug: 'nadia-novak' }],
        count: 1,
        poem: { id: 'p1', title: 'Second Light', slug: 'second-light' },
        read: false,
        updatedAt: '2026-08-04T10:00:00.000Z',
        createdAt: '2026-08-04T10:00:00.000Z'
    }
]

function renderBell() {
    const store = configureStore({ reducer: rootReducer })
    return {
        store,
        ...render(<Provider store={store}><NotificationBell /></Provider>)
    }
}

describe('opening the notification bell', () => {
    let get: jest.Mock
    let post: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        get = jest.fn(url => {
            if (url === API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT) {
                return Promise.resolve({ data: { count: 1 } })
            }
            return Promise.resolve({
                data: { notifications: ROWS, total: 1, page: 1, totalPages: 1, hasMore: false }
            })
        })
        post = jest.fn(() => Promise.resolve({ data: { updated: 1, unreadCount: 0 } }))
        mockedAPI.mockReturnValue({ get, post } as never)
    })

    test('fetches the unread count and shows the badge', async () => {
        renderBell()

        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())
        expect(get).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT)
    })

    test('ACTUALLY SENDS the mark-read request when opened', async () => {
        // The regression. Not "was the action dispatched" — was a request made.
        const user = userEvent.setup()
        renderBell()
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())

        await user.click(screen.getByRole('button'))

        await waitFor(() => {
            expect(post).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS_READ, {})
        })
    })

    test('clears the badge from the response', async () => {
        const user = userEvent.setup()
        renderBell()
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())

        await user.click(screen.getByRole('button'))

        await waitFor(() => expect(screen.queryByText('1')).not.toBeInTheDocument())
        expect(screen.getByRole('button')).toHaveAccessibleName('Notifications')
    })

    test('marks read only AFTER the list has come back', async () => {
        // Both were dispatched together before. With the mark-read landing
        // first the list returns every row already read, erasing the what's-new
        // highlight the panel is opened to show.
        const user = userEvent.setup()
        renderBell()
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())

        await user.click(screen.getByRole('button'))
        await waitFor(() => expect(post).toHaveBeenCalled())

        const listCall = get.mock.invocationCallOrder[get.mock.calls.length - 1]
        expect(listCall).toBeLessThan(post.mock.invocationCallOrder[0])
    })

    test('renders the row, and links it to the poem', async () => {
        const user = userEvent.setup()
        renderBell()
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())

        await user.click(screen.getByRole('button'))

        const link = await screen.findByRole('link', { name: /published a new poem/i })
        // The slug, never the id — the id would 200 but is not the canonical URL.
        expect(link).toHaveAttribute('href', '/detail/second-light')
    })

    test('does not mark anything read merely by mounting', async () => {
        // The bell is on every page. A mark-read on mount would silently clear
        // notifications the user never looked at.
        renderBell()

        await waitFor(() => expect(get).toHaveBeenCalled())
        expect(post).not.toHaveBeenCalled()
    })

    test('a failed mark-read leaves the badge showing the real number', async () => {
        // Zeroing it would claim the notifications were read when they were
        // not, which is exactly what the original bug did without saying so.
        post.mockRejectedValue(new Error('network'))
        const user = userEvent.setup()
        renderBell()
        await waitFor(() => expect(screen.getByText('1')).toBeInTheDocument())

        await user.click(screen.getByRole('button'))

        await waitFor(() => expect(post).toHaveBeenCalled())
        expect(screen.getByText('1')).toBeInTheDocument()
    })
})
