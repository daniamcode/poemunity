// Category helpers shared by the seed scripts and by sync-categories.js.
//
// Background: the 140-category migration (scripts/categorize-poems.js) wrote all
// 140 genres into the database, but only some were ever transcribed into
// `frontend/src/data/constants.ts` — leaving `anger`, `imagination`,
// `spirituality` and `sports` (168 real poems) with no category to navigate to
// and no sitemap entry. Two lists, one transcription, silent drift.

const fs = require('fs')
const path = require('path')

const CONSTANTS_PATH = path.join(__dirname, '../../../frontend/src/data/constants.ts')

// Mirrors categoryToSlug() in constants.ts. categoryDrift.test.js slugs every
// category through both implementations and fails if they disagree.
function categoryToSlug (category) {
  return category
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\s*&\s*/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

/**
 * Read the CATEGORIES display names out of the frontend's constants.ts.
 *
 * Only usable from scripts/ and tests, which run in the monorepo checkout —
 * deployed backend code cannot reach across workspaces (see src/data/categories.js).
 */
function parseFrontendCategories () {
  const src = fs.readFileSync(CONSTANTS_PATH, 'utf8')
  const block = src.split('export const CATEGORIES = [')[1]
  if (!block) throw new Error(`CATEGORIES not found in ${CONSTANTS_PATH}`)

  // Line-anchored, and accepting EITHER quote style — entries like
  // "Father's Day" are double-quoted, and a single-quote-only pattern silently
  // drops them. A naive /'([^']+)'/g is worse still: it also matches the
  // ",\n    " between entries, returning half a list that still looks plausible.
  const names = [...block.split(']')[0].matchAll(/^\s*(['"])(.+?)\1,\s*$/gm)].map(m => m[2])

  // A partial parse is worse than a failed one — it would quietly reject valid
  // genres as unknown. The list is ~143 and only grows.
  if (names.length < 100) {
    throw new Error(`Parsed only ${names.length} categories from constants.ts — the format changed`)
  }
  return names
}

module.exports = { parseFrontendCategories, categoryToSlug, CONSTANTS_PATH }
