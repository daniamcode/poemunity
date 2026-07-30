const { decodeHtmlEntities } = require('./htmlEntities')

// Titles imported from the original poem scrape carry three artifacts:
//
//   1. a trailing "Launch Audio in a New Window" — the label of a player button
//      that sat next to the title on the source page;
//   2. raw newlines and runs of spaces, because the title spanned several
//      elements there;
//   3. undecoded HTML entities — 69 titles read "About God &amp; Things".
//
// Both were invisible while titles were only ever rendered inside a poem card.
// Promoting them into <title>, <h1>, JSON-LD and breadcrumbs made them very
// visible indeed.

// Anchored to the END on purpose. Verified against production: all 1,369
// occurrences are trailing, so an unanchored strip could only ever do damage —
// a poem legitimately titled "Launch Audio in a New Window and Other Poems"
// would lose its opening words.
const AUDIO_ARTIFACT = /\s*Launch\s+Audio\s+in\s+a\s+New\s+Window\s*$/i

/**
 * Strip the artifact and flatten whitespace, without touching anything else.
 *
 * Returns the original when there is nothing to clean, so callers can compare
 * by identity to decide whether a write is needed.
 */
function cleanPoemTitle (title) {
  if (typeof title !== 'string') return title

  const cleaned = decodeHtmlEntities(title)
    .replace(AUDIO_ARTIFACT, '')
    .replace(/\s+/g, ' ')
    // Collapsing newlines leaves gaps before punctuation: "Aeneid\n , II" would
    // otherwise become "Aeneid , II".
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()

  // Never return an empty title. A poem with no name at all is worse than one
  // with a scraped suffix, and it would take the slug down with it.
  return cleaned || title
}

module.exports = { cleanPoemTitle, AUDIO_ARTIFACT }
