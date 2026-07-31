const { CATEGORY_SLUGS, CATEGORY_SLUG_SET } = require('../data/categories')
const { parseFrontendCategories, categoryToSlug } = require('../../scripts/lib/categories')
const { normalizeGenre } = require('../utils/genre')

/**
 * The bug this guards against actually happened.
 *
 * The 140-category migration (scripts/categorize-poems.js) wrote all 140 genres
 * into the database, but only some of them reached
 * `frontend/src/data/constants.ts`. Four — anger, imagination, spirituality,
 * sports — existed on 168 real poems with no category to navigate to and no
 * sitemap entry, for months, silently: every page rendered fine.
 *
 * `backend/src/data/categories.js` is a MIRROR of that frontend list (runtime
 * backend code cannot read across workspaces), so it is the same shape of risk
 * again. This test is what makes the mirror safe: it reads the real
 * constants.ts and fails the moment the two disagree.
 *
 * If this fails, run: node scripts/sync-categories.js
 */
describe('category list drift', () => {
  const frontendSlugs = parseFrontendCategories().map(categoryToSlug)

  test('the backend mirror matches the frontend CATEGORIES exactly', () => {
    expect(CATEGORY_SLUGS).toEqual(frontendSlugs)
  })

  test('parses a realistic number of categories', () => {
    // Guards the parser itself: a regex that silently matches half the list
    // would make this suite pass while rejecting valid genres at runtime. That
    // is not hypothetical — the first version of the parser did exactly that,
    // matching the ",\n" between entries as if it were a category.
    expect(frontendSlugs.length).toBeGreaterThan(100)
  })

  test('includes the four categories the migration orphaned', () => {
    // Regression pin: these were in the database but not the list.
    for (const slug of ['anger', 'imagination', 'spirituality', 'sports']) {
      expect(CATEGORY_SLUG_SET.has(slug)).toBe(true)
    }
  })

  test('includes the apostrophe categories a single-quote parser drops', () => {
    // "Father's Day" and friends are double-quoted in constants.ts, so a
    // pattern that only understands single quotes silently omits them — which
    // is why the list looked like 136 entries when it held 139.
    for (const slug of ['fathers-day', 'mothers-day', 'valentines-day']) {
      expect(CATEGORY_SLUG_SET.has(slug)).toBe(true)
    }
  })

  test('has no duplicates', () => {
    expect(new Set(CATEGORY_SLUGS).size).toBe(CATEGORY_SLUGS.length)
  })
})

describe('normalizeGenre', () => {
  test('accepts a canonical slug', () => {
    expect(normalizeGenre('love')).toEqual({ ok: true, genre: 'love' })
  })

  test('accepts the display name and returns the slug', () => {
    // Seed data and hand-made API calls use display names; storing 'Nature'
    // beside 'nature' would split one category in two.
    expect(normalizeGenre('Sorrow & Grieving')).toEqual({ ok: true, genre: 'sorrow-and-grieving' })
    expect(normalizeGenre("Father's Day")).toEqual({ ok: true, genre: 'fathers-day' })
  })

  test('trims and lowercases', () => {
    expect(normalizeGenre('  LOVE  ')).toEqual({ ok: true, genre: 'love' })
  })

  test.each([
    ['an invented category', 'whatever'],
    ['an empty string', ''],
    ['whitespace only', '   '],
    ['a missing value', undefined],
    ['a non-string', 42]
  ])('rejects %s', (_label, value) => {
    expect(normalizeGenre(value).ok).toBe(false)
  })
})
