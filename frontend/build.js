// http is node native, not a npm library
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')
const { exec } = require('node:child_process')
const { context, build } = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')
const { esbuildPluginLiveReload } = require('./src/utils/webserver')

function openBrowser(url) {
    const platform = process.platform
    let command

    switch (platform) {
        case 'darwin': // macOS
            command = `open ${url}`
            break
        case 'win32': // Windows
            command = `start ${url}`
            break
        default: // Linux and others
            command = `xdg-open ${url}`
            break
    }

    exec(command, (err) => {
        if (err) {
            console.log('ℹ Could not auto-launch browser')
        }
        else {
            console.log('✓ Browser launched automatically')
        }
    })
}

function copyPublicAssets() {
    const publicDir = path.join(__dirname, 'public')
    const buildDir = path.join(__dirname, 'build')

    // Create build directory if it doesn't exist
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true })
    }

    // Read and process index.html
    const htmlPath = path.join(publicDir, 'index.html')
    let html = fs.readFileSync(htmlPath, 'utf8')

    // Replace %PUBLIC_URL% with empty string (or '.' for relative paths)
    html = html.replace(/%PUBLIC_URL%/g, '')

    // Write processed HTML to build directory
    fs.writeFileSync(path.join(buildDir, 'index.html'), html)
}

async function startServer() {
    const RELOAD_PORT = 8942
    const BACKEND_PORT = 4200
    const argPattern = /--(\w+)(?:=(\w+))?/

    function parseArguments() {
        return process.argv.slice(2).reduce((acc, val) => {
            const match = argPattern.exec(val)
            if (match) {
                acc[match[1]] = match[2] ?? ''
            }
            return acc
        }, {})
    }

    const config = parseArguments()
    const isWatchMode = config.watch !== undefined
    const isReloadMode = config.reload !== undefined
    const isDev = process.env.NODE_ENV !== 'production'

    const specificConfig = {
        define: {
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
            'process.env.REACT_APP_ADMIN': JSON.stringify(process.env.REACT_APP_ADMIN || '')
        },
        entryPoints: ['src/index.tsx'],
        outdir: './build',
        bundle: true,
        minify: !isDev,
        format: 'esm',
        sourcemap: isDev,
        loader: {
            '.js': 'jsx',
            '.jsx': 'jsx',
            '.ts': 'ts',
            '.tsx': 'tsx',
            '.eot': 'dataurl',
            '.png': 'file',
            '.svg': 'dataurl',
            '.ttf': 'dataurl',
            '.woff': 'dataurl',
            '.woff2': 'dataurl'
        },
        logLevel: 'info',
        plugins: [sassPlugin()],
        target: ['es2020']
    }

    const esbuildConfigBase = {
        ...specificConfig
    }

    const esbuildConfigReload = {
        ...esbuildConfigBase,
        banner: {
            js: `
        (() => new EventSource('http://localhost:${RELOAD_PORT}/live').addEventListener('message', e => location.reload()))();
      `
        },
        plugins: [
            ...(esbuildConfigBase.plugins || []),
            esbuildPluginLiveReload({ port: RELOAD_PORT })
        ]
    }

    const esbuildConfig = isReloadMode ? esbuildConfigReload : esbuildConfigBase

    // Copy public assets (index.html) to build directory
    copyPublicAssets()

    if (isWatchMode) {
        const ctx = await context(esbuildConfig)

        console.log('Entering watch mode, meaning that if a file is changed, a rebuild occurs...')
        await ctx.watch()

        // Start esbuild's server on a random local port
        const { host, port } = await ctx.serve({ servedir: 'build' })

        // Start a proxy server on port 3000
        http.createServer((req, res) => {
            // Proxy API requests to backend
            if (req.url.startsWith('/api')) {
                const options = {
                    hostname: 'localhost',
                    port: BACKEND_PORT,
                    path: req.url,
                    method: req.method,
                    headers: req.headers
                }

                const proxyReq = http.request(options, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode, proxyRes.headers)
                    proxyRes.pipe(res, { end: true })
                })

                proxyReq.on('error', (err) => {
                    console.error('Backend proxy error:', err.message)
                    res.writeHead(502, { 'Content-Type': 'application/json' })
                    res.end(JSON.stringify({
                        error: 'Backend server not available',
                        message: `Make sure backend is running on port ${BACKEND_PORT}`
                    }))
                })

                req.pipe(proxyReq, { end: true })
                return
            }

            // Forward static file requests to esbuild
            const options = {
                hostname: host,
                port: port,
                path: req.url,
                method: req.method,
                headers: req.headers
            }

            const proxyReq = http.request(options, (proxyRes) => {
                // If esbuild returns "not found", serve index.html for client-side routing
                if (proxyRes.statusCode === 404) {
                    const indexPath = path.join(__dirname, 'build', 'index.html')

                    fs.readFile(indexPath, (err, data) => {
                        if (err) {
                            res.writeHead(404, { 'Content-Type': 'text/html' })
                            res.end('<h1>404 - Page Not Found</h1>')
                            return
                        }

                        res.writeHead(200, { 'Content-Type': 'text/html' })
                        res.end(data)
                    })
                    return
                }

                // Otherwise, forward the response from esbuild to the client
                res.writeHead(proxyRes.statusCode, proxyRes.headers)
                proxyRes.pipe(res, { end: true })
            })

            proxyReq.on('error', (err) => {
                console.error('esbuild proxy error:', err)
                res.writeHead(500, { 'Content-Type': 'text/html' })
                res.end('<h1>Internal Server Error</h1>')
            })

            // Forward the body of the request to esbuild
            req.pipe(proxyReq, { end: true })
        }).listen(3000, () => {
            console.log('✓ Proxy server running at http://localhost:3000')
            console.log(`✓ API requests proxied to http://localhost:${BACKEND_PORT}`)
            console.log('✓ Live reload enabled')

            // Auto-launch browser
            openBrowser('http://localhost:3000')
        })
    }
    else {
        console.log('Building...')
        try {
            await build(esbuildConfig)
            console.log('✓ Build completed successfully')
        }
        catch (err) {
            console.error('✗ Error during build:', err)
            process.exit(1)
        }
    }
}

startServer().catch((err) => {
    console.error('✗ Error starting server:', err)
    process.exit(1)
})
