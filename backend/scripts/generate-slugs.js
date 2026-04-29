/**
 * One-time migration: generate SEO-friendly slugs for all existing poems.
 *
 * Usage:
 *   NODE_ENV=development node scripts/generate-slugs.js
 *
 * Safe to re-run: skips poems that already have a slug.
 */

require('dotenv/config')
const mongoose = require('mongoose')
const connectMongo = require('../mongo')
const Poem = require('../src/models/Poem')
const { generatePoemSlug } = require('../src/utils/slugUtils')

async function buildUniqueSlug(base, usedSlugs) {
  let slug = base
  let counter = 2
  while (usedSlugs.has(slug)) {
    slug = `${base}-${counter++}`
  }
  return slug
}

async function run() {
  await connectMongo()

  const poems = await Poem.find({ slug: { $exists: false } }).select('_id title author')
  console.log(`Found ${poems.length} poems without a slug`)

  // Load all existing slugs once to avoid repeated DB queries during the loop
  const existing = await Poem.find({ slug: { $exists: true } }).select('slug')
  const usedSlugs = new Set(existing.map(p => p.slug))

  let updated = 0
  for (const poem of poems) {
    const base = generatePoemSlug(poem.title, poem.author)
    const slug = await buildUniqueSlug(base, usedSlugs)
    usedSlugs.add(slug)

    await Poem.updateOne({ _id: poem._id }, { $set: { slug } })
    updated++

    if (updated % 100 === 0) {
      console.log(`  ${updated}/${poems.length} processed...`)
    }
  }

  console.log(`Done. ${updated} poems updated.`)
  await mongoose.disconnect()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
