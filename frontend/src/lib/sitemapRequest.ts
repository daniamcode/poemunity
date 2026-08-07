import type { IncomingMessage } from 'http'

/**
 * Always emit canonical apex URLs in production/preview; use the real host only
 * for local dev.
 *
 * A sitemap that lists `poemunity-frontend.vercel.app` URLs is a sitemap for a
 * different site as far as Search Console is concerned — and that host 301s to
 * the apex anyway, so every entry would be a redirect.
 */
export function sitemapBaseUrl(req: IncomingMessage): string {
    const host = req.headers.host || ''
    const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1')
    const protocol = (req.headers['x-forwarded-proto'] as string)?.split(',')[0] || 'http'

    return isLocal
        ? `${protocol}://${host}`
        : (process.env.NEXT_PUBLIC_SITE_URL || 'https://poemunity.com').replace(/\/+$/, '')
}
