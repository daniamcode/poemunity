/**
 * Re-check the curated `startHere` links against PRODUCTION.
 *
 * `genreIntros.test.ts` asserts every curated poet slug against a committed
 * snapshot (`src/test-utils/authorSlugs.json`), which is hermetic and catches
 * the realistic failure — a slug that was wrong when it was written. What it
 * cannot catch is an author RETIRED or RENAMED after the snapshot was taken,
 * because the snapshot ages with the repo rather than with the database.
 *
 * So this script does the other half, over the network, and is deliberately not
 * part of `pnpm test`: a unit suite that fails when a server is slow is a suite
 * people learn to ignore.
 *
 * Read-only. Run it before trusting the curated lists after any author
 * migration, and to refresh the snapshot:
 *
 *   node scripts/check-author-slugs.mjs            # verify
 *   node scripts/check-author-slugs.mjs --refresh  # rewrite the snapshot
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SNAPSHOT = path.join(HERE, '..', 'src', 'test-utils', 'authorSlugs.json')
const SITEMAP = process.env.SITE_URL
    ? `${process.env.SITE_URL}/sitemaps/authors.xml`
    : 'https://poemunity.com/sitemaps/authors.xml'

const res = await fetch(SITEMAP)
if (!res.ok) {
    console.error(`✗ ${SITEMAP} answered ${res.status}`)
    process.exit(1)
}
const live = [...(await res.text()).matchAll(/<loc>[^<]*\/authors\/([^<]+)<\/loc>/g)]
    .map(m => m[1])
    .sort()

// A short sitemap fails no individual request, so nothing else would see it —
// the same reasoning as fetchAllPoems comparing its count against `total`.
if (live.length < 1000) {
    console.error(`✗ only ${live.length} authors returned; refusing to trust that`)
    process.exit(1)
}

if (process.argv.includes('--refresh')) {
    fs.writeFileSync(SNAPSHOT, JSON.stringify(live))
    console.log(`✓ snapshot refreshed: ${live.length} authors`)
    process.exit(0)
}

// Import the intros without a TS build step: the curated slugs are the only
// thing needed, and they are a stable, greppable shape.
const source = fs.readFileSync(path.join(HERE, '..', 'src', 'data', 'genreIntros.ts'), 'utf8')
const curated = [...source.matchAll(/slug: '([a-z0-9-]+)'/g)].map(m => m[1])
const liveSet = new Set(live)
const missing = [...new Set(curated)].filter(s => !liveSet.has(s))

console.log(`checked ${new Set(curated).size} curated poets against ${live.length} live author pages`)
if (missing.length) {
    console.error(`✗ ${missing.length} no longer resolve:\n  ${missing.join('\n  ')}`)
    process.exit(1)
}
console.log('✓ every curated link resolves')
