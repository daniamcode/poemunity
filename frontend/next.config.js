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
    async redirects() {
        return [
            {
                source: '/:path*',
                has: [{ type: 'host', value: 'poemunity-frontend.vercel.app' }],
                destination: 'https://poemunity.com/:path*',
                permanent: true
            }
        ]
    },
    async rewrites() {
        // Serve the SVG favicon for legacy /favicon.ico requests so they don't
        // fall through to the [genre] dynamic route and return an HTML page.
        return [
            { source: '/favicon.ico', destination: '/favicon.svg' }
        ]
    }
}

module.exports = nextConfig
