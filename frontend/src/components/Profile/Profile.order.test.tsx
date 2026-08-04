import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import Profile from './Profile'
import store from '../../redux/store'
import { AppContext } from '../../App'
import { NOTIFICATION_PREFS_BUTTON } from '../../data/constants'

/**
 * WHERE things sit on the profile, which is not cosmetic.
 *
 * The notification preferences open from a button beside "Edit profile".
 *
 * Three wrong versions preceded this. Expanded in the settings column, six
 * toggles plus the email section made it twice the height of the poem form
 * beside it — dead space down the page, and the profile TABS pushed below the
 * fold. Moving it BELOW the tabs was worse: those panels hold
 * infinitely-scrolling poem lists, so nothing under them can be reached. A
 * self-collapsing block was closer, but its trigger was a heading, which reads
 * as a section label rather than something to press.
 *
 * Now it is a peer action next to "Edit profile", and the panel renders
 * nothing until asked.
 */
const mockContext = {
    user: 'test-user',
    userId: '123',
    username: 'Test User',
    picture: 'test.jpg',
    isAdmin: false,
    setState: jest.fn(),
    config: { headers: { Authorization: 'Bearer test-token' } }
}

const renderProfile = () =>
    render(
        <AppContext.Provider value={mockContext as never}>
            <Provider store={store}>
                <Profile />
            </Provider>
        </AppContext.Provider>
    )

describe('Profile — order of the page', () => {
    test('nothing is rendered until the button is pressed', () => {
        // Expanded by default, six toggles plus the email section made this
        // column twice the height of the poem form beside it.
        const { container } = renderProfile()

        expect(container.querySelector('.notification-prefs')).toBeNull()
        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(0)
    })

    test('the trigger sits beside Edit profile, as a peer action', () => {
        const { container } = renderProfile()

        const actions = container.querySelector('.user-info__actions')

        expect(actions).not.toBeNull()
        const labels = Array.from(actions!.querySelectorAll('button')).map(b => b.textContent)
        expect(labels).toEqual(['Edit profile', NOTIFICATION_PREFS_BUTTON])
    })

    test('pressing it opens the panel, in the column and above the tabs', async () => {
        const user = userEvent.setup()
        const { container } = renderProfile()

        await user.click(screen.getByRole('button', { name: NOTIFICATION_PREFS_BUTTON }))

        const prefs = container.querySelector('.notification-prefs')
        expect(prefs).not.toBeNull()
        expect(prefs!.closest('.profile__user-column')).not.toBeNull()

        const tabs = container.querySelector('.profile__outro')
        expect(tabs!.compareDocumentPosition(prefs!) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy()
    })

    test('the settings column keeps the short things — picture and name', () => {
        // What is left there is what stays roughly as tall as the poem form
        // beside it. `.profile-stats` is deliberately NOT asserted: it renders
        // nothing until its fetch lands, which is the behaviour it was built
        // with, so it is absent here.
        const { container } = renderProfile()

        const column = container.querySelector('.profile__user-column')

        expect(column).not.toBeNull()
        expect(column!.querySelector('.user-info')).not.toBeNull()
    })
})
