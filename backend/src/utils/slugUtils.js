const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'as', 'this', 'that', 'it', 'its', 'my', 'your', 'his', 'her', 'our',
  'their', 'i', 'you', 'he', 'she', 'we', 'they', 'not', 'no', 'so'
])

function slugifyText (text, { keepStopWords = false } = {}) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word && (keepStopWords || !STOP_WORDS.has(word)))
    .join('-')
}

function generatePoemSlug (title, author) {
  // Stop words are dropped to keep slugs short, but ~35 poems are titled
  // entirely with them — "A", "And", "To", "You". Dropping every word leaves the
  // title contributing NOTHING, and the slug collapses to the bare author name:
  // /detail/norma-cole for a poem called "A". So when filtering empties the
  // title, keep the words instead — a slightly longer slug beats a slug that
  // does not mention the poem.
  const titlePart = slugifyText(title || '') || slugifyText(title || '', { keepStopWords: true })
  const authorPart = slugifyText(author || '')
  const base = [titlePart, authorPart].filter(Boolean).join('-')
  return base || 'poem'
}

function slugifyAuthor (name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

module.exports = { generatePoemSlug, slugifyAuthor }
