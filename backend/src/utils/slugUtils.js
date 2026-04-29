const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'as', 'this', 'that', 'it', 'its', 'my', 'your', 'his', 'her', 'our',
  'their', 'i', 'you', 'he', 'she', 'we', 'they', 'not', 'no', 'so'
])

function slugifyText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(word => word && !STOP_WORDS.has(word))
    .join('-')
}

function generatePoemSlug(title, author) {
  const titlePart = slugifyText(title || '')
  const authorPart = slugifyText(author || '')
  const base = [titlePart, authorPart].filter(Boolean).join('-')
  return base || 'poem'
}

module.exports = { generatePoemSlug }
