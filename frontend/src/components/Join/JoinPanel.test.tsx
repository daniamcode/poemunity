import React from 'react'
import { render, screen } from '@testing-library/react'
import JoinPanel from './JoinPanel'
import { AppContext } from '../../App'
import { AI_DISCLOSURE_HREF } from '../../data/constants'
import {
    JOIN_TITLE,
    JOIN_GROUPS,
    JOIN_AI_TITLE,
    JOIN_AI_LINK,
    JOIN_CTA,
    JOIN_SIGNIN
} from '../../data/joinCopy'

const ALL_ITEMS = JOIN_GROUPS.flatMap(g => g.items)

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

    test('lists every benefit, under its group heading', () => {
        // Pinned as a whole list so adding a feature to the site and forgetting
        // this panel is visible, rather than a silent omission.
        renderPanel()

        const items = screen.getAllByRole('listitem').map(li => li.textContent)
        expect(items).toEqual(ALL_ITEMS)

        for (const group of JOIN_GROUPS) {
            expect(screen.getByText(group.title)).toBeInTheDocument()
        }
    })

    test('names the three things that make it a community, not a library', () => {
        // Discovery, conversation, and publishing — in that order, because it
        // is the order a visitor moves through. A panel that led with
        // "publish your poems" would be selling to someone who has not yet
        // decided they like the place.
        renderPanel()

        expect(JOIN_GROUPS.map(g => g.title)).toEqual([
            'Find poets worth following',
            'Join the conversation',
            'Write and be read'
        ])
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

    test('the copy says what you GET, not what the site has', () => {
        // The whole reason this is not a feature list. Guards against a later
        // edit turning it back into one.
        renderPanel()

        expect(ALL_ITEMS.join(' ')).toMatch(/Follow anyone/)
        expect(ALL_ITEMS.join(' ')).not.toMatch(/system|feature|module/i)
    })

    describe('the AI poets', () => {
        test('are present, and link to the full explanation', () => {
            // Signed-out visitors are exactly the people who have not seen the
            // footer or a per-poem badge yet.
            renderPanel()

            expect(screen.getByText(JOIN_AI_TITLE)).toBeInTheDocument()
            expect(screen.getByRole('link', { name: JOIN_AI_LINK }))
                .toHaveAttribute('href', AI_DISCLOSURE_HREF)
        })

        test('ALWAYS say the accounts are badged, however the pitch is worded', () => {
            // The non-negotiable half. Presenting the AI poets as a draw is a
            // product decision; leaving out "you always know who you are
            // reading" would turn an open experiment into a trick. A reader who
            // cannot tell which accounts are AI cannot enjoy it, only be fooled
            // by it. Rewrite the copy freely — this assertion stays.
            renderPanel()

            const text = screen.getByText(/AI poets who write/).textContent || ''
            expect(text).toMatch(/badge/i)
        })

        test('are not listed as something an account unlocks', () => {
            // They are readable signed out too, so promising them as a benefit
            // of registering would be false.
            renderPanel()

            expect(ALL_ITEMS.join(' ')).not.toMatch(/\bAI\b/)
        })

        test('sits outside the benefit groups', () => {
            const { container } = renderPanel()

            const ai = container.querySelector('.join-panel__ai')
            expect(ai).not.toBeNull()
            expect(ai!.closest('.join-panel__group')).toBeNull()
        })
    })
})
