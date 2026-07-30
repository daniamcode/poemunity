#!/usr/bin/env node
/**
 * Strip scraper artifacts from poem titles and regenerate the slugs they fed.
 *
 * The original import left "Launch Audio in a New Window" — the label of a
 * player button on the source page — trailing 1,369 titles, plus raw newlines in
 * 1,879. Invisible while a title only ever appeared inside a poem card; very
 * visible once titles went into <title>, <h1>, JSON-LD and breadcrumbs.
 *
 * The slug is the delicate part. It was generated FROM the dirty title
 * (`adam-means-earth-launch-audio-new-window-samuel-menashe`) and is already in
 * the sitemap, in canonicals and in anything indexed. So the old slug is pushed
 * onto `slugHistory`, which GET /poem/:idOrSlug falls back to — old links keep
 * working and the page canonicalises to the new slug.
 *
 * DRY-RUN BY DEFAULT. Nothing is written without --commit.
 *
 *   node scripts/clean-poem-titles.js            # report only
 *   node scripts/clean-poem-titles.js --commit   # write
 *
 * MONGODB_PRE points at the same database as MONGODB, so this is a PRODUCTION
 * write either way: take a mongodump first (docs/DATABASE_BACKUP_RESTORE.md).
 */
require('dotenv').config()
const mongoose = require('mongoose')
const Poem = require('../src/models/Poem')
const Author = require('../src/models/Author')
const { cleanPoemTitle } = require('../src/utils/titleUtils')
const { generatePoemSlug } = require('../src/utils/slugUtils')

const commit = process.argv.includes('--commit')
const SAMPLE = 8

/**
 * A slug free for this poem to take.
 *
 * Checks `slug` AND `slugHistory`: a slug retired by another poem still has to
 * resolve to that poem, so handing it to a second one would make the old URL
 * ambiguous. `_id: { $ne: self }` lets a poem keep the slug it already has.
 */
async function uniqueSlug (base, selfId) {
  let candidate = base
  let counter = 2
  while (await Poem.exists({
    _id: { $ne: selfId },
    $or: [{ slug: candidate }, { slugHistory: candidate }]
  })) {
    candidate = `${base}-${counter++}`
  }
  return candidate
}

async function main () {
  const uri = process.env.MONGODB
  if (!uri) throw new Error('MONGODB is not set')

  await mongoose.connect(uri)
  console.log(`database: ${mongoose.connection.name}`)
  console.log(commit ? 'mode: COMMIT (writing)\n' : 'mode: DRY-RUN (no writes)\n')

  // Only candidates: an artifact, a newline, or a double space. Everything else
  // is already clean and must not be touched.
  const candidates = await Poem.find({
    $or: [{ title: /launch\s*audio/i }, { title: /\n/ }, { title: /\s\s/ }]
  }).select('title slug authorId slugHistory')

  console.log(`examined: ${candidates.length} candidate poems`)

  const stats = { titles: 0, slugs: 0, unchanged: 0, collisions: 0 }
  const samples = []

  for (const poem of candidates) {
    const title = cleanPoemTitle(poem.title)
    if (title === poem.title) { stats.unchanged++; continue }

    // The author feeds the slug, exactly as it did when the poem was created.
    const author = poem.authorId ? await Author.findById(poem.authorId).select('name username') : null
    const authorName = author ? (author.name || author.username) : ''
    const base = generatePoemSlug(title, authorName)
    const slug = await uniqueSlug(base, poem._id)

    if (slug !== base) stats.collisions++

    const slugChanged = Boolean(poem.slug) && slug !== poem.slug
    stats.titles++
    if (slugChanged) stats.slugs++

    if (samples.length < SAMPLE) {
      samples.push({ from: poem.title, to: title, oldSlug: poem.slug, newSlug: slug })
    }

    if (commit) {
      const update = { title, slug }
      // $addToSet, not $push: re-running the script must not stack duplicates.
      if (slugChanged) update.$addToSet = { slugHistory: poem.slug }
      const { $addToSet, ...set } = update
      await Poem.updateOne({ _id: poem._id }, { $set: set, ...($addToSet ? { $addToSet } : {}) })
    }
  }

  console.log('\nsamples:')
  samples.forEach(s => {
    console.log(`  ${JSON.stringify(s.from)}\n    title -> ${JSON.stringify(s.to)}`)
    if (s.oldSlug !== s.newSlug) console.log(`    slug  -> ${s.oldSlug}\n             ${s.newSlug}`)
  })

  console.log('\nsummary:')
  console.log(`  titles cleaned      : ${stats.titles}`)
  console.log(`  slugs regenerated   : ${stats.slugs} (old slug kept in slugHistory)`)
  console.log(`  already clean       : ${stats.unchanged}`)
  console.log(`  slug collisions     : ${stats.collisions} (suffixed -2, -3, ...)`)
  console.log(commit ? '\nWritten.' : '\nNothing written. Re-run with --commit.')

  await mongoose.disconnect()
}

main().catch(error => {
  console.error('ERROR:', error.message)
  process.exit(1)
})
