import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import ListItem from './ListItem'
import { Poem, Context } from '../../typescript/interfaces'
import * as usePoemActionsModule from '../../hooks/usePoemActions'

// Expose the resolved author fields (name, picture, slug) so we can assert
// which source of truth won: the normalized authorEntities store or the poem's
// own denormalized copy.
jest.mock('./components', () => ({
    PoemHeader: ({ author, picture, authorSlug }: any) => (
        <div data-testid='poem-header'>
            <span data-testid='author-name'>{author}</span>
            <span data-testid='author-picture'>{picture}</span>
            <span data-testid='author-slug'>{authorSlug}</span>
        </div>
    ),
    PoemContent: () => <div data-testid='poem-content' />,
    PoemFooter: () => <div data-testid='poem-footer' />
}))

jest.mock('../../hooks/usePoemActions')

const mockStore = configureStore([thunk])

// The poem carries STALE denormalized author fields (the pre-edit values).
const stalePoem: Poem = {
    id: 'poem-1',
    title: 'A Poem',
    author: 'Old Name',
    poem: 'content',
    genre: 'love',
    likes: [],
    userId: 'author-1',
    picture: 'old-picture.jpg',
    authorSlug: 'old-name',
    date: '2024-01-15T10:30:00.000Z'
}

const context: Context = {
    user: 'user-token',
    userId: 'viewer-1',
    username: 'viewer',
    picture: 'avatar.jpg',
    isAdmin: false,
    setState: jest.fn(),
    config: { headers: { Authorization: 'Bearer token' } }
}

beforeEach(() => {
    jest.clearAllMocks()
    ;(usePoemActionsModule.usePoemActions as jest.Mock).mockReturnValue({
        onDelete: jest.fn(),
        onLike: jest.fn(),
        onEdit: jest.fn()
    })
})

const renderWith = (state: any) =>
    render(
        <Provider store={mockStore(state)}>
            <ListItem poem={stalePoem} context={context} />
        </Provider>
    )

describe('ListItem author source of truth', () => {
    test('prefers the authorEntities store over the poem\'s stale copy', () => {
        renderWith({
            authorEntities: {
                ids: ['author-1'],
                entities: {
                    'author-1': { id: 'author-1', name: 'New Name', picture: 'new-picture.jpg', slug: 'new-name' }
                }
            }
        })

        expect(screen.getByTestId('author-name')).toHaveTextContent('New Name')
        expect(screen.getByTestId('author-picture')).toHaveTextContent('new-picture.jpg')
        expect(screen.getByTestId('author-slug')).toHaveTextContent('new-name')
        // The stale copy must NOT be shown once the store knows the author.
        expect(screen.queryByText('Old Name')).not.toBeInTheDocument()
    })

    test('falls back to the poem\'s copied fields when the author is not yet in the store', () => {
        renderWith({ authorEntities: { ids: [], entities: {} } })

        expect(screen.getByTestId('author-name')).toHaveTextContent('Old Name')
        expect(screen.getByTestId('author-picture')).toHaveTextContent('old-picture.jpg')
        expect(screen.getByTestId('author-slug')).toHaveTextContent('old-name')
    })

})
