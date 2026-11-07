/**
 * The canonical site origin, for anything that has to emit an ABSOLUTE link to
 * poemunity.com.
 *
 * Resolved from `NEXT_PUBLIC_SITE_URL` rather than from the request's `host`
 * header on purpose: the embed card is loaded inside an `<iframe>` on somebody
 * else's website, and its snippet is built in the browser with no request to
 * speak of. A `host`-derived base would put whatever domain the embedder
 * happens to be behind into the one anchor the whole embed feature exists to
 * emit — and the request host is not trustworthy in any case, it is whatever
 * the visitor sent.
 *
 * Falls back to the apex, which is canonical (`www` and the `.vercel.app`
 * hostname 301 to it), and strips trailing slashes so no caller can mint
 * `poemunity.com//detail/...`.
 *
 * Same expression `SeoHead` and `sitemapRequest` already carry; kept in one
 * place for the embed feature rather than adding a fourth copy.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://poemunity.com').replace(/\/+$/, '')
