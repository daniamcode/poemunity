import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ProfileTabs from './ProfileTabs'
import { AppContext } from '../../../App'
import * as followsActions from '../../../redux/actions/followsActions'
import {
    PROFILE_POEMS,
    PROFILE_FAVOURITE_POEMS,
    PROFILE_DRAFTS,
    PROFILE_FOLLOWING,
    PROFILE_FOLLOWERS,
    PROFILE_COMMENTS
} from '../../../data/constants'

jest.mock('../../../utils/notifications')
jest.mock('../../../hooks/useInfiniteScroll', () => ({
    useInfiniteScroll: jest.fn(() => ({ current: null }))
}))
jest.mock('../../../redux/actions/followsActions', () => ({
    ...jest.requireActual('../../../redux/actions/followsActions'),
    getFollowersAction: jest.fn(() => ({ type: 'GET_FOLLOWERS' })),
    getFollowingAction: jest.fn(() => ({ type: 'GET_FOLLOWING' }))
}))
jest.mock('../../../redux/actions/poemsActions', () => ({
    ...jest.requireActual('../../../redux/actions/poemsActions'),
    getMyPoemsAction: jest.fn(() => ({ type: 'GET_MY_POEMS' })),
    getMyDraftsAction: jest.fn(() => ({ type: 'GET_MY_DRAFTS' })),
    getMyFavouritePoemsAction: jest.fn(() => ({ type: 'GET_MY_FAVS' }))
}))

const mockFollowers = followsActions.getFollowersAction as jest.Mock
const mockFollowing = followsActions.getFollowingAction as jest.Mock
const mockStore = configureStore([])

const VIEWER_ID = '6a076c7d0472cf659e70e866'

const emptyQuery = { item: [], isFetching: false, hasMore: false, page: 1, total: 0, error: null }

const renderTabs = (value: number) =>
    render(
        <Provider
            store={mockStore({
                followersQuery: emptyQuery,
                followingQuery: emptyQuery,
                myPoemsQuery: emptyQuery,
                myDraftsQuery: emptyQuery,
                myFavouritePoemsQuery: emptyQuery,
                poemEntities: { ids: [], entities: {} },
                authorEntities: { ids: [], entities: {} }
            })}
        >
            <AppContext.Provider value={{ user: 'token', userId: VIEWER_ID, config: {} } as never}>
                <ProfileTabs value={value} handleChange={jest.fn()} handleChangeIndex={jest.fn()} />
            </AppContext.Provider>
        </Provider>
    )

/**
 * The two follow tabs' WIRING — that each index reaches the component it
 * claims to. The visual snapshot test proves five tabs render; it cannot tell
 * whether tab 3 opens Following or Followers, because both panels look
 * identical when empty. Swapping the two indexes is the likeliest mistake here
 * and the hardest to see by eye.
 *
 * It also pins the claim in ProfileTabs' own comment: TabPanel renders children
 * only while selected (`{value === index && ...}`), so exactly ONE follow list
 * is mounted and fetching at a time. If that ever stops being true, both
 * caches load on every visit to the profile and the tabs race each other.
 */
describe('Profile follow tabs', () => {
    beforeEach(() => jest.clearAllMocks())

    test('renders all six tabs, in order', () => {
        // Following before Followers: the first is the list you curated and act
        // on, the second is one that happens to you. My comments LAST — it is
        // the newest and the least often wanted, and the order of the five
        // before it is muscle memory for anyone already using the site.
        renderTabs(0)

        expect(screen.getAllByRole('tab').map(t => t.textContent)).toEqual([
            PROFILE_POEMS,
            PROFILE_FAVOURITE_POEMS,
            PROFILE_DRAFTS,
            PROFILE_FOLLOWING,
            PROFILE_FOLLOWERS,
            PROFILE_COMMENTS
        ])
    })

    test('tab 3 opens Following, and fetches only that direction', () => {
        renderTabs(3)

        expect(mockFollowing).toHaveBeenCalledTimes(1)
        expect(mockFollowers).not.toHaveBeenCalled()
        expect(mockFollowing.mock.calls[0][0].idOrSlug).toBe(VIEWER_ID)
    })

    test('tab 4 opens Followers, and fetches only that direction', () => {
        renderTabs(4)

        expect(mockFollowers).toHaveBeenCalledTimes(1)
        expect(mockFollowing).not.toHaveBeenCalled()
    })

    test('neither follow list loads while another tab is open', () => {
        // The cost of getting this wrong is two extra requests on every visit
        // to My Poems, for lists nobody is looking at.
        renderTabs(0)

        expect(mockFollowing).not.toHaveBeenCalled()
        expect(mockFollowers).not.toHaveBeenCalled()
    })
})
