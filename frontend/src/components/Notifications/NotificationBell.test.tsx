import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import NotificationBell from './NotificationBell'
import { AppContext } from '../../App'
import * as actions from '../../redux/actions/notificationsActions'
import { NOTIFICATIONS_OPEN, NOTIFICATIONS_EMPTY } from '../../data/constants'

jest.mock('../../redux/actions/notificationsActions', () => ({
    fetchUnreadCountAction: jest.fn(() => ({ type: 'FETCH_UNREAD_COUNT' })),
    getNotificationsAction: jest.fn(() => ({ type: 'GET_NOTIFICATIONS' })),
    markNotificationsReadAction: jest.fn(() => ({ type: 'MARK_READ' }))
}))

const mockFetchCount = actions.fetchUnreadCountAction as jest.Mock
const mockGetList = actions.getNotificationsAction as jest.Mock
const mockMarkRead = actions.markNotificationsReadAction as jest.Mock
const mockStore = configureStore([])

const signedIn = { user: 'token', userId: 'me-1', username: 'me', config: {} }
const loggedOut = { user: '', userId: '', username: '', config: {} }

const renderBell = ({ context = signedIn, count = 0, notifications = {} }: any = {}) =>
    render(
        <Provider
            store={mockStore({
                unreadCount: { count },
                notificationsQuery: { isFetching: false, hasMore: false, page: 1, ...notifications }
            })}
        >
            <AppContext.Provider value={context as never}>
                <NotificationBell />
            </AppContext.Provider>
        </Provider>
    )

describe('NotificationBell', () => {
    beforeEach(() => jest.clearAllMocks())

    describe('signed out', () => {
        test('renders nothing and fetches nothing', () => {
            // There is no such thing as an anonymous notification, so an empty
            // bell would be an affordance that never does anything.
            const { container } = renderBell({ context: loggedOut })

            expect(container).toBeEmptyDOMElement()
            expect(mockFetchCount).not.toHaveBeenCalled()
        })
    })

    describe('the badge', () => {
        test('fetches the count once on mount', () => {
            renderBell()

            expect(mockFetchCount).toHaveBeenCalledTimes(1)
        })

        test('shows no badge at zero', () => {
            renderBell({ count: 0 })

            expect(screen.getByRole('button')).toHaveAccessibleName(NOTIFICATIONS_OPEN)
            expect(screen.queryByText('0')).not.toBeInTheDocument()
        })

        test('shows the number, and puts it in the accessible name', () => {
            // The count has to be IN the name: a screen reader user navigating
            // by button list should not have to open the panel to learn there
            // is something in it.
            renderBell({ count: 3 })

            expect(screen.getByText('3')).toBeInTheDocument()
            expect(screen.getByRole('button')).toHaveAccessibleName(`${NOTIFICATIONS_OPEN}, 3 unread`)
        })

        test('caps the badge at 9+', () => {
            // A three-digit badge is wider than the bell and stops being a
            // number you read.
            renderBell({ count: 42 })

            expect(screen.getByText('9+')).toBeInTheDocument()
            // The real number survives in the accessible name.
            expect(screen.getByRole('button')).toHaveAccessibleName(`${NOTIFICATIONS_OPEN}, 42 unread`)
        })

        test('shows the exact number at the boundary', () => {
            renderBell({ count: 9 })

            expect(screen.getByText('9')).toBeInTheDocument()
        })
    })

    describe('opening the panel', () => {
        test('loads the list and marks everything read', async () => {
            const user = userEvent.setup()
            renderBell({ count: 2 })

            await user.click(screen.getByRole('button'))

            expect(screen.getByRole('dialog')).toBeInTheDocument()
            expect(mockGetList).toHaveBeenCalledTimes(1)
            expect(mockMarkRead).toHaveBeenCalledTimes(1)
            // Page 1, replacing whatever was cached.
            expect(mockGetList.mock.calls[0][0].options).toEqual({ reset: true, fetch: true })
        })

        test('does nothing but close on the second click', async () => {
            // Closing must not re-mark or re-fetch; only opening does.
            const user = userEvent.setup()
            renderBell()

            const button = screen.getByRole('button')
            await user.click(button)
            await user.click(button)

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
            expect(mockGetList).toHaveBeenCalledTimes(1)
            expect(mockMarkRead).toHaveBeenCalledTimes(1)
        })

        test('fetches nothing before it is opened', () => {
            // The panel is a dropdown, not a page: loading the list on mount
            // would be a request per page load for something usually unopened.
            renderBell()

            expect(mockGetList).not.toHaveBeenCalled()
            expect(mockMarkRead).not.toHaveBeenCalled()
        })

        test('reports its expanded state', async () => {
            const user = userEvent.setup()
            renderBell()

            const button = screen.getByRole('button')
            expect(button).toHaveAttribute('aria-expanded', 'false')

            await user.click(button)
            expect(button).toHaveAttribute('aria-expanded', 'true')
        })

        test('closes on Escape', async () => {
            const user = userEvent.setup()
            renderBell()

            await user.click(screen.getByRole('button'))
            expect(screen.getByRole('dialog')).toBeInTheDocument()

            await user.keyboard('{Escape}')
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        test('closes on a click outside', async () => {
            const user = userEvent.setup()
            renderBell()

            await user.click(screen.getByRole('button'))
            await user.click(document.body)

            expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        })

        test('stays open when clicking inside itself', async () => {
            // The distractor for the test above: an outside-click handler that
            // did not check containment would close the panel the moment you
            // reached for anything in it.
            const user = userEvent.setup()
            renderBell()

            await user.click(screen.getByRole('button'))
            await user.click(screen.getByText(NOTIFICATIONS_EMPTY))

            expect(screen.getByRole('dialog')).toBeInTheDocument()
        })
    })
})
