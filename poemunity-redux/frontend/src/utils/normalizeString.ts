import { normalizeSwaps } from '../data/normalizeSwaps'

/**
 *
 * @param input {string} String to be normalized
 * @returns {string}
 */
const normalizeString = (input: string = '') => {
  let str = String(input)
  str = str.replace(/^\s+|\s+$/g, '') // trim
  str = str.toLowerCase()

  // remove accents, swap ñ for n, etc
  Object.keys(normalizeSwaps).forEach((swap) => {
    normalizeSwaps[swap].forEach((s) => {
      str = str.replace(new RegExp(s, 'g'), swap)
    })
  })
  return str
}

export default normalizeString
