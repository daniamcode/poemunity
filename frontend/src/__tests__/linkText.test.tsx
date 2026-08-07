import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import ListItem from '../components/ListItem/ListItem'
import { rootReducer } from '../redux/reducers/rootReducer'
import { READ_MORE } from '../data/constants'
import { Context, Poem } from '../typescript/interfaces'

/**
 * LINKS SAY WHAT THEY LEAD TO.
 *
 * Lighthouse flagged eleven links on the homepage whose text was "Read more" or
 * "More". The count is misleading: those components render on every list page —
 * home, 132 genres, every paginated page of each, author pages, profile tabs —
 * so it was thousands of instances, ten per page.
 *
 * The defect is worse than the audit shows. A screen reader listing the links
 * on a page announced ten identical "Read more" and ten identical "View
 * comments" with nothing to tell them apart. The comments links were NOT
 * flagged, because an `aria-label` counts as descriptive text and the audit
 * passes — same defect, invisible to the tool.
 *
 * Two rules, and the second is the one that is easy to break by "fixing" the
 * first:
 *
 *   THE VISIBLE TEXT STAYS. "Read more" sits directly under its poem, where
 *   repeating the title would be noise for everyone who can see the card.
 *
 *   THE ACCESSIBLE NAME MUST CONTAIN THE VISIBLE TEXT (WCAG 2.5.3, Label in
 *   Name). Replacing the name with the bare title breaks voice control: saying
 *   "click Read more" would no longer match anything.
 */
const poem = (id: string, title: string, slug: string): Poem => ({
    id,
    title,
    slug,
    author: 'Ada Brine',
    userId: 'a1',
    authorSlug: 'ada-brine',
    poem: 'Some lines of verse.',
    genre: 'love',
    likes: [],
    picture: '',
    date: '2026-01-01T00:00:00.000Z'
}) as unknown as Poem

const context = { user: null, userId: null, isAdmin: false } as unknown as Context

const renderList = (poems: Poem[], ctx: Context = context) => render(
    <Provider store={configureStore({ reducer: rootReducer })}>
        {poems.map(p => <ListItem key={p.id} poem={p} context={ctx} />)}
    </Provider>
)

describe('poem card links name their poem', () => {
    test('"Read more" keeps its visible text', () => {
        renderList([poem('p1', 'Aubade', 'aubade-ada')])

        expect(screen.getByText(READ_MORE)).toBeInTheDocument()
    })

    test('...but its accessible name says WHICH poem', () => {
        renderList([poem('p1', 'Aubade', 'aubade-ada')])

        expect(screen.getByRole('link', { name: `${READ_MORE} of “Aubade”` }))
            .toHaveAttribute('href', '/detail/aubade-ada')
    })

    test('the accessible name CONTAINS the visible text', () => {
        // WCAG 2.5.3. A "fix" that set aria-label to the bare title would pass a
        // naive "is it unique" test and break voice control.
        renderList([poem('p1', 'Aubade', 'aubade-ada')])
        const link = screen.getByRole('link', { name: new RegExp(READ_MORE) })

        expect(link.getAttribute('aria-label')).toContain(READ_MORE)
        expect(link).toHaveTextContent(READ_MORE)
    })

    test('the comments link names the poem too, though Lighthouse never flagged it', () => {
        renderList([poem('p1', 'Aubade', 'aubade-ada')])

        expect(screen.getByRole('link', { name: 'View comments — “Aubade”' }))
            .toHaveAttribute('href', '/detail/aubade-ada#comments')
    })

    test('TEN CARDS PRODUCE TEN DISTINCT LINK NAMES', () => {
        // The real test, and the one a single-card fixture cannot make: the
        // failure was never one bad link, it was ten identical ones on a page.
        const poems = Array.from({ length: 10 }, (_, i) =>
            poem(`p${i}`, `Poem ${i}`, `poem-${i}-ada`))
        renderList(poems)

        const names = screen.getAllByRole('link')
            .map(link => link.getAttribute('aria-label') || link.textContent || '')
            .filter(name => name.includes(READ_MORE) || name.includes('View comments'))

        expect(names).toHaveLength(20)
        expect(new Set(names).size).toBe(20)
    })

    test('the owner-only actions name the poem as well', () => {
        const owner = { user: 'ada', userId: 'a1', isAdmin: false } as unknown as Context
        renderList([poem('p1', 'Aubade', 'aubade-ada')], owner)

        expect(screen.getByRole('button', { name: 'Edit poem — “Aubade”' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Delete poem — “Aubade”' })).toBeInTheDocument()
    })

    test('a poem with no title falls back to the plain label, never to "of undefined"', () => {
        const untitled = { ...poem('p1', '', 'untitled-ada'), title: undefined } as unknown as Poem
        renderList([untitled])

        expect(screen.getByRole('link', { name: READ_MORE })).toBeInTheDocument()
        expect(screen.queryByText(/undefined/)).not.toBeInTheDocument()
    })
})
