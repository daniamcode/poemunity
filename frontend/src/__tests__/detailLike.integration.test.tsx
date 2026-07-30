import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import mockRouter from 'next-router-mock'
import Detail from '../components/Detail/Detail'
import { rootReducer } from '../redux/reducers/rootReducer'
import { makePoem } from '../test-utils/fixtures'
import API from '../redux/actions/axiosInstance'

/**
 * Liking a poem, end to end inside the app: real hooks, real thunks, real
 * reducers, real components. ONLY the network is mocked.
 *
 * This is the seam the unit tests could not cover. Detail.test.tsx mocks
 * useDetailPoem outright, so the hook never ran there; the hook's own tests
 * addressed it by id. Between them, the one thing nobody exercised was the
 * actual path a reader takes — open /detail/<slug>, click the heart — which is
 * where the bug lived: the entity lookup used the URL parameter, missed the
 * store on every slug URL, and left the like invisible.
 */
jest.mock('../redux/actions/axiosInstance')
jest.mock('../components/Comments/CommentsSection', () => ({
    __esModule: true,
    COMMENTS_ANCHOR: 'comments',
    default: () => <div>comments</div>
}))
jest.mock('../App', () => {
    const context = {
        user: 'token', userId: 'reader-1', username: 'reader',
        isAdmin: false, setState: jest.fn(), config: {}
    }
    return { AppContext: React.createContext(context) }
})

const mockedAPI = API as jest.MockedFunction<typeof API>

const POEM = makePoem({ likes: [] })

function renderDetail() {
    const store = configureStore({ reducer: rootReducer })
    return {
        store,
        ...render(<Provider store={store}><Detail initialPoem={POEM} /></Provider>)
    }
}

describe('liking a poem from its detail page', () => {
    let put: jest.Mock

    beforeEach(() => {
        jest.clearAllMocks()
        // The reader arrives by SLUG, which is what every link on the site emits.
        mockRouter.setCurrentUrl({ pathname: '/detail/[poemId]', query: { poemId: POEM.slug } })

        put = jest.fn().mockResolvedValue({
            data: { ...POEM, likes: ['reader-1'], ranking: [] }
        })
        mockedAPI.mockReturnValue({
            get: jest.fn().mockResolvedValue({ data: POEM }),
            put,
            post: jest.fn(),
            delete: jest.fn()
        } as never)
    })

    test('the counter and the heart update after the request succeeds', async () => {
        renderDetail()

        expect(await screen.findByText('0 Likes')).toBeInTheDocument()

        await userEvent.click(await screen.findByTestId('unlike-icon'))

        // The whole point: the view must re-read the poem the like updated.
        expect(await screen.findByText('1 Like')).toBeInTheDocument()
        expect(screen.getByTestId('like-icon')).toBeInTheDocument()
    })

    test('the request goes to the poem id, not the slug in the URL', async () => {
        renderDetail()

        await userEvent.click(await screen.findByTestId('unlike-icon'))

        await waitFor(() => expect(put).toHaveBeenCalled())
        expect(put.mock.calls[0][0]).toContain(POEM.id)
        expect(put.mock.calls[0][0]).not.toContain(POEM.slug)
    })

    test('unliking takes the like back off', async () => {
        const liked = makePoem({ likes: ['reader-1'] })
        put.mockResolvedValue({ data: { ...liked, likes: [], ranking: [] } })
        // The GET has to agree with the starting state: it seeds the entity
        // store, and a stale answer would overwrite the poem under test.
        mockedAPI.mockReturnValue({
            get: jest.fn().mockResolvedValue({ data: liked }),
            put,
            post: jest.fn(),
            delete: jest.fn()
        } as never)
        const store = configureStore({ reducer: rootReducer })
        render(<Provider store={store}><Detail initialPoem={liked} /></Provider>)

        expect(await screen.findByText('1 Like')).toBeInTheDocument()

        await userEvent.click(await screen.findByTestId('like-icon'))

        expect(await screen.findByText('0 Likes')).toBeInTheDocument()
    })
})
