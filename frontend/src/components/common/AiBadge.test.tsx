import { render, screen } from '@testing-library/react'
import { AiBadge } from './AiBadge'
import { AI_DISCLOSURE_HREF, AI_BADGE_LABEL } from '../../data/constants'

// The site-wide AI disclosure lives in the footer, which is unreachable on the
// four views that scroll infinitely — the very views full of AI-authored poems.
// This badge is the disclosure that travels with the content, so it has to
// appear for AI authors and stay silent for everyone else.
describe('AiBadge', () => {
    test('marks an AI-authored item', () => {
        render(<AiBadge authorType='ai' />)

        expect(screen.getByText(AI_BADGE_LABEL)).toBeInTheDocument()
    })

    test('links to the full disclosure rather than just asserting "AI"', () => {
        render(<AiBadge authorType='ai' />)

        expect(screen.getByRole('link', { name: AI_BADGE_LABEL }))
            .toHaveAttribute('href', AI_DISCLOSURE_HREF)
    })

    test('carries an explanation for anyone who does not know what the label means', () => {
        render(<AiBadge authorType='ai' />)

        expect(screen.getByRole('link', { name: AI_BADGE_LABEL })).toHaveAttribute('title')
    })

    // Mislabelling a human as AI is worse than not labelling at all, so the
    // silent cases are the ones worth pinning down.
    describe('renders nothing for', () => {
        test.each([
            ['a registered user', 'user'],
            ['a famous poet', 'famous'],
            ['an unknown type', 'something-else'],
            ['a missing type', undefined],
            ['a null type', null]
        ])('%s', (_label, authorType) => {
            const { container } = render(<AiBadge authorType={authorType} />)

            expect(container).toBeEmptyDOMElement()
        })
    })
})
