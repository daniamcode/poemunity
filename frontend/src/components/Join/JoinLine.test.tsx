import React from 'react'
import { render, screen } from '@testing-library/react'
import JoinLine from './JoinLine'
import { AppContext } from '../../App'
import { JOIN_LINE_TEXT, JOIN_CTA } from '../../data/joinCopy'

const signedIn = { user: 'token', userId: 'me-1', username: 'me', config: {} }
const signedOut = { user: '', userId: '', username: '', config: {} }

const renderLine = (context: any = signedOut) =>
    render(
        <AppContext.Provider value={context as never}>
            <JoinLine />
        </AppContext.Provider>
    )

describe('JoinLine', () => {
    test('renders nothing when signed in', () => {
        const { container } = renderLine(signedIn)

        expect(container).toBeEmptyDOMElement()
    })

    test('gives a phone visitor the one thing the sidebar would have told them', () => {
        // The sidebar carrying JoinPanel is display:none below $bp-xl, and the
        // signed-out header offers only an unlabelled log-in icon — so without
        // this, a narrow screen is never told what an account is for.
        renderLine()

        expect(screen.getByText(JOIN_LINE_TEXT)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: JOIN_CTA })).toHaveAttribute('href', '/register')
    })

    test('is ONE line — it sits after a list somebody came to read', () => {
        renderLine()

        expect(JOIN_LINE_TEXT.length).toBeLessThanOrEqual(80)
        expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    })
})
