import React from 'react'
import { render, screen } from '@testing-library/react'
import AuthorsIndex from '../components/Authors/AuthorsIndex'
import { Author } from '../typescript/interfaces'
import {
    buildAuthorsHref,
    parseLetterParam,
    parseOriginParam
} from '../utils/authorsIndex'

/**
 * The author index's letters are URLs.
 *
 * They used to be 26 `<button onClick>` handlers over client state, so there was
 * no URL anywhere on the site for "authors starting with B" — the page
 * server-rendered letter A, and the other 25 letters (3,100-odd of the 3,364
 * author pages) existed only after a click no crawler performs. `?letter=` was
 * accepted by nobody either: `getServerSideProps` hardcoded `letter: 'A'`, so
 * `/authors?letter=B` returned the A list.
 */
describe('parseLetterParam', () => {
    test('a single uppercase letter is used as-is', () => {
        expect(parseLetterParam('B')).toEqual({ kind: 'ok', letter: 'B' })
        expect(parseLetterParam('Z')).toEqual({ kind: 'ok', letter: 'Z' })
    })

    test('A redirects — the clean /authors URL is letter A', () => {
        expect(parseLetterParam('A')).toEqual({ kind: 'redirect' })
    })

    test('lowercase REDIRECTS rather than being uppercased in place', () => {
        // Silently uppercasing leaves ?letter=b and ?letter=B both answering
        // 200 with the same authors — the duplication /LOVE → /love exists to
        // prevent.
        expect(parseLetterParam('b')).toEqual({ kind: 'redirect' })
    })

    test.each(['', 'AB', '1', 'Ñ', '%', ' B', undefined, null, ['B']])(
        'junk (%p) redirects',
        value => {
            expect(parseLetterParam(value)).toEqual({ kind: 'redirect' })
        }
    )
})

describe('parseOriginParam', () => {
    test('the four known filters pass through', () => {
        expect(parseOriginParam('famous')).toBe('famous')
        expect(parseOriginParam('user')).toBe('user')
        expect(parseOriginParam('ai')).toBe('ai')
        expect(parseOriginParam('all')).toBe('all')
    })

    test('anything else falls back to all — it only filters, so it cannot 404', () => {
        expect(parseOriginParam('nonsense')).toBe('all')
        expect(parseOriginParam(undefined)).toBe('all')
    })
})

describe('buildAuthorsHref', () => {
    test('both defaults are omitted, so one view has one address', () => {
        expect(buildAuthorsHref('A')).toBe('/authors')
        expect(buildAuthorsHref('A', 'all')).toBe('/authors')
    })

    test('a letter beyond A carries the param', () => {
        expect(buildAuthorsHref('B')).toBe('/authors?letter=B')
    })

    test('a filter carries too, and composes with the letter', () => {
        expect(buildAuthorsHref('A', 'famous')).toBe('/authors?origin=famous')
        expect(buildAuthorsHref('M', 'ai')).toBe('/authors?letter=M&origin=ai')
    })
})

describe('<AuthorsIndex> — letters are links', () => {
    const authors = [
        { slug: 'ada-brine', name: 'Ada Brine', count: 4 }
    ] as unknown as Author[]

    const setup = (props = {}) => render(
        <AuthorsIndex initialAuthors={authors} initialLetters={['A', 'B', 'M']} {...props} />
    )

    test('every letter that has authors is a real link with an href', () => {
        setup()

        expect(screen.getByRole('link', { name: 'B' })).toHaveAttribute('href', '/authors?letter=B')
        expect(screen.getByRole('link', { name: 'M' })).toHaveAttribute('href', '/authors?letter=M')
    })

    test('letter A links to the clean URL, never to ?letter=A', () => {
        setup({ letter: 'B' })

        expect(screen.getByRole('link', { name: 'A' })).toHaveAttribute('href', '/authors')
    })

    test('a letter with no authors is NOT a link', () => {
        // It would render a heading over nothing — the soft-404 shape the empty
        // genres were fixed for. The route 404s it; this stops us linking there.
        setup()

        expect(screen.queryByRole('link', { name: 'Q' })).not.toBeInTheDocument()
        expect(screen.getByText('Q')).toHaveAttribute('aria-disabled', 'true')
    })

    test('the current letter is marked, and is still a link', () => {
        // Unlike pagination's current page, a letter stays a link: it is a
        // filter control, and a dead letter reads as broken.
        setup({ letter: 'B' })

        expect(screen.getByRole('link', { name: 'B' })).toHaveAttribute('aria-current', 'true')
    })

    test('the origin filter is links too, and keeps you on letter A', () => {
        // The letters holding authors differ per filter, so carrying the letter
        // across can land on one this filter has emptied.
        setup({ letter: 'M' })

        expect(screen.getByRole('link', { name: 'Famous' })).toHaveAttribute('href', '/authors?origin=famous')
    })

    test('a filter is carried onto every letter link', () => {
        setup({ origin: 'famous' })

        expect(screen.getByRole('link', { name: 'B' }))
            .toHaveAttribute('href', '/authors?letter=B&origin=famous')
    })

    test('renders no letter links at all when nothing has authors', () => {
        // The distractor for a component that links all 26 unconditionally.
        setup({ initialLetters: [] })

        expect(screen.queryByRole('link', { name: 'B' })).not.toBeInTheDocument()
    })
})
