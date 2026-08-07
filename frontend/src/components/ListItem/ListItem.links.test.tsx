import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import ListItem from './ListItem'
import { Poem, Context } from '../../typescript/interfaces'

jest.mock('../../hooks/usePoemActions', () => ({
    usePoemActions: () => ({ onDelete: jest.fn(), onLike: jest.fn(), onEdit: jest.fn() })
}))

const mockStore = configureStore([thunk])

const context: Context = {
    user: 'user-token',
    userId: 'user-456',
    username: 'testuser',
    picture: 'avatar.jpg',
    isAdmin: false,
    setState: jest.fn(),
    config: { headers: { Authorization: 'Bearer token' } }
}

const basePoem: Poem = {
    id: '69f0cb159496d1ecf265e307',
    slug: 'the-moon-and-the-sun-moon14',
    title: 'The moon and the sun',
    author: 'Moon14',
    poem: 'I miss you like the moon misses the sun',
    genre: 'love',
    likes: [],
    userId: 'user-999',
    picture: '',
    date: '2024-01-15T10:30:00.000Z'
}

function renderItem(poem: Poem) {
    const store = mockStore({ authorEntities: { entities: {}, ids: [] } })
    return render(
        <Provider store={store}>
            <ListItem poem={poem} context={context} />
        </Provider>
    )
}

const hrefs = () =>
    Array.from(document.querySelectorAll('a[href^="/detail/"]')).map(a => a.getAttribute('href'))

// Every link out of a card has to address the poem the same way. Only the title
// link preferred the slug, so "Read more" and the comments icon pointed at
// /detail/<objectid> — a second, uglier URL for a poem the sitemap and the
// canonical both advertise under its slug.
describe('ListItem — poem links', () => {
    test('every link to the poem uses the slug', () => {
        renderItem(basePoem)

        const links = hrefs()
        expect(links.length).toBeGreaterThanOrEqual(3)
        links.forEach(href => {
            expect(href).toContain('/detail/the-moon-and-the-sun-moon14')
            expect(href).not.toContain('69f0cb159496d1ecf265e307')
        })
    })

    test('the comments icon deep-links to the comments, still by slug', () => {
        renderItem(basePoem)

        // The name carries the poem title now — ten cards on a page used to
        // give ten identical "View comments" links. See linkText.test.tsx.
        expect(screen.getByRole('link', { name: /^View comments/ }))
            .toHaveAttribute('href', '/detail/the-moon-and-the-sun-moon14#comments')
    })

    test('the title and "Read more" both use the slug', () => {
        renderItem(basePoem)

        expect(screen.getByRole('link', { name: 'The moon and the sun' }))
            .toHaveAttribute('href', '/detail/the-moon-and-the-sun-moon14')
        expect(screen.getByRole('link', { name: /read more/i }))
            .toHaveAttribute('href', '/detail/the-moon-and-the-sun-moon14')
    })

    // Older poems predate slugs, so the id has to keep working.
    test('falls back to the id when the poem has no slug', () => {
        renderItem({ ...basePoem, slug: undefined })

        hrefs().forEach(href => {
            expect(href).toContain('/detail/69f0cb159496d1ecf265e307')
        })
    })
})
