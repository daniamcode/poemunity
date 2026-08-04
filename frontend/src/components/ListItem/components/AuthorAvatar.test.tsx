import { render, screen } from '@testing-library/react'
import { AuthorAvatar } from './AuthorAvatar'

/**
 * The avatar goes through `next/image` so a 550x412 portrait is not downloaded
 * whole to be drawn at 44x44.
 *
 * The reason this file exists is the cost of that change: `next/image` THROWS
 * on a src it cannot parse — a bare relative path like "pic.jpg", with no
 * leading slash — where the plain `<img>` it replaced simply resolved it
 * against the current URL. `picture` comes from the database and is whatever
 * was stored there over the years, so ONE malformed row would take down every
 * list the author appears in: the poem lists, the ranking, the follow tabs.
 *
 * That guard was written and then left untested, because the two fixtures that
 * exposed it were "fixed" into absolute URLs — which removed the only coverage
 * of the path. These tests put it back.
 */
describe('AuthorAvatar', () => {
    describe('sources next/image cannot parse', () => {
        // Each of these would throw if handed straight to next/image.
        const unusable = [
            ['a bare relative path', 'pic.jpg'],
            ['a nested relative path', 'user/pic.jpg'],
            ['a protocol-relative URL', '//example.com/pic.jpg'],
            ['a data URI', 'data:image/gif;base64,R0lGOD'],
            ['whitespace', '   ']
        ] as const

        test.each(unusable)('%s falls back to initials instead of throwing', (_label, src) => {
            expect(() => render(<AuthorAvatar name='Ada Brine' picture={src} />)).not.toThrow()

            expect(screen.queryByRole('img')).not.toBeInTheDocument()
            expect(screen.getByText('AB')).toBeInTheDocument()
        })
    })

    describe('sources it can', () => {
        test('an https URL is optimised, not fetched at full size', () => {
            render(<AuthorAvatar name='Ada Brine' picture='https://example.com/a.jpg' />)

            const src = screen.getByAltText('Ada Brine').getAttribute('src') || ''
            expect(src).toContain('/_next/image')
            expect(src).toContain(encodeURIComponent('https://example.com/a.jpg'))
            // The resize is the whole point of the change.
            expect(src).toMatch(/[?&]w=\d+/)
        })

        test('a root-relative path is fine', () => {
            // Distractor for the fallback tests above: "/pic.jpg" is legal and
            // must NOT be treated as unusable. A guard that rejected everything
            // would pass every test in that block.
            render(<AuthorAvatar name='Ada Brine' picture='/pic.jpg' />)

            expect(screen.getByAltText('Ada Brine')).toBeInTheDocument()
            expect(screen.queryByText('AB')).not.toBeInTheDocument()
        })

        test('an http URL is fine too', () => {
            render(<AuthorAvatar name='Ada Brine' picture='http://example.com/a.jpg' />)

            expect(screen.getByAltText('Ada Brine')).toBeInTheDocument()
        })
    })

    test('no picture at all shows initials', () => {
        render(<AuthorAvatar name='Ada Brine' picture='' />)

        expect(screen.getByText('AB')).toBeInTheDocument()
    })

    test('the avatar carries explicit dimensions, which is what stops it shifting', () => {
        // A raw <img> sized only in CSS has no intrinsic size until it loads,
        // so everything below it moves when it arrives — the classic source of
        // layout shift. next/image emits width and height attributes.
        render(<AuthorAvatar name='Ada Brine' picture='https://example.com/a.jpg' />)

        const img = screen.getByAltText('Ada Brine')
        expect(img).toHaveAttribute('width', '44')
        expect(img).toHaveAttribute('height', '44')
    })

    test('a smaller size is honoured, so poem-of-the-week does not over-fetch', () => {
        render(<AuthorAvatar name='Ada Brine' picture='https://example.com/a.jpg' size={28} />)

        expect(screen.getByAltText('Ada Brine')).toHaveAttribute('width', '28')
    })
})
