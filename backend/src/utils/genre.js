const { CATEGORY_SLUG_SET } = require('../data/categories')

// The category dropdown constrains the UI, but `POST /poems` spreads the request
// body into the model and `Poem` is `strict: false` — so before this, any client
// could store `genre: 'whatever'`. The poem then lived on a page reachable by
// URL but absent from the category nav and the sitemap: content orphaned from
// the moment it was written. Same class of bug as the four categories that the
// 140-category migration left stranded, just reached through the API instead of
// a migration script.

/**
 * Normalize a client-supplied genre to its canonical slug.
 *
 * Accepts either the display name ('Sorrow & Grieving') or the slug
 * ('sorrow-and-grieving'): the frontend posts the slug, but seed data and
 * hand-made API calls use the display name, and silently storing 'Nature'
 * alongside 'nature' would split one category into two.
 *
 * @returns {{ ok: true, genre: string } | { ok: false, error: string }}
 */
function normalizeGenre (genre) {
  if (typeof genre !== 'string' || !genre.trim()) {
    return { ok: false, error: 'genre is required' }
  }
  const slug = genre
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/\s*&\s*/g, '-and-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')

  if (!CATEGORY_SLUG_SET.has(slug)) {
    return { ok: false, error: `Unknown genre: ${genre}` }
  }
  return { ok: true, genre: slug }
}

module.exports = { normalizeGenre }
