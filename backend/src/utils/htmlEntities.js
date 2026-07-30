// HTML entities that survived the original poem import.
//
// Exactly three occur in production — &amp; (5,418), &gt; (49), &lt; (24) — and
// nothing else: no numeric entities, no &nbsp;, and nothing at all in author
// names or bios. This decodes that closed set and NOTHING more.
//
// Not a general-purpose decoder on purpose. A permissive one would treat any
// `&word;` as an entity, and poems are full of ampersands followed by words —
// "Sturm & Drang; the storm" is text, not markup, and a greedy decoder would
// eat it.
const ENTITIES = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&'
}

// &amp; is replaced LAST. Decoding it first would turn "&amp;lt;" into "&lt;"
// and the next pass would turn that into "<" — inventing a character the source
// never had. Production has no double-encoding today, but the ordering costs
// nothing and stops a re-run or a future import from corrupting text.
const ORDER = ['&lt;', '&gt;', '&amp;']

function decodeHtmlEntities (text) {
  if (typeof text !== 'string') return text
  return ORDER.reduce(
    (out, entity) => out.split(entity).join(ENTITIES[entity]),
    text
  )
}

module.exports = { decodeHtmlEntities, ENTITIES }
