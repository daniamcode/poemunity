/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    sassOptions: {
        includePaths: ['./src']
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: '**' }
        ]
    },
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
    },
    // The child sitemaps are served by ONE dynamic page, `pages/sitemaps/[section].ts`,
    // but they have to answer at `.xml` URLs — that is what the sitemap index
    // points at and what a crawler expects to find.
    //
    // The obvious spelling, `pages/sitemaps/[section].xml.ts`, does not work and
    // fails silently: Next only treats a path segment as dynamic when the
    // brackets span the WHOLE segment, so `[section].xml` is read as a literal
    // directory name and every child 404s while the index that links them keeps
    // answering 200. (`isDynamicRoute('/sitemaps/[section].xml') === false` — the
    // route never enters the dynamic table at all.) Hence the rewrite.
    async rewrites() {
        return [
            { source: '/sitemaps/:section.xml', destination: '/sitemaps/:section' }
        ]
    },
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'poemunity-frontend.vercel.app' }],
                destination: 'https://poemunity.com/:path*',
                permanent: true
            }
        ]
    }
}

module.exports = nextConfig
