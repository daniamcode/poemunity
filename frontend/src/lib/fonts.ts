import { EB_Garamond, Quattrocento, Great_Vibes } from 'next/font/google'

/**
 * The two typefaces the design has always specified — and, until now, never
 * actually delivered.
 *
 * `_variables.scss` named `'EB Garamond'` and `Quattrocento`, but nothing ever
 * loaded them: no `@font-face`, no `next/font`, no stylesheet link. Every
 * visitor without those families installed locally — i.e. essentially all of
 * them — silently got the generic `serif` fallback, which is Times on most
 * systems. Measured with a canvas: `"EB Garamond", serif`, `Quattrocento, serif`
 * and bare `serif` all rendered the same string at exactly the same width, while
 * `sans-serif` and `monospace` differed as expected.
 *
 * `next/font/google` downloads the files at BUILD time and serves them from our
 * own origin, so there is no request to Google at runtime (one less third party,
 * and no privacy footnote), and it reserves the right metrics up front via a
 * generated fallback face, so text does not reflow when the real font arrives.
 */

/** Body copy — poems, comments, UI text. An old-style Renaissance face. */
export const fontBody = EB_Garamond({
    subsets: ['latin'],
    // Italic is not decoration here: it is the voice of the tagline and of
    // quoted verse. Without listing it, the browser synthesises a slanted
    // version of the roman, which in a serif this delicate looks broken.
    style: ['normal', 'italic'],
    weight: ['400', '500', '600', '700'],
    display: 'swap',
    variable: '--font-body'
})

/** Headings. Quattrocento ships only 400 and 700 — do not ask for 500/600. */
export const fontHeading = Quattrocento({
    subsets: ['latin'],
    weight: ['400', '700'],
    display: 'swap',
    variable: '--font-heading'
})

/**
 * Display script — the header tagline only.
 *
 * A formal connected calligraphic face with the thick/thin contrast and swash
 * capitals of pointed-pen lettering. Great Vibes is the closest thing Google
 * Fonts carries to that style; the nearer alternatives are lighter and more
 * casual (Alex Brush, Parisienne, Sacramento) or thinner (Tangerine).
 *
 * Ships one weight (400) and no italic — asking for either makes the browser
 * synthesise it, which on a script this contrasty smears the thin strokes.
 *
 * Use it for ONE short phrase at a large size, never for body copy or anything
 * a reader must scan: connected scripts drop legibility sharply below ~24px,
 * and lowercase-heavy strings get hard to parse at any size.
 */
export const fontDisplay = Great_Vibes({
    subsets: ['latin'],
    weight: '400',
    display: 'swap',
    variable: '--font-display'
})
