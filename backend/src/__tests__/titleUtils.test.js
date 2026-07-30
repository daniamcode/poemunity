const { cleanPoemTitle } = require('../utils/titleUtils')

describe('cleanPoemTitle', () => {
  test('strips the trailing audio artifact', () => {
    expect(cleanPoemTitle('Tourist Launch Audio in a New Window')).toBe('Tourist')
  })

  test('handles the real shape, newlines and all', () => {
    expect(cleanPoemTitle('Adam\n  \n  Means Earth*\n \n \n  \n   Launch Audio in a New Window'))
      .toBe('Adam Means Earth*')
  })

  // 510 titles have the newlines without the artifact.
  test('flattens newlines even when there is no artifact', () => {
    expect(cleanPoemTitle('from\n  \n  Ajax: Dirge')).toBe('from Ajax: Dirge')
  })

  test('does not leave a gap before punctuation', () => {
    expect(cleanPoemTitle('Aeneid\n  \n  , II, 692 - end')).toBe('Aeneid, II, 692 - end')
  })

  // Anchored to the end: an unanchored strip could only do damage here.
  test('leaves the phrase alone when it is part of the actual title', () => {
    const real = 'Launch Audio in a New Window and Other Poems'
    expect(cleanPoemTitle(real)).toBe(real)
  })

  test('returns clean titles unchanged, so callers can skip the write', () => {
    const title = 'Ozymandias'
    expect(cleanPoemTitle(title)).toBe(title)
  })

  test('never returns an empty title', () => {
    // A title that is nothing BUT the artifact would otherwise vanish, taking
    // the slug with it.
    expect(cleanPoemTitle('Launch Audio in a New Window')).toBe('Launch Audio in a New Window')
  })

  test('is case-insensitive about the artifact', () => {
    expect(cleanPoemTitle('Tourist LAUNCH AUDIO IN A NEW WINDOW')).toBe('Tourist')
  })

  test('passes non-strings straight through', () => {
    expect(cleanPoemTitle(undefined)).toBeUndefined()
    expect(cleanPoemTitle(null)).toBeNull()
  })
})

const { generatePoemSlug } = require('../utils/slugUtils')

// ~35 poems are titled entirely with stop words. Filtering them all out left the
// slug as the bare author name — /detail/norma-cole for a poem called "A".
describe('generatePoemSlug with all-stop-word titles', () => {
  test('keeps the words rather than losing the title entirely', () => {
    expect(generatePoemSlug('A', 'Norma Cole')).toBe('a-norma-cole')
    expect(generatePoemSlug('And', 'Rae Armantrout')).toBe('and-rae-armantrout')
    expect(generatePoemSlug('To You', 'Frank Stanford')).toBe('to-you-frank-stanford')
  })

  test('still strips stop words when real words remain', () => {
    expect(generatePoemSlug('The Abracadabra Boys', 'Carl Sandburg'))
      .toBe('abracadabra-boys-carl-sandburg')
  })

  // Punctuation-only titles survive nothing; the author still identifies it.
  test('falls back to the author when the title has no letters at all', () => {
    expect(generatePoemSlug('!', 'Wendy Videlock')).toBe('wendy-videlock')
  })

  test('never returns an empty slug', () => {
    expect(generatePoemSlug('', '')).toBe('poem')
  })
})
