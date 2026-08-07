import React from 'react'
import { render, screen } from '@testing-library/react'
import JoinPanel from './JoinPanel'
import { AppContext } from '../../App'
import { AI_DISCLOSURE_HREF } from '../../data/constants'
import {
    JOIN_TITLE,
    JOIN_ITEMS,
    JOIN_AI_LINK,
    JOIN_AI_LINK_LABEL,
    JOIN_CTA,
    JOIN_SIGNIN
} from '../../data/joinCopy'

const signedIn = { user: 'token', userId: 'me-1', username: 'me', config: {} }
const signedOut = { user: '', userId: '', username: '', config: {} }

const renderPanel = (context: any = signedOut) =>
    render(
        <AppContext.Provider value={context as never}>
            <JoinPanel />
        </AppContext.Provider>
    )

describe('JoinPanel', () => {
    test('renders nothing at all when signed in', () => {
        // A panel inviting you to register, shown on every page to somebody who
        // already did, reads as the site not knowing who you are.
        const { container } = renderPanel(signedIn)

        expect(container).toBeEmptyDOMElement()
    })

    test('shows the pitch when signed out', () => {
        renderPanel()

        expect(screen.getByText(JOIN_TITLE)).toBeInTheDocument()
    })

    test('lists every benefit', () => {
        renderPanel()

        const items = screen.getAllByRole('listitem').map(li => li.textContent)
        expect(items).toEqual(JOIN_ITEMS)
    })

    test('stays SHORT — it is a note in a navigation column, not a landing page', () => {
        // The first version had nine bulleted lines and ran longer than the
        // category list above it. This is the guard against it creeping back.
        renderPanel()

        expect(screen.getAllByRole('listitem')).toHaveLength(4)
        expect(JOIN_ITEMS.every(item => item.length <= 45)).toBe(true)
    })

    test('sends you to register, and offers log in for people who have an account', () => {
        renderPanel()

        expect(screen.getByRole('link', { name: JOIN_CTA })).toHaveAttribute('href', '/register')
        expect(screen.getByRole('link', { name: JOIN_SIGNIN })).toHaveAttribute('href', '/login')
    })

    test('is a labelled region, not an anonymous div', () => {
        // It sits after two navigation accordions; a screen reader user moving
        // by region needs to know what it is.
        renderPanel()

        expect(screen.getByRole('region', { name: JOIN_TITLE })).toBeInTheDocument()
    })

    test('promises only things that actually need an account', () => {
        // A draft listed "Browse by category, or by author from A to Z" — free
        // to everyone, and contradicted by the intro one line above it.
        // Promising what the reader already has invites them to discount the
        // rest of the list.
        renderPanel()

        expect(JOIN_ITEMS.join(' ')).not.toMatch(/\bbrowse\b|\bread\b|\bsearch\b|\bdiscover\b/i)
    })

    test('the copy says what you GET, not what the site has', () => {
        // The whole reason this is not a feature list. Guards against a later
        // edit turning it back into one.
        renderPanel()

        expect(JOIN_ITEMS.join(' ')).toMatch(/Follow poets/)
        expect(JOIN_ITEMS.join(' ')).not.toMatch(/system|feature|module/i)
    })

    describe('the AI poets', () => {
        test('are mentioned, and link to the full explanation', () => {
            // Signed-out visitors are exactly the people who have not seen the
            // footer or a per-poem badge yet.
            renderPanel()

            // Addressed by its ACCESSIBLE name, which spells the destination
            // out — "More" alone said nothing in a list of links. The visible
            // word stays, and must remain inside the accessible name or voice
            // control loses the target (WCAG 2.5.3, Label in Name).
            const link = screen.getByRole('link', { name: JOIN_AI_LINK_LABEL })

            expect(link).toHaveAttribute('href', AI_DISCLOSURE_HREF)
            expect(link).toHaveTextContent(JOIN_AI_LINK)
            expect(JOIN_AI_LINK_LABEL).toContain(JOIN_AI_LINK)
        })

        test('ALWAYS say the accounts are badged, however the pitch is worded', () => {
            // The non-negotiable half. Presenting the AI poets as a draw is a
            // product decision; leaving out "you always know who you are
            // reading" would turn an open experiment into a trick. A reader who
            // cannot tell which accounts are AI cannot enjoy it, only be fooled
            // by it. Rewrite the copy freely — this assertion stays.
            renderPanel()

            const text = screen.getByText(/AI poets/).textContent || ''
            expect(text).toMatch(/badge/i)
        })

        test('claim nothing about other sites', () => {
            // An earlier draft was headed "Something you will not find
            // elsewhere" — a claim about every other poetry site, which nobody
            // here has checked and nobody could. Describe this site; leave the
            // rest of the internet out of it.
            renderPanel()

            const text = screen.getByText(/AI poets/).textContent || ''
            expect(text).not.toMatch(/elsewhere|other sites|only place|unique|no other/i)
        })

        test('are not listed as something an account unlocks', () => {
            // They are readable signed out too, so promising them as a benefit
            // of registering would be false.
            renderPanel()

            expect(JOIN_ITEMS.join(' ')).not.toMatch(/\bAI\b/)
        })

        test('sit outside the benefit list', () => {
            const { container } = renderPanel()

            const ai = container.querySelector('.join-panel__ai')
            expect(ai).not.toBeNull()
            expect(ai!.closest('.join-panel__list')).toBeNull()
        })
    })
})
