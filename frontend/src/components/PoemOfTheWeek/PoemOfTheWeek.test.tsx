import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { PoemOfTheWeek } from './PoemOfTheWeek'
import * as poemsActions from '../../redux/actions/poemsActions'
import { Poem } from '../../typescript/interfaces'

jest.mock('../../redux/actions/poemsActions')

const mockStore = configureStore([thunk])

const POEM: Poem = {
    id: 'poem-1',
    slug: 'ozymandias-shelley',
    title: 'Ozymandias',
    author: 'Percy Bysshe Shelley',
    authorSlug: 'percy-bysshe-shelley',
    poem: 'I met a traveller\nfrom an antique land\nWho said\nTwo vast and trunkless legs\nof stone\nStand in the desert',
    genre: 'nature',
    likes: [],
    picture: '',
    userId: 'author-1',
    date: '2024-01-15T10:30:00.000Z'
}

function renderWith(item: unknown, meta: Record<string, unknown> = {}) {
    const store = mockStore({
        poemOfTheWeekQuery: { item, isFetching: false, isError: false, ...meta }
    })
    return { store, ...render(<Provider store={store}><PoemOfTheWeek /></Provider>) }
}

describe('PoemOfTheWeek', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(poemsActions.getPoemOfTheWeekAction as jest.Mock).mockReturnValue({ type: 'noop' })
    })

    describe('rendering', () => {
        test('shows the poem, its poet and the week it belongs to', () => {
            renderWith({ poem: POEM, weekStart: '2026-07-27' })

            expect(screen.getByRole('heading', { name: 'Poem of the week' })).toBeInTheDocument()
            expect(screen.getByRole('link', { name: 'Ozymandias' }))
                .toHaveAttribute('href', '/detail/ozymandias-shelley')
            expect(screen.getByText('Week of 27 Jul 2026')).toBeInTheDocument()
        })

        test('links the poet to their page', () => {
            renderWith({ poem: POEM })

            expect(screen.getByRole('link', { name: 'Percy Bysshe Shelley' }))
                .toHaveAttribute('href', '/authors/percy-bysshe-shelley')
        })

        // Four lines is enough to tempt a reader without reprinting the poem in
        // a sidebar. Each line is a separate element so it can wrap with a
        // hanging indent, so assert on the lines rather than on joined text —
        // reading textContent back would pass just as happily if they all
        // collapsed into one run.
        const linesOf = (container: HTMLElement) =>
            Array.from(container.querySelectorAll('.potw__line')).map(el => el.textContent)

        test('excerpts the opening lines only', () => {
            const { container } = renderWith({ poem: POEM })

            expect(linesOf(container)).toEqual([
                'I met a traveller',
                'from an antique land',
                'Who said',
                'Two vast and trunkless legs'
            ])
        })

        test('drops blank lines rather than spending the excerpt on them', () => {
            const { container } = renderWith({ poem: { ...POEM, poem: 'One\n\n\nTwo\n\nThree\nFour\nFive' } })

            expect(linesOf(container)).toEqual(['One', 'Two', 'Three', 'Four'])
        })
    })

    // A sidebar extra: a spinner or an error box in the corner of the page costs
    // more attention than the feature is worth.
    describe('renders nothing at all', () => {
        test('while loading', () => {
            const { container } = renderWith(undefined, { isFetching: true })

            expect(container).toBeEmptyDOMElement()
        })

        test('on error', () => {
            const { container } = renderWith(undefined, { isError: true })

            expect(container).toBeEmptyDOMElement()
        })

        test('when the server has no famous poem to offer', () => {
            const { container } = renderWith({ poem: null })

            expect(container).toBeEmptyDOMElement()
        })
    })

    describe('fetching', () => {
        test('asks for the poem when the cache is empty', () => {
            renderWith(undefined)

            expect(poemsActions.getPoemOfTheWeekAction).toHaveBeenCalled()
        })

        // The pick is the same all week, so refetching on every mount would be
        // pure waste — the dashboard remounts on every genre change.
        test('does not refetch when it is already cached', () => {
            renderWith({ poem: POEM })

            expect(poemsActions.getPoemOfTheWeekAction).not.toHaveBeenCalled()
        })

        test('does not retry in a loop after an error', () => {
            renderWith(undefined, { isError: true })

            expect(poemsActions.getPoemOfTheWeekAction).not.toHaveBeenCalled()
        })
    })
})
