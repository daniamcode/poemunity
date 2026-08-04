import { render } from '@testing-library/react'
import { Provider } from 'react-redux'
import Profile from './Profile'
import store from '../../redux/store'
import { AppContext } from '../../App'

/**
 * WHERE things sit on the profile, which is not cosmetic.
 *
 * The notification preferences used to live in the settings column beside the
 * poem form. Six toggles plus the email section made that column roughly twice
 * the height of the form, which left a long band of dead space down the right
 * of the page — and pushed the TABS below the fold.
 *
 * The tabs are the profile: your poems, drafts, follows, comments. Settings you
 * change once a year must not outrank them, and nothing about that column
 * suggested there was anything below it worth scrolling to.
 */
const mockContext = {
    user: 'test-user',
    userId: '123',
    username: 'Test User',
    picture: 'test.jpg',
    isAdmin: false,
    elementToEdit: '',
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
    test('the tabs come BEFORE the notification preferences', () => {
        const { container } = renderProfile()

        const tabs = container.querySelector('.profile__outro')
        const prefs = container.querySelector('.notification-prefs')

        expect(tabs).not.toBeNull()
        expect(prefs).not.toBeNull()
        // DOCUMENT_POSITION_FOLLOWING: prefs comes after tabs in the DOM.
        expect(tabs!.compareDocumentPosition(prefs!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    test('the preferences are NOT inside the settings column', () => {
        // The distractor for the test above: a preferences block still nested
        // in `.profile__user-column` would also "follow" the intro section, but
        // would put the column back to twice the form's height.
        const { container } = renderProfile()

        const prefs = container.querySelector('.notification-prefs')

        expect(prefs!.closest('.profile__user-column')).toBeNull()
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
