import Head from 'next/head'

interface SeoHeadProps {
    title: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article'
    noIndex?: boolean
    /**
     * Keep following links while staying out of the index. Off by default,
     * which suits dead-end pages like login. On for search results, where the
     * page itself is not worth indexing but the poems it links to are — a blanket
     * `nofollow` there would waste the crawl.
     */
    followLinks?: boolean
}

const SITE_NAME = 'Poemunity'
const DEFAULT_DESCRIPTION = 'Your poem community. Read, write and share poems with poets from around the world.'
const DEFAULT_IMAGE = '/og-image.png'
// Social scrapers (Facebook, LinkedIn, Slack, Twitter/X) require an ABSOLUTE
// og:image/twitter:image URL — a relative path is ignored, so the card renders
// blank. Resolve against the same site origin the sitemap uses.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://poemunity.com').replace(/\/+$/, '')

function toAbsoluteUrl(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
    return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

function truncate(text: string, max = 155): string {
    return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

export function SeoHead({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
    noIndex = false,
    followLinks = false
}: SeoHeadProps) {
    const fullTitle = title.startsWith(SITE_NAME) ? title : `${title} | ${SITE_NAME}`
    const safeDesc = truncate(description)
    const absoluteImage = toAbsoluteUrl(image)

    return (
        <Head>
            <title key='title'>{fullTitle}</title>
            <meta name='description' content={safeDesc} key='description' />
            {noIndex && (
                <meta
                    name='robots'
                    content={followLinks ? 'noindex,follow' : 'noindex,nofollow'}
                    key='robots'
                />
            )}
            {url && <link rel='canonical' href={url} key='canonical' />}

            <meta property='og:site_name' content={SITE_NAME} key='og:site_name' />
            <meta property='og:type' content={type} key='og:type' />
            <meta property='og:title' content={fullTitle} key='og:title' />
            <meta property='og:description' content={safeDesc} key='og:description' />
            <meta property='og:image' content={absoluteImage} key='og:image' />
            {url && <meta property='og:url' content={url} key='og:url' />}

            <meta name='twitter:card' content='summary_large_image' key='twitter:card' />
            <meta name='twitter:title' content={fullTitle} key='twitter:title' />
            <meta name='twitter:description' content={safeDesc} key='twitter:description' />
            <meta name='twitter:image' content={absoluteImage} key='twitter:image' />
        </Head>
    )
}
