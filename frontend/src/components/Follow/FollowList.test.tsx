import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import FollowList from './FollowList'
import { MyFollowing, MyFollowers } from './MyFollows'
import { AppContext } from '../../App'
import * as followsActions from '../../redux/actions/followsActions'
import {
    FOLLOW_LIST_LOAD_MORE,
    FOLLOWING_EMPTY,
    FOLLOWERS_EMPTY,
    AI_BADGE_LABEL
} from '../../data/constants'

jest.mock('../../redux/actions/followsActions', () => ({
    ...jest.requireActual('../../redux/actions/followsActions'),
    getFollowersAction: jest.fn(() => ({ type: 'GET_FOLLOWERS' })),
    getFollowingAction: jest.fn(() => ({ type: 'GET_FOLLOWING' }))
}))

const mockFollowers = followsActions.getFollowersAction as jest.Mock
const mockFollowing = followsActions.getFollowingAction as jest.Mock
const mockStore = configureStore([])

// The two directions hold DIFFERENT people. A component that read the wrong
// cache — easy, since one component serves both tabs off a single boolean —
// returns a different list rather than the same one by luck.
const ADA = { id: 'a-id-1', slug: 'ada-brine', name: 'Ada Brine', picture: '', type: 'user' }
const MILO = { id: 'a-id-2', slug: 'milo-vex', name: 'Milo Vex', picture: '', type: 'ai' }
const ZORA = { id: 'a-id-3', slug: 'zora-quist', name: 'Zora Quist', picture: '', type: 'user' }

// id and slug are deliberately different strings throughout: rows are keyed by
// id in the store and linked by slug in the URL, so a mix-up cannot pass.
const VIEWER_ID = '6a076c7d0472cf659e70e866'

const query = (over: any = {}) => ({
    item: [], isFetching: false, hasMore: false, page: 1, total: 0, error: null, ...over
})

function buildStore({ followers = query(), following = query(), entities = [ADA, MILO, ZORA] }: any = {}) {
    return mockStore({
        followersQuery: followers,
        followingQuery: following,
        authorEntities: {
            ids: entities.map((e: any) => e.id),
            entities: Object.fromEntries(entities.map((e: any) => [e.id, e]))
        }
    })
}

const renderList = (props: any, storeOpts?: any) =>
    render(
        <Provider store={buildStore(storeOpts)}>
            <FollowList {...props} />
        </Provider>
    )

// Read the name ELEMENT, not the row's textContent: the avatar renders the
// author's initials as text, so a row for Ada Brine reads "ABAda Brine".
const names = () =>
    Array.from(document.querySelectorAll('.follow-list__name')).map(el => el.textContent)

describe('FollowList', () => {
    beforeEach(() => jest.clearAllMocks())

    const followersProps = { idOrSlug: 'nadia-novak', direction: 'followers', emptyMessage: FOLLOWERS_EMPTY }
    const followingProps = { idOrSlug: 'nadia-novak', direction: 'following', emptyMessage: FOLLOWING_EMPTY }

    describe('picking a direction', () => {
        test('followers fetches followers and renders the followers cache', () => {
            renderList(followersProps, {
                followers: query({ item: [ADA.id] }),
                following: query({ item: [ZORA.id] })
            })

            expect(mockFollowers).toHaveBeenCalledTimes(1)
            expect(mockFollowing).not.toHaveBeenCalled()
            expect(names()).toEqual(['Ada Brine'])
        })

        test('following fetches following and renders the following cache', () => {
            renderList(followingProps, {
                followers: query({ item: [ADA.id] }),
                following: query({ item: [ZORA.id] })
            })

            expect(mockFollowing).toHaveBeenCalledTimes(1)
            expect(mockFollowers).not.toHaveBeenCalled()
            expect(names()).toEqual(['Zora Quist'])
        })

        test('the first fetch resets rather than appending', () => {
            renderList(followersProps)

            const args = mockFollowers.mock.calls[0][0]
            expect(args.idOrSlug).toBe('nadia-novak')
            expect(args.params.page).toBe(1)
            expect(args.options).toEqual({ reset: true, fetch: true })
        })
    })

    describe('rows', () => {
        test('links by slug, not by id', () => {
            renderList(followersProps, { followers: query({ item: [ADA.id] }) })

            expect(screen.getByRole('link', { name: /Ada Brine/ }))
                .toHaveAttribute('href', `/authors/${ADA.slug}`)
        })

        test('badges an AI persona and leaves humans unbadged', () => {
            // The product rule: following an AI persona is allowed, but every
            // follow surface has to say so. A fixture of humans only would pass
            // against a row that dropped `type` entirely.
            renderList(followersProps, { followers: query({ item: [ADA.id, MILO.id] }) })

            const badges = screen.getAllByText(AI_BADGE_LABEL)
            expect(badges).toHaveLength(1)
            expect(screen.getAllByRole('listitem')[1]).toHaveTextContent(AI_BADGE_LABEL)
            expect(screen.getAllByRole('listitem')[0]).not.toHaveTextContent(AI_BADGE_LABEL)
        })

        test('drops an id with no entity instead of rendering a blank row', () => {
            renderList(followersProps, { followers: query({ item: [ADA.id, 'ghost-id'] }) })

            expect(names()).toEqual(['Ada Brine'])
        })
    })

    describe('loading and empty states', () => {
        test('spins on a first load', () => {
            renderList(followersProps, { followers: query({ isFetching: true }) })

            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })

        test('keeps the rows on screen while paging', () => {
            // The distractor for the test above: fetching AND rows present must
            // not replace the list, or paging makes it jump back to empty.
            renderList(followersProps, {
                followers: query({ item: [ADA.id], isFetching: true })
            })

            expect(names()).toEqual(['Ada Brine'])
            expect(screen.getByRole('progressbar')).toBeInTheDocument()
        })

        test('says the list is empty only once it has loaded', () => {
            renderList(followersProps, { followers: query({ isFetching: false }) })

            expect(screen.getByText(FOLLOWERS_EMPTY)).toBeInTheDocument()
            expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
        })

        test('each direction carries its own empty message', () => {
            renderList(followingProps)

            expect(screen.getByText(FOLLOWING_EMPTY)).toBeInTheDocument()
        })
    })

    describe('paging', () => {
        test('asks for the next page, and does NOT reset', () => {
            // Resetting here would discard the rows already on screen and make
            // "Show more" behave as "start again".
            renderList(followersProps, {
                followers: query({ item: [ADA.id], hasMore: true, page: 2 })
            })
            mockFollowers.mockClear()

            return userEvent.click(screen.getByRole('button', { name: FOLLOW_LIST_LOAD_MORE }))
                .then(() => {
                    const args = mockFollowers.mock.calls[0][0]
                    expect(args.params.page).toBe(3)
                    expect(args.options?.reset).toBeFalsy()
                })
        })

        test('offers no pager on the last page', () => {
            renderList(followersProps, { followers: query({ item: [ADA.id], hasMore: false }) })

            expect(screen.queryByRole('button', { name: FOLLOW_LIST_LOAD_MORE })).not.toBeInTheDocument()
        })

        test('hides the pager while a page is in flight', () => {
            renderList(followersProps, {
                followers: query({ item: [ADA.id], hasMore: true, isFetching: true })
            })

            expect(screen.queryByRole('button', { name: FOLLOW_LIST_LOAD_MORE })).not.toBeInTheDocument()
        })
    })
})

describe('MyFollows — the profile tabs', () => {
    beforeEach(() => jest.clearAllMocks())

    const signedIn = { user: 'token', userId: VIEWER_ID, config: {} }

    const renderTab = (Component: React.ComponentType, context: any = signedIn) =>
        render(
            <Provider store={buildStore()}>
                <AppContext.Provider value={context as never}>
                    <Component />
                </AppContext.Provider>
            </Provider>
        )

    test('addresses the graph by the session USER ID, not a slug', () => {
        // The JWT is identity-only — it carries `id` and `username` and no slug
        // at all — which is why the endpoints resolve id-or-slug. A tab that
        // passed a slug would request a route the session cannot name.
        renderTab(MyFollowing)

        expect(mockFollowing.mock.calls[0][0].idOrSlug).toBe(VIEWER_ID)
    })

    test('MyFollowing and MyFollowers pull opposite directions', () => {
        renderTab(MyFollowing)
        expect(mockFollowing).toHaveBeenCalledTimes(1)
        expect(mockFollowers).not.toHaveBeenCalled()

        jest.clearAllMocks()

        renderTab(MyFollowers)
        expect(mockFollowers).toHaveBeenCalledTimes(1)
        expect(mockFollowing).not.toHaveBeenCalled()
    })

    test('render nothing, and fetch nothing, without a session', () => {
        const { container } = renderTab(MyFollowing, { user: '', userId: '' })

        expect(container).toBeEmptyDOMElement()
        expect(mockFollowing).not.toHaveBeenCalled()
    })
})
