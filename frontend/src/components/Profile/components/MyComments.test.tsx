import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import MyComments from './MyComments'
import { AppContext } from '../../../App'
import * as actions from '../../../redux/actions/myCommentsActions'
import {
    MY_COMMENTS_EMPTY,
    MY_COMMENTS_LOAD_MORE,
    MY_COMMENTS_RECEIVED,
    MY_COMMENTS_WRITTEN,
    MY_COMMENTS_RECEIVED_EMPTY
} from '../../../data/constants'

jest.mock('../../../redux/actions/myCommentsActions', () => ({
    getMyCommentsAction: jest.fn(() => ({ type: 'GET_MY_COMMENTS' })),
    getReceivedCommentsAction: jest.fn(() => ({ type: 'GET_RECEIVED_COMMENTS' }))
}))

const mockGet = actions.getMyCommentsAction as jest.Mock
const mockGetReceived = actions.getReceivedCommentsAction as jest.Mock

const receivedRow = {
    id: 'r1',
    body: 'answering you',
    createdAt: '2026-08-02T10:00:00.000Z',
    targetType: 'poem',
    isReply: true,
    poem: { id: 'p9', title: 'Theirs', slug: 'theirs-nadia' },
    author: { id: 'a9', name: 'Nadia Novak', slug: 'nadia-novak', type: 'user' }
}
const mockStore = configureStore([])

const signedIn = { user: 'token', userId: 'me-1', username: 'me', config: {} }

const poemRow = {
    id: 'c1',
    body: 'a lovely turn in the third line',
    createdAt: '2026-08-01T10:00:00.000Z',
    targetType: 'poem',
    poem: { id: 'p1', title: 'Aubade', slug: 'aubade-nadia', author: { name: 'Nadia Novak', slug: 'nadia-novak' } }
}

const profileRow = {
    id: 'c2',
    body: 'good to see you here',
    createdAt: '2026-07-30T10:00:00.000Z',
    targetType: 'profile',
    author: { name: 'Milo Vex', slug: 'milo-vex' }
}

// NOT destructured with defaults — a default parameter fires on an explicit
// `undefined`, which would silently restore the populated fixture.
const renderComments = (opts: any = {}) => {
    const context = 'context' in opts ? opts.context : signedIn
    const item = 'item' in opts ? opts.item : [poemRow]
    const isFetching = opts.isFetching ?? false
    const hasMore = opts.hasMore ?? false
    const page = opts.page ?? 1
    const received = 'received' in opts ? opts.received : [receivedRow]

    return render(
        <Provider store={mockStore({
            myCommentsQuery: { item, isFetching, isError: false, hasMore, page },
            receivedCommentsQuery: { item: received, isFetching: false, isError: false, hasMore: false, page: 1 }
        })}>
            <AppContext.Provider value={context as never}>
                <MyComments />
            </AppContext.Provider>
        </Provider>
    )
}

describe('MyComments', () => {
    beforeEach(() => jest.clearAllMocks())

    test('renders nothing and fetches nothing when signed out', () => {
        const { container } = renderComments({ context: { user: '', userId: '', config: {} } })

        expect(container).toBeEmptyDOMElement()
        expect(mockGet).not.toHaveBeenCalled()
    })

    test('fetches page 1, replacing whatever was cached, and sends no author id', () => {
        // The endpoint is scoped by the session; passing an id would read as
        // though client-supplied scope were what keeps the list yours.
        renderComments()

        expect(mockGet).toHaveBeenCalledTimes(1)
        expect(mockGet.mock.calls[0][0]).toEqual({
            params: { page: 1 },
            options: { reset: true, fetch: true }
        })
    })

    test('shows the comment body and links to the poem', () => {
        // The whole point of the tab: getting back to what you commented on.
        renderComments({ item: [poemRow] })

        expect(screen.getByText('a lovely turn in the third line')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Aubade' })).toHaveAttribute('href', '/detail/aubade-nadia')
    })

    test('names the poem’s author, because two poems can share a title', () => {
        renderComments({ item: [poemRow] })

        expect(screen.getByText(/by Nadia Novak/)).toBeInTheDocument()
    })

    test('a profile comment links to the author, not to a poem', () => {
        renderComments({ item: [profileRow] })

        expect(screen.getByRole('link', { name: 'Milo Vex' })).toHaveAttribute('href', '/authors/milo-vex')
    })

    test('renders a row with no usable target as text, not a broken link', () => {
        // Defensive: the server drops unreachable targets, so this should not
        // arrive — but a row that renders as a link to nowhere is worse than
        // one that is not a link.
        renderComments({ item: [{ ...poemRow, poem: { id: '', title: 'Ghost' } }] })

        expect(screen.queryByRole('link')).not.toBeInTheDocument()
        expect(screen.getByText('Ghost')).toBeInTheDocument()
    })

    test('shows when each comment was written, machine-readably', () => {
        // Asserted on the `dateTime` attribute, not the visible text. The
        // visible form is relative ("3 days ago") and so depends on the real
        // clock — an assertion on it would drift with the calendar. The
        // relative formatting itself is covered, with an injected `now`, in
        // notificationText.test.ts.
        const { container } = renderComments({ item: [poemRow] })

        const time = container.querySelector('time')
        expect(time).toHaveAttribute('dateTime', '2026-08-01T10:00:00.000Z')
        expect(time?.textContent).toBeTruthy()
    })

    describe('empty and loading', () => {
        test('says so when you have never commented', () => {
            renderComments({ item: [] })

            expect(screen.getByText(MY_COMMENTS_EMPTY)).toBeInTheDocument()
        })

        test('shows a spinner only when there is nothing to show yet', () => {
            renderComments({ item: [], isFetching: true })

            expect(screen.queryByText(MY_COMMENTS_EMPTY)).not.toBeInTheDocument()
        })

        test('paging in more rows does not blank the list you are reading', () => {
            // The distractor for the test above: a spinner gated only on
            // isFetching would replace the visible rows on every "Show more".
            renderComments({ item: [poemRow], isFetching: true, hasMore: true })

            expect(screen.getByText('a lovely turn in the third line')).toBeInTheDocument()
        })
    })

    describe('Show more', () => {
        test('is absent when there is no more', () => {
            renderComments({ item: [poemRow], hasMore: false })

            expect(screen.queryByRole('button', { name: MY_COMMENTS_LOAD_MORE })).not.toBeInTheDocument()
        })

        test('asks for the NEXT page, not page 1 again', async () => {
            const user = userEvent.setup()
            renderComments({ item: [poemRow], hasMore: true, page: 2 })

            await user.click(screen.getByRole('button', { name: MY_COMMENTS_LOAD_MORE }))

            // Page 3, and without `reset` — appending, not replacing.
            expect(mockGet).toHaveBeenLastCalledWith({ params: { page: 3 } })
        })

        test('does nothing while a fetch is already in flight', async () => {
            const user = userEvent.setup()
            renderComments({ item: [poemRow], hasMore: true, isFetching: true })

            expect(screen.queryByRole('button', { name: MY_COMMENTS_LOAD_MORE })).not.toBeInTheDocument()
            void user
        })
    })
})

describe('MyComments — the Written / Received toggle', () => {
    // A toggle rather than a seventh profile tab: the bar is at six already,
    // and the two halves are the same thing from opposite ends.
    const switchTo = async (label: string) => {
        const user = userEvent.setup()
        await user.click(screen.getByRole('tab', { name: label }))
    }

    beforeEach(() => jest.clearAllMocks())

    test('opens on Written, and fetches only that half', () => {
        renderComments()

        expect(screen.getByRole('tab', { name: MY_COMMENTS_WRITTEN })).toHaveAttribute('aria-selected', 'true')
        expect(mockGet).toHaveBeenCalledTimes(1)
        expect(mockGetReceived).not.toHaveBeenCalled()
    })

    test('switching to Received fetches the other half', async () => {
        renderComments()

        await switchTo(MY_COMMENTS_RECEIVED)

        expect(mockGetReceived).toHaveBeenCalledTimes(1)
        expect(mockGetReceived.mock.calls[0][0]).toEqual({
            params: { page: 1 },
            options: { reset: true, fetch: true }
        })
    })

    test('a received row names WHO, and calls a reply a reply', async () => {
        // "Commented on your poem" is true of a reply too, but loses that it
        // answered YOU — which is the reason the row is worth surfacing.
        renderComments()

        await switchTo(MY_COMMENTS_RECEIVED)

        expect(screen.getByText('answering you')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Nadia Novak' })).toHaveAttribute('href', '/authors/nadia-novak')
        expect(screen.getByText(/replied to you on/)).toBeInTheDocument()
    })

    test('a received row links to the poem it is on', async () => {
        renderComments()

        await switchTo(MY_COMMENTS_RECEIVED)

        expect(screen.getByRole('link', { name: 'Theirs' })).toHaveAttribute('href', '/detail/theirs-nadia')
    })

    test('a plain comment on your poem is NOT called a reply', async () => {
        // The distractor for the test above.
        renderComments({ received: [{ ...receivedRow, isReply: false }] })

        await switchTo(MY_COMMENTS_RECEIVED)

        expect(screen.queryByText(/replied to you/)).not.toBeInTheDocument()
        expect(screen.getByText(/commented on/)).toBeInTheDocument()
    })

    test('the empty state is the RECEIVED one, not the written one', async () => {
        renderComments({ received: [] })

        await switchTo(MY_COMMENTS_RECEIVED)

        expect(screen.getByText(MY_COMMENTS_RECEIVED_EMPTY)).toBeInTheDocument()
        expect(screen.queryByText(MY_COMMENTS_EMPTY)).not.toBeInTheDocument()
    })

    test('the toggle survives an empty list', async () => {
        // Without it, switching to an empty half removes the control you just
        // used and strands you there.
        renderComments({ received: [] })

        await switchTo(MY_COMMENTS_RECEIVED)

        expect(screen.getByRole('tab', { name: MY_COMMENTS_WRITTEN })).toBeInTheDocument()
    })

    test('an AI commenter keeps its badge here too', async () => {
        renderComments({ received: [{ ...receivedRow, author: { ...receivedRow.author, type: 'ai' } }] })

        await switchTo(MY_COMMENTS_RECEIVED)

        expect(screen.getByText('AI')).toBeInTheDocument()
    })
})
