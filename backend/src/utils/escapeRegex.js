/**
 * Make user input inert inside a `$regex`.
 *
 * Every metacharacter becomes a literal. Without this, three separate things go
 * wrong, in ascending order of seriousness:
 *
 *   - `a(` is an invalid pattern, so the query throws and the endpoint 500s;
 *   - `.*` is a user-supplied full collection scan;
 *   - `(a+)+$` is CATASTROPHIC BACKTRACKING — a pattern whose match time grows
 *     exponentially with the input length, which is a denial of service any
 *     anonymous visitor can trigger with one GET.
 *
 * This lived as a private copy inside `controllers/poems.js` while
 * `controllers/authors.js` interpolated `?letter=` raw. It is shared now
 * because a "make this safe" helper that only one of two call sites can reach
 * is how the second one ends up unsafe.
 *
 * Escaping alone does not bound the SIZE of the resulting pattern, so callers
 * taking free-form input should also cap its length — see MAX_REGEX_INPUT.
 */
function escapeRegex (input) {
  return String(input).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * A generous cap on how much user input may become a regex.
 *
 * Escaped input cannot backtrack catastrophically, so this is not the security
 * boundary — it is the belt to that braces. A megabyte-long literal pattern
 * still costs memory and CPU to compile and run against every document, and no
 * legitimate query needs more than this.
 */
const MAX_REGEX_INPUT = 100

module.exports = { escapeRegex, MAX_REGEX_INPUT }
