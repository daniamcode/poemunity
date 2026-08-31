/**
 * @jest-environment node
 */
import path from 'path'
import * as sass from 'sass'

/**
 * THE POETS RANKING MUST SHOW POETS' NAMES.
 *
 * It did not. The rail rendered "R.", "S...", "C..." — a ranking of eight people
 * identified by one letter each. Two causes, both about width:
 *
 *  1. The row was a FOUR-column single line (rank, avatar, name, points pill).
 *     Measured in a real browser at 1920: the row is 225px and chrome took 169
 *     of it, leaving the name 56px against the 79-113px the names needed.
 *  2. The rail is `width: 15%`, which is 265px at 1920 but 165px at $bp-xl —
 *     and 1280-1440 is where most people are. At 1200 the name column was 25px.
 *
 * So the fix is a pair, and either half alone leaves it broken: stack the points
 * UNDER the name (freeing the pill's column), and give the rail a min-width so
 * the percentage cannot collapse it. Names then WRAP rather than clip, which is
 * what stops the next longer name reopening this.
 *
 * WHY A STYLESHEET TEST. jsdom computes no layout — every width is 0 — so RTL
 * cannot see a truncated name, and this bug lived through a full green suite.
 * The measurements above come from headless Chrome and do not run in CI, so what
 * is pinned here is the SOURCE of the fix: the declarations that, if removed,
 * bring the bug straight back. Same reasoning as nestedScrollers.test.ts.
 *
 * Runs in `node`, not jsdom: `sass` throws a NullError under jsdom's globals.
 */

const compile = (file: string) =>
    sass.compile(path.join(__dirname, '..', 'components', file), {
        loadPaths: [path.join(__dirname, '..')]
    }).css

/**
 * Declarations of the innermost rule whose selector matches.
 *
 * The body pattern is `[^{}]*` so only innermost blocks match — a media query is
 * also `selector { ... }`, and a body allowed to contain `{` swallows the first
 * rule inside it and desynchronises every match after it.
 */
const rulesFor = (css: string, selector: string): string[] => {
    const rule = /([^{}]+)\{([^{}]*)\}/g
    const found: string[] = []
    let match = rule.exec(css)
    while (match) {
        const selectors = match[1].split(',').map(s => s.trim())
        if (selectors.some(s => s === selector || s.endsWith(` ${selector}`))) {
            found.push(match[2])
        }
        match = rule.exec(css)
    }
    return found
}

const declaration = (bodies: string[], prop: string): string | null => {
    for (const body of bodies) {
        const m = new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`).exec(body)
        if (m) return m[1].trim()
    }
    return null
}

describe('the ranking shows names, not initials', () => {
    const ranking = compile('Ranking/Ranking.scss')
    const dashboard = compile('Dashboard/Dashboard.scss')

    describe('the row stacks the points under the name', () => {
        const item = rulesFor(ranking, '.ranking__item')

        test('name and points sit on different grid rows', () => {
            const areas = declaration(item, 'grid-template-areas')
            expect(areas).toBeTruthy()
            // Two rows: the name on the first, the points on the second. On one
            // row they compete for the same 225px and the name loses.
            expect(areas).toMatch(/name/)
            expect(areas).toMatch(/points/)
            const rows = (areas as string).split('"').filter(s => s.trim().length > 1)
            expect(rows).toHaveLength(2)
            expect(rows[0]).toContain('name')
            expect(rows[0]).not.toContain('points')
            expect(rows[1]).toContain('points')
        })

        test('the rank and avatar span both rows, so they stay centred on the pair', () => {
            const areas = declaration(item, 'grid-template-areas') as string
            const rows = areas.split('"').filter(s => s.trim().length > 1)
            expect(rows[0]).toContain('rank')
            expect(rows[1]).toContain('rank')
            expect(rows[0]).toContain('avatar')
            expect(rows[1]).toContain('avatar')
        })

        test('the name column can shrink below its content', () => {
            // A bare `1fr` is `minmax(auto, 1fr)`, and that auto MINIMUM is the
            // full width of the name — so the grid widens and overflows the rail
            // instead of the name fitting inside it.
            expect(declaration(item, 'grid-template-columns')).toContain('minmax(0')
        })
    })

    describe('the name wraps instead of clipping', () => {
        const name = rulesFor(ranking, '.ranking__author-name')

        test('it is not held to a single line', () => {
            // `nowrap` is what turned "Catherine Cawley" into "C...". Wrapping
            // has no width threshold to re-cross, which is why it beats simply
            // widening the rail until today's longest name happens to fit.
            expect(declaration(name, 'white-space')).not.toBe('nowrap')
        })

        test('a single unbroken word still breaks rather than widening the rail', () => {
            expect(declaration(name, 'overflow-wrap')).toBe('anywhere')
        })

        test('and even then it is capped, so one long username cannot build a tower', () => {
            expect(declaration(name, '-webkit-line-clamp')).toBe('2')
            expect(declaration(name, 'overflow')).toBe('hidden')
        })
    })

    describe('the rail cannot collapse below a usable width', () => {
        const rail = rulesFor(dashboard, '.dashboard__ranking')
        const accordion = rulesFor(dashboard, '.dashboard__accordion')
        const list = rulesFor(dashboard, '.dashboard__list')

        test('the ranking rail has a floor', () => {
            // 15% is 265px at 1920 and 165px at $bp-xl. Without a floor the name
            // column is 25px there, whatever the row does.
            expect(declaration(rail, 'min-width')).toBe('230px')
        })

        test('BOTH rails carry the same floor, or the centre column is off-centre', () => {
            // Dashboard.scss's own invariant: the two rails must total the same,
            // or anything centred on the page disagrees with anything centred on
            // the column. A floor on one rail only breaks it at exactly the
            // widths where the floor applies.
            // Asserted as a VALUE as well as an equality: `null === null` is
            // true, so an equality alone passes when somebody deletes both.
            expect(declaration(accordion, 'min-width')).toBe('230px')
            expect(declaration(accordion, 'min-width')).toBe(declaration(rail, 'min-width'))
        })

        test('the list column can shrink to pay for the floor', () => {
            // The declared widths total 107%, so this layout has always relied on
            // flex shrinking the columns. A flex item's default `min-width: auto`
            // is content-based, so once the rails stop shrinking the overage has
            // nowhere to go: measured at 148px of horizontal page overflow at
            // 1200px before this line was added.
            expect(declaration(list, 'min-width')).toBe('0')
        })
    })
})
