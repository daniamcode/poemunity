// Regenerate backend/src/data/categories.js from the frontend CATEGORIES array.
//
// Run after editing frontend/src/data/constants.ts:
//   node backend/scripts/sync-categories.js
//
// Read-only with respect to the database — it only rewrites a source file.
// src/__tests__/categoryDrift.test.js fails if you forget to run it.

const fs = require('fs')
const path = require('path')
const { parseFrontendCategories, categoryToSlug } = require('./lib/categories')

const OUT = path.join(__dirname, '../src/data/categories.js')

const HEADER = `// GENERATED FROM frontend/src/data/constants.ts — see the note below.
//
// The frontend CATEGORIES array is the source of truth for the category list
// (it drives the dropdown, the nav and the slugs). Runtime backend code cannot
// read it — the Vercel root is backend/, so frontend/ is not in the deployed
// bundle — so the slugs are mirrored here.
//
// A mirrored list is exactly what caused the bug this file exists to stop: the
// 140-category migration wrote all 140 genres to the database while only some
// reached constants.ts, orphaning 168 poems across four categories. So the copy
// is NOT trusted to stay in step by discipline — src/__tests__/categoryDrift.test.js
// reads the real constants.ts and fails if the two disagree, and
// .github/workflows/backend.yml watches that file so editing the frontend list
// runs this check.
//
// To change the categories: edit frontend/src/data/constants.ts, then run
//   node backend/scripts/sync-categories.js

`

const slugs = parseFrontendCategories().map(categoryToSlug)
const body = `const CATEGORY_SLUGS = [\n${slugs.map(s => `  '${s}'`).join(',\n')}\n]\n\n` +
  'module.exports = { CATEGORY_SLUGS, CATEGORY_SLUG_SET: new Set(CATEGORY_SLUGS) }\n'

fs.writeFileSync(OUT, HEADER + body)
console.log(`Wrote ${slugs.length} category slugs to ${path.relative(process.cwd(), OUT)}`)
