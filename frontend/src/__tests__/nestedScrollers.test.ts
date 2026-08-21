/**
 * @jest-environment node
 */
import path from 'path'
import * as sass from 'sass'

/**
 * ONE SCROLLBAR PER THING THAT SCROLLS.
 *
 * The dashboard showed FIVE at once — the page, the left rail, the Categories
 * accordion, the Authors accordion, and the right rail — for two columns of
 * about twenty links. The cause was `.accordion__list { max-height: 350px;
 * overflow-y: auto }` written unscoped in Header.scss: the header dropdown
 * genuinely needs it (it floats over the page from a fixed header and has no
 * container to bound it), and the dashboard sidebar reuses the same component
 * inside `.dashboard__accordion`, which is ALREADY a scroller for a documented
 * reason of its own.
 *
 * So the rule is not "no inner scrollers" — it is that a scroller must not be
 * nested inside another one. This compiles the real SCSS and asserts the cap
 * only ever applies inside the dropdown.
 *
 * Runs in the `node` environment, not jsdom: `sass` compiles through the real
 * filesystem and throws a NullError under jsdom's patched globals.
 *
 * WHY A STYLESHEET TEST AND NOT A RENDER TEST: jsdom computes no layout at all,
 * so `scrollHeight` is 0 everywhere and RTL cannot see this class of bug. The
 * count of five came from a real headless Chrome at 1728x950, and the fix was
 * verified the same way (three nested scrollers before, one after — the right
 * rail, which is deliberate). Neither of those runs happens in CI, which is why
 * the source of the bug is pinned here instead.
 */

const compile = (file: string) =>
    sass.compile(path.join(__dirname, '..', 'components', file), {
        loadPaths: [path.join(__dirname, '..')]
    }).css

/**
 * Selectors of every rule whose declarations make the element a Y scroller.
 *
 * `exec` in a loop rather than `matchAll`, which returns an empty iterator under
 * this jest setup and would report every stylesheet as having no scrollers at
 * all — a green suite that has looked at nothing.
 *
 * The body pattern is `[^{}]*`, so only INNERMOST blocks match: a media query is
 * also `selector { ... }`, and a body allowed to contain `{` swallows the first
 * rule inside it and desynchronises every match after.
 */
const scrollingSelectors = (css: string) => {
    const rule = /([^{}]+)\{([^{}]*)\}/g
    const found: string[] = []
    let match = rule.exec(css)
    while (match) {
        if (/overflow(-y)?:\s*(auto|scroll)/.test(match[2])) {
            found.push(match[1].trim().replace(/\s+/g, ' '))
        }
        match = rule.exec(css)
    }
    return found
}

describe('the accordion list does not nest a scroller inside a scrolling rail', () => {
    const css = compile('Header/Header.scss')

    test('the 350px cap exists, scoped to the header dropdown', () => {
        const scoped = scrollingSelectors(css).filter(s => s.includes('.accordion__list'))

        expect(scoped).toEqual(['.header__dropdown .accordion__list'])
    })

    test('no rule makes a bare .accordion__list scroll', () => {
        // The bare selector matches the DASHBOARD SIDEBAR too, which is what
        // put a scrollbar inside a scrollbar. A regression here reads as a
        // harmless tidy-up in the diff.
        const bare = scrollingSelectors(css).filter(s => /(^|,\s*)\.accordion__list\b/.test(s))

        expect(bare).toEqual([])
    })
})

describe('the dashboard rails are the scrollers they are meant to be', () => {
    const css = compile('Dashboard/Dashboard.scss')

    test('both rails scroll — a sticky rail taller than the viewport hides its own overflow', () => {
        const rails = scrollingSelectors(css)

        expect(rails).toContain('.dashboard__accordion')
        expect(rails).toContain('.dashboard__ranking')
    })

    test('neither rail scrolls sideways', () => {
        // `overflow-y: auto` alone computes overflow-x to `auto`, which drew a
        // horizontal bar across the column and clipped the text behind it.
        expect(css).toMatch(/\.dashboard__accordion\s*\{[^}]*overflow-x:\s*hidden/)
        expect(css).toMatch(/\.dashboard__ranking\s*\{[^}]*overflow-x:\s*hidden/)
    })
})
