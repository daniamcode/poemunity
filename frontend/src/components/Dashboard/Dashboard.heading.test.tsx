import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import Dashboard from './Dashboard'
import store from '../../redux/store'

jest.mock('../SimpleAccordion', () => function MockAccordion() { return <div /> })
jest.mock('../AuthorsAccordion', () => function MockAuthors() { return <div /> })
jest.mock('../Ranking/Ranking', () => function MockRanking() { return <div /> })
jest.mock('../PoemOfTheWeek/PoemOfTheWeek', () => function MockPoemOfTheWeek() { return <div /> })
jest.mock('../List/List', () => function MockList() { return <div /> })

jest.mock('next/router', () => ({
    useRouter: () => ({ query: {}, pathname: '/', push: jest.fn(), isReady: true })
}))

/**
 * The homepage `<h1>` was the single word "Poems".
 *
 * It is `sr-only` there by design — the front door already carries the brand,
 * so a second visible title is noise — but hidden is not absent: it is still
 * the page's top-level heading for search engines and for anyone navigating by
 * headings, and "Poems" says nothing about what this site is while the
 * `<title>` ("Your poem community") was carrying the whole message alone.
 */
describe('the homepage heading', () => {
    const renderHome = () =>
        render(
            <Provider store={store}>
                <Dashboard />
            </Provider>
        )

    test('names what the site is, not just its content type', () => {
        renderHome()

        const h1 = screen.getByRole('heading', { level: 1 })
        expect(h1).toHaveTextContent(/poem community/i)
        expect(h1.textContent).not.toBe('Poems')
    })

    test('stays visually hidden — this is a wording change, not a layout one', () => {
        // The distractor for "fixing" it by making the heading visible: the
        // dashboard deliberately hides it, and a visible one would duplicate
        // the brand sitting directly above it.
        renderHome()

        expect(screen.getByRole('heading', { level: 1 })).toHaveClass('sr-only')
    })

    test('a genre page still leads with its own count and genre', () => {
        // The distractor for a change that swapped the heading unconditionally:
        // /love must keep saying "Love poems", not the site tagline.
        render(
            <Provider store={store}>
                <Dashboard match={{ params: { genre: 'love' } }} />
            </Provider>
        )

        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Love poems/)
    })
})
