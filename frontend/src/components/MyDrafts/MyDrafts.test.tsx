import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import MyDrafts from './MyDrafts'
import MyPoems from '../MyPoems/MyPoems'
import { AppContext } from '../../App'
import { makePoem } from '../../test-utils/fixtures'
import {
    MY_DRAFTS_EMPTY,
    PUBLISH_POEM,
    UNPUBLISH_POEM,
    DRAFT_BADGE
} from '../../data/constants'

jest.mock('../../utils/notifications')
jest.mock('../../hooks/useInfiniteScroll', () => ({
    useInfiniteScroll: jest.fn(() => ({ current: null }))
}))

const mockSavePoemAction = jest.fn((_args: any) => ({ type: 'SAVE_POEM' }))
jest.mock('../../redux/actions/poemActions', () => ({
    ...jest.requireActual('../../redux/actions/poemActions'),
    savePoemAction: (args: any) => mockSavePoemAction(args)
}))
jest.mock('../../redux/actions/poemsActions', () => ({
    ...jest.requireActual('../../redux/actions/poemsActions'),
    getMyDraftsAction: jest.fn(() => ({ type: 'GET_MY_DRAFTS' })),
    getMyPoemsAction: jest.fn(() => ({ type: 'GET_MY_POEMS' }))
}))

const mockStore = configureStore([])

const context = {
    user: 'token',
    userId: '6a076c7d0472cf659e70e866',
    username: 'testuser',
    picture: '',
    isAdmin: false,
    setState: jest.fn(),
    config: { headers: { Authorization: 'Bearer token' } }
}

// makePoem keeps id and slug deliberately different, so a component that
// addressed the entity store by the URL slug would find nothing.
const draft = makePoem({
    id: '69f0cb2d9496d1ecf2660f6c',
    slug: 'unfinished-aubade-mordecai',
    title: 'Unfinished Aubade',
    status: 'draft',
    userId: context.userId
})

const published = makePoem({
    id: '71a1cb2d9496d1ecf2660f7d',
    slug: 'second-song-mordecai',
    title: 'Second Song',
    status: 'published',
    userId: context.userId
})

function renderList(Component: React.ComponentType, queryKey: string, poems: any[]) {
    const state = {
        myDraftsQuery: { item: [], isFetching: false, hasMore: false, page: 1, total: 0 },
        myPoemsQuery: { item: [], isFetching: false, hasMore: false, page: 1, total: 0 },
        poemEntities: {
            ids: poems.map(p => p.id),
            entities: Object.fromEntries(poems.map(p => [p.id, p]))
        },
        authorEntities: { ids: [], entities: {} }
    } as any
    state[queryKey] = {
        item: poems.map(p => p.id),
        isFetching: false,
        hasMore: false,
        page: 1,
        total: poems.length
    }

    return render(
        <Provider store={mockStore(state)}>
            <AppContext.Provider value={context as never}>
                <Component />
            </AppContext.Provider>
        </Provider>
    )
}

describe('Drafts tab', () => {
    beforeEach(() => jest.clearAllMocks())

    test('says what would fill it when the poet has no drafts', () => {
        renderList(MyDrafts, 'myDraftsQuery', [])
        expect(screen.getByText(MY_DRAFTS_EMPTY)).toBeInTheDocument()
    })

    test('marks a draft as a draft and offers to publish it', () => {
        renderList(MyDrafts, 'myDraftsQuery', [draft])

        expect(screen.getByText('Unfinished Aubade')).toBeInTheDocument()
        expect(screen.getByText(DRAFT_BADGE)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: PUBLISH_POEM })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: UNPUBLISH_POEM })).not.toBeInTheDocument()
    })

    // Publish is the primary action of this tab; withdrawing is its rare undo.
    // They shared one quiet style, so the thing a poet came here to do carried
    // the same visual weight as its reversal. Asserting on the class rather
    // than on computed styles because jsdom does not load the SCSS — the class
    // IS the contract between component and stylesheet, and a rename on either
    // side breaks it silently otherwise.
    test('the publish button is styled as the primary action', () => {
        renderList(MyDrafts, 'myDraftsQuery', [draft])

        expect(screen.getByRole('button', { name: PUBLISH_POEM }))
            .toHaveClass('owner-poem__status-button--publish')
    })

    test('publishing PATCHes status=published for that poem', async () => {
        const user = userEvent.setup()
        renderList(MyDrafts, 'myDraftsQuery', [draft])

        await user.click(screen.getByRole('button', { name: PUBLISH_POEM }))

        expect(mockSavePoemAction).toHaveBeenCalledTimes(1)
        const args = mockSavePoemAction.mock.calls[0][0]
        expect(args.data).toEqual({ status: 'published' })
        // Addressed by id, not by the slug in the URL.
        expect(args.params.poemId).toBe(draft.id)
    })
})

describe('My poems tab — the way back to drafts', () => {
    beforeEach(() => jest.clearAllMocks())

    test('a published poem offers to be withdrawn, and carries no draft badge', () => {
        renderList(MyPoems, 'myPoemsQuery', [published])

        expect(screen.getByRole('button', { name: UNPUBLISH_POEM })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: PUBLISH_POEM })).not.toBeInTheDocument()
        expect(screen.queryByText(DRAFT_BADGE)).not.toBeInTheDocument()
    })

    test('withdrawing stays the quiet action, not a second primary button', () => {
        // The distractor half of the pair above: a modifier applied to both
        // buttons would pass that test and lose the whole distinction.
        renderList(MyPoems, 'myPoemsQuery', [published])

        expect(screen.getByRole('button', { name: UNPUBLISH_POEM }))
            .not.toHaveClass('owner-poem__status-button--publish')
    })

    test('a poem with NO status is treated as published, like the ~16k that predate the field', () => {
        const legacy = makePoem({ id: '82b2cb2d9496d1ecf2660f8e', slug: 'legacy-elegy', userId: context.userId })
        delete (legacy as any).status

        renderList(MyPoems, 'myPoemsQuery', [legacy])

        expect(screen.getByRole('button', { name: UNPUBLISH_POEM })).toBeInTheDocument()
        expect(screen.queryByText(DRAFT_BADGE)).not.toBeInTheDocument()
    })

    test('withdrawing PATCHes status=draft', async () => {
        const user = userEvent.setup()
        renderList(MyPoems, 'myPoemsQuery', [published])

        await user.click(screen.getByRole('button', { name: UNPUBLISH_POEM }))

        const args = mockSavePoemAction.mock.calls[0][0]
        expect(args.data).toEqual({ status: 'draft' })
        expect(args.params.poemId).toBe(published.id)
    })
})
