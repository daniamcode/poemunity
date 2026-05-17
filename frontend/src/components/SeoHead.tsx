import Head from 'next/head'

interface SeoHeadProps {
    title: string
    description?: string
    image?: string
    url?: string
    type?: 'website' | 'article'
    noIndex?: boolean
}

const SITE_NAME = 'Poemunity'
const DEFAULT_DESCRIPTION = 'Your poem community. Read, write and share poems with poets from around the world.'
const DEFAULT_IMAGE = '/og-image.png'

function truncate(text: string, max = 155): string {
    return text.length > max ? `${text.slice(0, max - 3)}...` : text
}

export function SeoHead({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url,
    type = 'website',
    noIndex = false
}: SeoHeadProps) {
    const fullTitle = `${title} | ${SITE_NAME}`
    const safeDesc = truncate(description)

    return (
        <Head>
            <title key='title'>{fullTitle}</title>
            <meta name='description' content={safeDesc} key='description' />
            {noIndex && <meta name='robots' content='noindex,nofollow' key='robots' />}
            {url && <link rel='canonical' href={url} key='canonical' />}

            <meta property='og:site_name' content={SITE_NAME} key='og:site_name' />
            <meta property='og:type' content={type} key='og:type' />
            <meta property='og:title' content={fullTitle} key='og:title' />
            <meta property='og:description' content={safeDesc} key='og:description' />
            <meta property='og:image' content={image} key='og:image' />
            {url && <meta property='og:url' content={url} key='og:url' />}

            <meta name='twitter:card' content='summary_large_image' key='twitter:card' />
            <meta name='twitter:title' content={fullTitle} key='twitter:title' />
            <meta name='twitter:description' content={safeDesc} key='twitter:description' />
            <meta name='twitter:image' content={image} key='twitter:image' />
        </Head>
    )
}
