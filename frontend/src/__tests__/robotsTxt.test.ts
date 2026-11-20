import fs from 'fs'
import path from 'path'

/**
 * `public/robots.txt` — the AI crawler policy.
 *
 * This file is a live SEO control, and every way it can rot is SILENT. Nothing
 * else in the suite touches it: no page render, no SSR test, no sitemap fetch
 * reads robots.txt, so a regression here ships green.
 *
 * Three ways it breaks, each with a different blast radius:
 *
 * 1. Replacing the wildcard `Allow: /` with a blanket `Disallow: /` takes the
 *    ENTIRE site out of Google, Bing and every AI answer engine at once. The
 *    pages would still render, still test, still appear in the sitemap — and
 *    still never be crawled again.
 * 2. Giving a SEARCH crawler its own group makes that group's rules apply to it
 *    and the `*` group stop applying (RFC 9309). So adding
 *    `User-agent: Googlebot` above a `Disallow: /` is a deindexing dressed up
 *    as an innocuous addition — the most likely way somebody "tidies" this file.
 * 3. Dropping a training token quietly re-opens data the owner closed, with no
 *    visible symptom at all.
 *
 * So these tests parse the file into groups exactly the way a crawler does and
 * assert on the RESULTING PERMISSIONS, not on the presence of substrings. A raw
 * substring test cannot do the job and would give false confidence: `Googlebot`
 * occurs inside `Google-Extended`, `Applebot` inside `Applebot-Extended`, and
 * `Disallow: /` inside `Disallow: /profile`.
 *
 * Policy, decided 2026-11-20: block AI TRAINING crawlers, keep AI SEARCH
 * crawlers. Every vendor ships those as two separate user agents and documents
 * that the settings are independent — so this costs nothing in search or
 * AI-answer visibility, which is what makes it the safe direction to fail in.
 * See AGENTS.md, "AI crawler policy".
 */

const ROBOTS = fs.readFileSync(
    path.resolve(__dirname, '../../public/robots.txt'),
    'utf8'
)

type Group = { agents: string[]; rules: string[] }

/**
 * Split into RFC 9309 groups.
 *
 * The one rule that matters: a crawler obeys the group that NAMES its token and
 * only falls back to `User-agent: *` when no group names it. So "does this
 * token have its own group" — not "does this token appear in the file" — is the
 * question every assertion below is really asking.
 *
 * Consecutive user-agent lines are ONE group; a user-agent line that follows a
 * rule line starts the next. Getting that wrong merges every bot into a single
 * group and makes the file read as far more restrictive than it is.
 */
function parseGroups(text: string): Group[] {
    const groups: Group[] = []
    let current: Group | null = null

    for (const raw of text.split('\n')) {
        const line = raw.replace(/#.*$/, '').trim()
        if (!line) continue

        const colon = line.indexOf(':')
        if (colon === -1) continue

        const key = line.slice(0, colon).trim().toLowerCase()

        if (key === 'user-agent') {
            if (!current || current.rules.length > 0) {
                current = { agents: [], rules: [] }
                groups.push(current)
            }
            // robots.txt user-agent tokens match case-insensitively, so the
            // tests compare lowercased tokens and cannot be tripped by casing.
            current.agents.push(line.slice(colon + 1).trim().toLowerCase())
        } else if (current) {
            current.rules.push(line)
        }
    }

    return groups
}

const groups = parseGroups(ROBOTS)
const groupFor = (token: string): Group | undefined =>
    groups.find(g => g.agents.includes(token.toLowerCase()))

/**
 * Training crawlers. Blocking any of these removes content from model training
 * and removes NOTHING from any search surface — each vendor documents the
 * training and search agents as independent settings.
 */
const TRAINING_TOKENS = [
    'GPTBot', // OpenAI
    'ClaudeBot', // Anthropic
    'CCBot', // Common Crawl — feeds many models
    'Bytespider', // ByteDance
    'meta-externalagent', // Meta (meta-webindexer is the search one)
    'Amazonbot', // Amazon
    'MistralAI-Training', // Mistral (MistralAI-Index is the search one)
    'AI2Bot', // Allen Institute for AI
    'Diffbot', // Diffbot
    'Google-Extended', // Gemini training — a TOKEN, not a crawler
    'Applebot-Extended' // Apple Intelligence training — a TOKEN, not a crawler
]

/**
 * Search and user-triggered crawlers. These must stay UNGROUPED so they fall
 * through to the wildcard allow. Blocking any of them costs real visibility and
 * buys no quota: OAI-SearchBot is what puts you in ChatGPT answers,
 * Claude-SearchBot and Claude-User are what put you in Claude's, PerplexityBot
 * is Perplexity's index.
 */
const SEARCH_TOKENS = [
    'Googlebot',
    'bingbot',
    'DuckDuckBot',
    'Applebot',
    'OAI-SearchBot',
    'ChatGPT-User',
    'Claude-SearchBot',
    'Claude-User',
    'PerplexityBot',
    'Perplexity-User',
    'meta-webindexer'
]

describe('public/robots.txt', () => {
    test('the wildcard group ALLOWS the site, and still keeps its two private paths out', () => {
        const star = groupFor('*')
        if (!star) throw new Error('robots.txt has no "User-agent: *" group')

        // The catastrophic edit. `Allow: /` and `Disallow: /` are matched as
        // array MEMBERS, not substrings — otherwise `Disallow: /profile` would
        // satisfy an assertion about `Disallow: /`.
        expect(star.rules).toContain('Allow: /')
        expect(star.rules).not.toContain('Disallow: /')

        // Pre-existing exclusions, kept honest: dropping either would publish
        // the profile route or start listing the API proxy in search results.
        expect(star.rules).toContain('Disallow: /profile')
        expect(star.rules).toContain('Disallow: /api/')
    })

    test('every AI training crawler has its OWN group disallowing the whole site', () => {
        for (const token of TRAINING_TOKENS) {
            // `[token, rules]` rather than just `rules`, so a red run names the
            // token that lost its group instead of printing a bare `null`.
            const rules = groupFor(token)?.rules ?? null
            expect([token, rules]).toEqual([
                token,
                expect.arrayContaining(['Disallow: /'])
            ])
        }
    })

    test('no AI search crawler is named, so all of them fall through to the wildcard allow', () => {
        for (const token of SEARCH_TOKENS) {
            // A group that names one of these would inherit `Disallow: /` and
            // silently remove the site from that engine's answers — the edit
            // that looks like an addition and acts like an omission.
            expect([token, groupFor(token) ?? null]).toEqual([token, null])
        }
    })

    test('the sitemap is advertised', () => {
        expect(ROBOTS).toMatch(
            /^Sitemap:\s*https:\/\/poemunity\.com\/sitemap\.xml\s*$/m
        )
    })
})
