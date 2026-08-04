import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import FollowButton from './FollowButton'
import { AppContext } from '../../App'
import * as followsActions from '../../redux/actions/followsActions'
import { FOLLOW, FOLLOWING_STATE, UNFOLLOW } from '../../data/constants'

jest.mock('../../redux/actions/followsActions', () => ({
    ...jest.requireActual('../../redux/actions/followsActions'),
    followAuthorAction: jest.fn(() => ({ type: 'FOLLOW_AUTHOR' })),
    unfollowAuthorAction: jest.fn(() => ({ type: 'UNFOLLOW_AUTHOR' }))
}))

const mockFollow = followsActions.followAuthorAction as jest.Mock
const mockUnfollow = followsActions.unfollowAuthorAction as jest.Mock
const mockStore = configureStore([])

// id and slug are deliberately DIFFERENT values. The button is keyed into the
// normalized store by id but builds its request URL from the slug, so a
// component that used one where it meant the other would still work in any
// fixture that made them equal — the exact bug that made likes stop re-rendering
// on the detail page (see AGENTS.md).
const AUTHOR_ID = '6a076c7d0472cf659e70e866'
const AUTHOR_SLUG = 'nadia-novak'
const VIEWER_ID = '71a1cb2d9496d1ecf2660f7d'

const signedIn = {
    user: 'token',
    userId: VIEWER_ID,
    username: 'viewer',
    picture: '',
    isAdmin: false,
    setState: jest.fn(),
    config: { headers: { Authorization: 'Bearer token' } }
}

const loggedOut = { ...signedIn, user: '', userId: '' }

function renderButton({
    context = signedIn,
    entity,
    initialIsFollowing,
    authorId = AUTHOR_ID
}: any = {}) {
    const store = mockStore({
        authorEntities: entity
            ? { ids: [AUTHOR_ID], entities: { [AUTHOR_ID]: entity } }
            : { ids: [], entities: {} }
    })

    return render(
        <Provider store={store}>
            <AppContext.Provider value={context as never}>
                <FollowButton
                    authorId={authorId}
                    authorSlug={AUTHOR_SLUG}
                    initialIsFollowing={initialIsFollowing}
                />
            </AppContext.Provider>
        </Provider>
    )
}

describe('FollowButton', () => {
    beforeEach(() => jest.clearAllMocks())

    describe('when it should not appear at all', () => {
        test('renders nothing without an author id', () => {
            // Rendered directly rather than through the helper: a destructuring
            // default fires on an explicit `undefined` too, so passing
            // `authorId: undefined` to the helper would silently restore the id
            // and test the opposite of what it says.
            const { container } = render(
                <Provider store={mockStore({ authorEntities: { ids: [], entities: {} } })}>
                    <AppContext.Provider value={signedIn as never}>
                        <FollowButton authorSlug={AUTHOR_SLUG} />
                    </AppContext.Provider>
                </Provider>
            )

            expect(container).toBeEmptyDOMElement()
        })

        test('renders nothing on your own page', () => {
            // The server rejects a self-follow with 400, so a control whose only
            // possible outcome is an error is worse than no control.
            const { container } = renderButton({
                context: { ...signedIn, userId: AUTHOR_ID },
                authorId: AUTHOR_ID
            })

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('logged out', () => {
        test('offers a link to log in rather than a dead button', () => {
            renderButton({ context: loggedOut })

            const link = screen.getByRole('link', { name: FOLLOW })
            expect(link).toHaveAttribute('href', '/login')
        })

        test('clicking it never dispatches a follow', () => {
            renderButton({ context: loggedOut })

            expect(screen.queryByRole('button')).not.toBeInTheDocument()
            expect(mockFollow).not.toHaveBeenCalled()
        })
    })

    describe('state resolution', () => {
        test('falls back to the server-rendered value before the store is seeded', () => {
            // The entity store is empty on first paint. Reading it alone would
            // render "Follow" for a poet you already follow, then flip.
            renderButton({ initialIsFollowing: true })

            expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
        })

        test('the store wins once it has an answer', () => {
            // The distractor: the two sources DISAGREE. An implementation that
            // preferred the prop would pass a fixture where both said the same.
            renderButton({ initialIsFollowing: true, entity: { id: AUTHOR_ID, isFollowing: false } })

            expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
        })

        test('defaults to not-following when neither source knows', () => {
            renderButton()

            expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
        })
    })

    describe('labelling', () => {
        test('shows the STATE but is named for the ACTION when following', () => {
            // "Following" alone reads as a status to a screen reader navigating
            // by button list; the accessible name has to say what pressing does.
            renderButton({ entity: { id: AUTHOR_ID, isFollowing: true } })

            const button = screen.getByRole('button', { name: UNFOLLOW })
            expect(button).toHaveTextContent(FOLLOWING_STATE)
        })

        test('says Follow both ways when not following', () => {
            renderButton()

            expect(screen.getByRole('button', { name: FOLLOW })).toBeInTheDocument()
        })
    })

    describe('dispatching', () => {
        test('follows an author you do not follow, addressed by SLUG', async () => {
            const user = userEvent.setup()
            renderButton()

            await user.click(screen.getByRole('button'))

            expect(mockUnfollow).not.toHaveBeenCalled()
            const args = mockFollow.mock.calls[0][0]
            // The URL is built from the slug; the store key is the id. Distinct
            // values, so a mix-up cannot pass.
            expect(args.idOrSlug).toBe(AUTHOR_SLUG)
            expect(args.authorId).toBe(AUTHOR_ID)
        })

        test('unfollows an author you already follow', async () => {
            const user = userEvent.setup()
            renderButton({ entity: { id: AUTHOR_ID, isFollowing: true } })

            await user.click(screen.getByRole('button'))

            expect(mockFollow).not.toHaveBeenCalled()
            expect(mockUnfollow).toHaveBeenCalledTimes(1)
        })

        test('a double click sends one request, not two', async () => {
            // The button disables itself until the request settles. Without that,
            // an impatient double-click sends follow twice — harmless server-side
            // (the unique index makes it idempotent) but it would also fire
            // follow-then-unfollow if the state flipped between the two clicks.
            const user = userEvent.setup()
            renderButton()

            const button = screen.getByRole('button')
            await user.click(button)
            await user.click(button)

            expect(mockFollow).toHaveBeenCalledTimes(1)
        })
    })
})
