import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import ProfileStats from './ProfileStats'
import { AppContext } from '../../App'
import * as actions from '../../redux/actions/statsActions'
import {
    STATS_TITLE,
    STATS_POEMS_LABEL,
    STATS_LIKES_LABEL,
    STATS_RANK_LABEL,
    STATS_RANK_UNRANKED,
    STATS_EMPTY
} from '../../data/constants'

jest.mock('../../redux/actions/statsActions', () => ({
    getUserStatsAction: jest.fn(() => ({ type: 'GET_USER_STATS' }))
}))

const mockGetStats = actions.getUserStatsAction as jest.Mock
const mockStore = configureStore([])

const signedIn = { user: 'token', userId: 'me-1', username: 'me', config: {} }
const loggedOut = { user: '', userId: '', username: '', config: {} }

// The ranking rows carry `userId`, which is what the panel matches against.
const ranking = [
    { userId: 'someone-else', author: 'Ada Brine', picture: '', points: 40 },
    { userId: 'me-1', author: 'Me Poet', picture: '', points: 22 },
    { userId: 'third', author: 'Milo Vex', picture: '', points: 10 }
]

// NOT destructured with defaults. A default parameter fires on an explicit
// `undefined`, so `renderStats({ stats: undefined })` would silently restore the
// populated default and test the opposite of what it says — which is exactly
// what happened on the first run here, and the same trap that bit the follow
// button tests. `in` distinguishes "not passed" from "passed as absent".
const renderStats = (opts: any = {}) => {
    const context = 'context' in opts ? opts.context : signedIn
    const stats = 'stats' in opts ? opts.stats : { poemsPublished: 4, likesReceived: 11 }
    const rank = 'rank' in opts ? opts.rank : ranking
    const isFetching = opts.isFetching ?? false

    return render(
        <Provider
            store={mockStore({
                userStatsQuery: { item: stats, isFetching, isError: false },
                rankingQuery: { item: rank, isFetching: false, isError: false },
                authorEntities: { ids: [], entities: {} }
            })}
        >
            <AppContext.Provider value={context as never}>
                <ProfileStats />
            </AppContext.Provider>
        </Provider>
    )
}

describe('ProfileStats', () => {
    beforeEach(() => jest.clearAllMocks())

    test('renders nothing and fetches nothing when signed out', () => {
        const { container } = renderStats({ context: loggedOut })

        expect(container).toBeEmptyDOMElement()
        expect(mockGetStats).not.toHaveBeenCalled()
    })

    test('fetches the stats once on mount', () => {
        renderStats()

        expect(mockGetStats).toHaveBeenCalledTimes(1)
        // No arguments at all: the endpoint is scoped by the session, and
        // passing an author id would read as though client-supplied scope were
        // what keeps these numbers private.
        expect(mockGetStats.mock.calls[0][0]).toBeUndefined()
    })

    test('renders the two server-counted figures', () => {
        renderStats({ stats: { poemsPublished: 4, likesReceived: 11 } })

        expect(screen.getByText(STATS_TITLE)).toBeInTheDocument()
        expect(screen.getByText(STATS_POEMS_LABEL)).toBeInTheDocument()
        expect(screen.getByText('4')).toBeInTheDocument()
        expect(screen.getByText(STATS_LIKES_LABEL)).toBeInTheDocument()
        expect(screen.getByText('11')).toBeInTheDocument()
    })

    test('renders nothing at all while the stats are still loading', () => {
        // A supporting panel beside the profile form: three empty boxes cost
        // more attention than the numbers are worth. Same call the Poem of the
        // week card makes.
        const { container } = renderStats({ stats: undefined, isFetching: true })

        expect(container).toBeEmptyDOMElement()
    })

    test('renders nothing when the request failed', () => {
        const { container } = renderStats({ stats: undefined })

        expect(container).toBeEmptyDOMElement()
    })

    describe('the rank', () => {
        test('shows the 1-based position when the poet is in the top 10', () => {
            // The distractor: the poet is SECOND, not first and not last, so an
            // implementation returning the index, or a hardcoded 1, differs.
            renderStats({ rank: ranking })

            expect(screen.getByText(STATS_RANK_LABEL)).toBeInTheDocument()
            expect(screen.getByText('2')).toBeInTheDocument()
        })

        test('states that the poet is outside the top 10 rather than guessing', () => {
            // The endpoint returns ten rows, so a position outside them is
            // genuinely unknown — "11th" would be invented.
            renderStats({ rank: [{ userId: 'someone-else', author: 'Ada', picture: '', points: 40 }] })

            expect(screen.getByText(STATS_RANK_UNRANKED)).toBeInTheDocument()
        })

        test('is unranked, not crashed, when the ranking has not loaded', () => {
            renderStats({ rank: undefined })

            expect(screen.getByText(STATS_RANK_UNRANKED)).toBeInTheDocument()
        })

        test('matches the id across types', () => {
            // The two sides genuinely differ in type: context carries the id
            // from the JWT, the ranking row carries whatever the aggregation
            // returned. A strict === between them is always false and would
            // report every poet as unranked.
            //
            // The types must DIFFER in the fixture for this to mean anything —
            // a red-check caught an earlier version using 7 on both sides,
            // which passed happily against `===`.
            renderStats({
                context: { ...signedIn, userId: '7' },
                rank: [{ userId: 7, author: 'Me', picture: '', points: 5 }]
            })

            expect(screen.getByText('1')).toBeInTheDocument()
        })

        test('does not claim somebody else’s rank', () => {
            renderStats({
                context: { ...signedIn, userId: 'not-in-ranking' },
                rank: ranking
            })

            expect(screen.getByText(STATS_RANK_UNRANKED)).toBeInTheDocument()
        })
    })

    describe('a poet with nothing published', () => {
        test('gets one sentence instead of a row of zeroes', () => {
            renderStats({ stats: { poemsPublished: 0, likesReceived: 0 } })

            expect(screen.getByText(STATS_EMPTY)).toBeInTheDocument()
            expect(screen.queryByText(STATS_POEMS_LABEL)).not.toBeInTheDocument()
        })

        test('but a poem with no likes yet still shows the figures', () => {
            // The distractor for the test above: zero LIKES is not the same as
            // nothing published, and collapsing both to the empty state would
            // hide a real poem from its author.
            renderStats({ stats: { poemsPublished: 1, likesReceived: 0 } })

            expect(screen.queryByText(STATS_EMPTY)).not.toBeInTheDocument()
            expect(screen.getByText(STATS_POEMS_LABEL)).toBeInTheDocument()
            expect(screen.getByText('1')).toBeInTheDocument()
        })
    })

    test('each figure keeps its own label, in valid <dl> order', () => {
        // The figure sits ABOVE its label visually, but a <dl> requires its
        // <dt> before its <dd> — so the flip has to come from CSS
        // (column-reverse), never from reordering the markup. This asserts both
        // halves: the pairing, and the source order that makes it valid.
        //
        // An earlier version of this test compared getAllByRole('term') against
        // getAllByRole('definition') and was hollow: those are two separate
        // lists, so swapping a dt and dd inside one item left both orders
        // untouched. Red-check caught it.
        const { container } = renderStats({ rank: ranking })

        const items = Array.from(container.querySelectorAll('.profile-stats__item'))
        const pairs = items.map(item => {
            const children = Array.from(item.children)
            return {
                label: item.querySelector('dt')?.textContent,
                value: item.querySelector('dd')?.textContent,
                termComesFirst: children[0]?.tagName === 'DT'
            }
        })

        expect(pairs).toEqual([
            { label: STATS_POEMS_LABEL, value: '4', termComesFirst: true },
            { label: STATS_LIKES_LABEL, value: '11', termComesFirst: true },
            { label: STATS_RANK_LABEL, value: '2', termComesFirst: true }
        ])
    })
})
