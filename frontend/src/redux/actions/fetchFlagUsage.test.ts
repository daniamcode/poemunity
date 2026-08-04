import fs from 'fs'
import path from 'path'

/**
 * `fetch: false` MUST ALWAYS BE PAIRED WITH `reset: true`.
 *
 * This is a source-level guard for a bug that reached production and cost a
 * whole feature: `markNotificationsReadAction` passed `options: { fetch: false }`
 * to `postAction`, meaning "make the request but keep the response out of the
 * reducer". That is not what it does — `fetch: false` skips the entire
 * `if (options.fetch)` block, the axios call included, so the request was never
 * sent at all. Every notification stayed unread and the badge never cleared.
 *
 * The flag has exactly ONE legitimate meaning: "reset this cache WITHOUT
 * fetching", which is why all four correct call sites in the app write
 * `{ reset: true, fetch: false }`. Alone, it means "do nothing", and nobody
 * dispatches a thunk to do nothing — so a bare `fetch: false` is always a
 * mistake, and on a POST or PATCH it is a mutation that silently never happens.
 *
 * Guarded HERE rather than by a test per action, because the mistake is
 * available to every action file and reads as plausible in all of them. It is
 * a blunt instrument — it greps text — but the invariant it encodes is exact,
 * and the failure it prevents is invisible at every other level: the thunk
 * dispatches, the component renders, the suite stays green, and the server is
 * never told.
 */

const ACTIONS_DIR = path.join(__dirname)

/** Object literals on one line, which is how these options are written. */
const OPTIONS_LITERAL = /\{[^{}]*\bfetch:\s*false[^{}]*\}/g

/**
 * Comments are stripped before scanning. Not a nicety: the docblock explaining
 * this very bug QUOTES `options: { fetch: false }`, and the guard flagged it on
 * its first run. A guard that trips on prose about itself gets deleted.
 */
function withoutComments(source: string): string {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/.*$/gm, '$1')
}

function sourceFiles(): string[] {
    return fs
        .readdirSync(ACTIONS_DIR)
        .filter(name => /\.(ts|tsx|js)$/.test(name))
        .filter(name => !name.includes('.test.'))
        .map(name => path.join(ACTIONS_DIR, name))
}

describe('the `fetch: false` option', () => {
    test('is never used without `reset: true`', () => {
        const offenders: string[] = []

        for (const file of sourceFiles()) {
            const source = withoutComments(fs.readFileSync(file, 'utf8'))
            for (const literal of source.match(OPTIONS_LITERAL) || []) {
                if (!/\breset:\s*true/.test(literal)) {
                    offenders.push(`${path.basename(file)}: ${literal.trim()}`)
                }
            }
        }

        expect(offenders).toEqual([])
    })

    test('the pattern actually matches the shape it is guarding', () => {
        // Without this, a regex that matched nothing would report a clean pass
        // forever — the same failure mode as a model missing from
        // check-index-drift.js's MODELS list on the backend.
        const bad = '{ fetch: false }'
        const good = '{ reset: true, fetch: false }'

        expect(bad.match(OPTIONS_LITERAL)).toHaveLength(1)
        expect(good.match(OPTIONS_LITERAL)).toHaveLength(1)
        expect(/\breset:\s*true/.test(bad)).toBe(false)
        expect(/\breset:\s*true/.test(good)).toBe(true)
    })

    test('strips comments before scanning', () => {
        // Proven by the guard's own first run, which flagged the docblock in
        // notificationsActions.ts that quotes the broken call.
        const source = '/* options: { fetch: false } */\nconst a = 1'

        expect(withoutComments(source).match(OPTIONS_LITERAL)).toBeNull()
    })

    test('scans a non-empty set of files', () => {
        // The other half of the same worry: an empty directory listing, a
        // renamed folder or a filter that excludes everything would all print
        // as "no offenders".
        expect(sourceFiles().length).toBeGreaterThan(5)
    })
})
