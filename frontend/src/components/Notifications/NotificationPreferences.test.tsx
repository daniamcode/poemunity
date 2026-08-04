import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import NotificationPreferences from './NotificationPreferences'
import { AppContext } from '../../App'
import * as actions from '../../redux/actions/notificationsActions'
import { NOTIFICATION_PREF_LABELS } from '../../data/constants'

jest.mock('../../redux/actions/notificationsActions', () => ({
    getNotificationPreferencesAction: jest.fn(() => ({ type: 'GET_PREFS' })),
    saveNotificationPreferencesAction: jest.fn(() => ({ type: 'SAVE_PREFS' }))
}))

const mockGet = actions.getNotificationPreferencesAction as jest.Mock
const mockSave = actions.saveNotificationPreferencesAction as jest.Mock
const mockStore = configureStore([])

const signedIn = { user: 'token', userId: 'me-1', username: 'me', config: {} }
const allOn = { like: true, comment: true, follow: true, newPoem: true }

const renderPrefs = (opts: any = {}) => {
    const context = 'context' in opts ? opts.context : signedIn
    const item = 'item' in opts ? opts.item : allOn
    const isFetching = opts.isFetching ?? false

    return render(
        <Provider store={mockStore({ notificationPreferencesQuery: { item, isFetching, isError: false } })}>
            <AppContext.Provider value={context as never}>
                <NotificationPreferences />
            </AppContext.Provider>
        </Provider>
    )
}

const box = (type: keyof typeof NOTIFICATION_PREF_LABELS) =>
    screen.getByRole('checkbox', { name: NOTIFICATION_PREF_LABELS[type] })

/**
 * Fire the success/error callback the component handed to the save action.
 *
 * Wrapped in `act` because these callbacks are invoked from outside React's
 * event loop — exactly as the real thunk invokes them — and the state update
 * they cause would otherwise not be flushed before the assertion.
 */
const settle = (outcome: 'success' | 'error', call = 0) =>
    act(() => { mockSave.mock.calls[call][0].callbacks[outcome]({}) })

describe('NotificationPreferences', () => {
    beforeEach(() => jest.clearAllMocks())

    test('renders nothing when signed out', () => {
        const { container } = renderPrefs({ context: { user: '', userId: '', config: {} } })

        expect(container).toBeEmptyDOMElement()
        expect(mockGet).not.toHaveBeenCalled()
    })

    test('loads the stored preferences on mount', () => {
        renderPrefs()

        expect(mockGet).toHaveBeenCalledTimes(1)
    })

    describe('before the values have arrived', () => {
        test('shows every box checked, because absent means ON', () => {
            // An unchecked initial render would tell a user their
            // notifications are off and then flip.
            renderPrefs({ item: undefined, isFetching: true })

            expect(box('like')).toBeChecked()
            expect(box('newPoem')).toBeChecked()
        })

        test('but disables them, so nobody toggles a value they have not seen', () => {
            renderPrefs({ item: undefined, isFetching: true })

            expect(box('like')).toBeDisabled()
        })
    })

    describe('the boxes are independent', () => {
        // The bug this file exists for: every input carried
        // `disabled={query.isFetching}`, one flag for the whole query, so
        // toggling one box greyed out and restored all four.
        // `isFetching: true` WITH values already loaded is precisely the state
        // a save puts the query in. It has to be set on the store directly:
        // redux-mock-store runs no reducers, so clicking a box never flips the
        // flag on its own — an earlier version of this test clicked and
        // asserted, and passed happily against the buggy `disabled={isFetching}`
        // because the flag it was meant to catch never turned on. Red-check.
        test('every box stays enabled while a save is in flight', () => {
            renderPrefs({ item: allOn, isFetching: true })

            expect(box('like')).toBeEnabled()
            expect(box('comment')).toBeEnabled()
            expect(box('follow')).toBeEnabled()
            expect(box('newPoem')).toBeEnabled()
        })

        test('clicking one box sends exactly one save', async () => {
            const user = userEvent.setup()
            renderPrefs()

            await user.click(box('like'))

            expect(mockSave).toHaveBeenCalledTimes(1)
        })

        test('toggling one box leaves the others’ values alone', async () => {
            const user = userEvent.setup()
            renderPrefs()

            await user.click(box('comment'))

            expect(box('like')).toBeChecked()
            expect(box('follow')).toBeChecked()
            expect(box('newPoem')).toBeChecked()
        })
    })

    describe('the tick moves immediately', () => {
        test('without waiting for the round-trip', async () => {
            // The store still says `like: true` — nothing has come back yet.
            // On a cold serverless backend the old behaviour was long enough to
            // read as a dead control.
            const user = userEvent.setup()
            renderPrefs()

            await user.click(box('like'))

            expect(box('like')).not.toBeChecked()
        })

        test('and stays put once the save succeeds', async () => {
            const user = userEvent.setup()
            renderPrefs()

            await user.click(box('like'))
            settle('success')

            // The mock store never updates, so after the override clears this
            // reads the store's `like: true` again — which is the honest
            // outcome: the component shows what is stored.
            expect(box('like')).toBeChecked()
        })

        test('and un-flips when the save fails', async () => {
            // A toggle that silently did nothing while still looking set is the
            // worst outcome here.
            const user = userEvent.setup()
            renderPrefs()

            await user.click(box('like'))
            expect(box('like')).not.toBeChecked()

            settle('error')

            expect(box('like')).toBeChecked()
        })
    })

    describe('what gets sent', () => {
        test('only the field that changed', async () => {
            const user = userEvent.setup()
            renderPrefs()

            await user.click(box('follow'))

            expect(mockSave).toHaveBeenCalledTimes(1)
            expect(mockSave.mock.calls[0][0].data).toEqual({ follow: false })
        })

        test('turning one back on sends true', async () => {
            const user = userEvent.setup()
            renderPrefs({ item: { ...allOn, follow: false } })

            await user.click(box('follow'))

            expect(mockSave.mock.calls[0][0].data).toEqual({ follow: true })
        })
    })

    test('a stale response does not snap a rapidly-toggled box back', async () => {
        // THREE clicks, not two. With two the box lands back on the store's own
        // value, so clearing the override coincidentally shows the right thing
        // and the test passes without the ticket guard — that is how the first
        // version of this test was hollow. An odd number of clicks leaves the
        // optimistic value DISAGREEING with the store, which is the only way to
        // see whether a stale response wrongly cleared it.
        const user = userEvent.setup()
        renderPrefs() // store: like = true

        await user.click(box('like')) // -> off
        await user.click(box('like')) // -> on
        await user.click(box('like')) // -> off, and this is the live answer

        expect(mockSave).toHaveBeenCalledTimes(3)
        expect(mockSave.mock.calls[2][0].data).toEqual({ like: false })

        settle('success', 0) // the FIRST, now two-clicks-stale response

        // Unguarded, this reverts to the store's `true` and undoes two clicks.
        expect(box('like')).not.toBeChecked()
    })
})
