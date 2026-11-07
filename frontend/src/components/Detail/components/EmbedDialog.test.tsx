import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmbedDialog } from './EmbedDialog'
import { Poem } from '../../../typescript/interfaces'

/**
 * Every fixture here is built so a WRONG implementation returns a DIFFERENT
 * answer — the habit AGENTS.md records after four tests passed against broken
 * code in a single day.
 *
 * The two that earn their place:
 *
 * - The **title contains quotation marks.** If the escaping is removed the
 *   pasted snippet ships broken HTML onto somebody else's site, and a fixture
 *   with a plain title would render byte-identically with or without it.
 * - The **two formats must not agree.** An implementation that returned the
 *   same string for both tabs would still satisfy "shows a snippet", so one
 *   test pins `/embed/` and a different one pins `/detail/`.
 */
const poem: Poem = {
    id: '69f0cb2d9496d1ecf2660f6c',
    slug: 'the-going',
    author: 'Thomas Hardy',
    date: '2024-01-15T10:30:00.000Z',
    genre: 'loss',
    likes: [],
    picture: '',
    poem: 'Rest there, rest, and see thy mother\'s face!',
    title: 'The Going',
    userId: 'user-456'
}

const onClose = jest.fn()
const snippetBox = () => screen.getByTestId('embed-snippet') as HTMLTextAreaElement

function openDialog(overrides: Partial<Poem> = {}) {
    return render(<EmbedDialog open poem={{ ...poem, ...overrides }} onClose={onClose} />)
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('EmbedDialog', () => {
    test('renders nothing at all while closed', () => {
        render(<EmbedDialog open={false} poem={poem} onClose={onClose} />)

        expect(screen.queryByTestId('embed-snippet')).not.toBeInTheDocument()
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    test('opens on the iframe format, pointed at this poem', () => {
        openDialog()

        const value = snippetBox().value
        expect(value).toContain('<iframe')
        expect(value).toContain('https://poemunity.com/embed/the-going')
        // The default must be the real embed, not the link dressed up as one.
        expect(value).toContain('loading="lazy"')
    })

    test('the Link tab produces something genuinely different — a bare URL', () => {
        openDialog()

        fireEvent.click(screen.getByRole('button', { name: 'Link' }))

        const value = snippetBox().value
        expect(value).toBe('https://poemunity.com/detail/the-going')
        // Not merely "different text": it must not still be an iframe, which is
        // what a mode switch that only swapped the label would produce.
        expect(value).not.toContain('<iframe')
        expect(value).not.toContain('/embed/')
    })

    test('falls back to the id when the poem carries no slug', () => {
        openDialog({ slug: undefined })

        expect(snippetBox().value).toContain(`https://poemunity.com/embed/${poem.id}`)
    })

    test('escapes quotation marks in the title — the snippet lands on somebody else\'s site', () => {
        // THE DISTRACTOR. Poems quote constantly. Without the replace, this
        // fixture's title terminates the attribute early and the pasted markup
        // ships an injected attribute; with a plain title both versions of the
        // code produce the same bytes and the bug is invisible to testing.
        openDialog({ title: 'She said "Go" softly' })

        const value = snippetBox().value
        expect(value).toContain('&quot;Go&quot;')
        expect(value).not.toContain('"Go"')
    })

    test('escape closes the dialog', () => {
        openDialog()

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        fireEvent.keyDown(window, { key: 'Escape' })

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('clicking the dimmer closes it, but clicking inside does not', () => {
        openDialog()

        const dialog = screen.getByRole('dialog')
        // Stops propagation from the panel, so this must NOT reach the overlay.
        fireEvent.click(screen.getByText('Share this poem'))
        expect(onClose).not.toHaveBeenCalled()

        fireEvent.click(dialog)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('Copy writes the exact snippet to the clipboard', async () => {
        const writeText = jest.fn().mockResolvedValue(undefined)
        Object.defineProperty(window.navigator, 'clipboard', {
            value: { writeText },
            configurable: true
        })
        openDialog()

        fireEvent.click(screen.getByTestId('embed-copy'))

        await screen.findByRole('button', { name: 'Copied' })
        expect(writeText).toHaveBeenCalledWith(snippetBox().value)
    })
})
