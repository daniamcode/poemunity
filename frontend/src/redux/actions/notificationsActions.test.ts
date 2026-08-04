import {
    markNotificationsReadAction,
    fetchUnreadCountAction
} from './notificationsActions'
import { UNREAD_COUNT_SET } from '../reducers/notificationsReducers'
import { API_ENDPOINTS } from '../../data/API_ENDPOINTS'
import API from './axiosInstance'

// ---------------------------------------------------------------------------
// These test that a REQUEST IS ACTUALLY SENT.
//
// That sounds trivially obvious, and it is exactly what shipped broken:
// markNotificationsReadAction passed `options: { fetch: false }` to postAction,
// meaning to keep the response out of the notifications LIST reducer. But
// `fetch: false` skips the whole `if (options.fetch)` block — the axios call
// included — so the POST was never sent. Nothing was ever marked read and the
// badge never cleared. It was reported from production.
//
// Every existing test of the bell mocks this module wholesale, so none of them
// could see it: they assert the action was DISPATCHED, which it faithfully was.
// The gap was between "dispatched" and "reached the server", and only a test at
// this level closes it.
// ---------------------------------------------------------------------------

jest.mock('./axiosInstance')

const mockApi = API as unknown as jest.Mock
const post = jest.fn()
const get = jest.fn()

beforeEach(() => {
    jest.clearAllMocks()
    post.mockResolvedValue({ data: { updated: 3, unreadCount: 0 } })
    get.mockResolvedValue({ data: { count: 5 } })
    mockApi.mockReturnValue({ post, get })
})

describe('markNotificationsReadAction', () => {
    test('actually sends the POST', async () => {
        const dispatch = jest.fn()

        await markNotificationsReadAction({})(dispatch)

        expect(post).toHaveBeenCalledTimes(1)
        expect(post).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS_READ, {})
    })

    test('sends the ids when given some', async () => {
        const dispatch = jest.fn()

        await markNotificationsReadAction({ ids: ['a', 'b'] })(dispatch)

        expect(post).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS_READ, { ids: ['a', 'b'] })
    })

    test('sends an empty body for an empty id list, meaning "everything"', async () => {
        // The distractor: `[]` must not be sent as `{ ids: [] }`, which the
        // server would read as "narrow to no rows" and mark nothing.
        const dispatch = jest.fn()

        await markNotificationsReadAction({ ids: [] })(dispatch)

        expect(post).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS_READ, {})
    })

    test('sets the badge from the response, not from a local guess', async () => {
        post.mockResolvedValue({ data: { updated: 2, unreadCount: 4 } })
        const dispatch = jest.fn()

        await markNotificationsReadAction({})(dispatch)

        // 4, not 0: a second tab may have added something between the fetch and
        // this write, and the server is the only thing that knows.
        expect(dispatch).toHaveBeenCalledWith({ type: UNREAD_COUNT_SET, payload: 4 })
    })

    test('leaves the badge alone when the write fails', async () => {
        // Zeroing it would claim the notifications were read when they were not
        // — the exact lie the original bug told, silently.
        post.mockRejectedValue(new Error('network'))
        const dispatch = jest.fn()

        await markNotificationsReadAction({})(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })

    test('does not throw when the write fails', async () => {
        post.mockRejectedValue(new Error('network'))
        const dispatch = jest.fn()

        await expect(markNotificationsReadAction({})(dispatch)).resolves.toBeNull()
    })

    test('calls the error callback on failure', async () => {
        post.mockRejectedValue(new Error('network'))
        const dispatch = jest.fn()
        const error = jest.fn()

        await markNotificationsReadAction({ callbacks: { error } })(dispatch)

        expect(error).toHaveBeenCalledTimes(1)
    })

    test('calls the success callback with the response', async () => {
        const dispatch = jest.fn()
        const success = jest.fn()

        await markNotificationsReadAction({ callbacks: { success } })(dispatch)

        expect(success).toHaveBeenCalledWith({ updated: 3, unreadCount: 0 })
    })
})

describe('fetchUnreadCountAction', () => {
    test('actually sends the GET and sets the badge', async () => {
        const dispatch = jest.fn()

        await fetchUnreadCountAction()(dispatch)

        expect(get).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT)
        expect(dispatch).toHaveBeenCalledWith({ type: UNREAD_COUNT_SET, payload: 5 })
    })

    test('stays silent when it cannot reach the server', async () => {
        // A bell that cannot reach the server shows the count it last knew,
        // which beats a spinner or a wrong zero.
        get.mockRejectedValue(new Error('offline'))
        const dispatch = jest.fn()

        await fetchUnreadCountAction()(dispatch)

        expect(dispatch).not.toHaveBeenCalled()
    })
})
