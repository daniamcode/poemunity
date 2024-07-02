const { createServer } = require('http')

/**
 * An esbuild plugin, starts a webserver and injects some code into the js files to trigger a reload when a build is done.
 *
 * @param {object} [options] - options object
 * @param {number} [options.port=8942] - overwrite the port used to listen for/trigger the live reload
 */
function esbuildPluginLiveReload({ port = 8942 } = {}) {
    const plugin = {
        name: 'live-reload',
        async setup(build) {
            build.initialOptions.banner = build.initialOptions.banner || {}
            build.initialOptions.banner.js = `
                if (typeof window !== 'undefined' && location && typeof location.reload === 'function' && !window.__hot_reload_listen) {
                    window.__hot_reload_listen = new EventSource('http://localhost:${port}/live');
                    window.__hot_reload_listen.addEventListener('message', e => location.reload());
                }
                ${build.initialOptions.banner.js || ''}
            `

            const clients = []
            createServer((req, res) => {
                // handle preflight cors requests
                if (req.method === 'OPTIONS') {
                    res.writeHead(200, {
                        'Access-Control-Allow-Headers': '*',
                        'Access-Control-Allow-Origin': '*'
                    })
                    res.end()
                    return
                }

                res.writeHead(200, {
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                    'Content-Type': 'text/event-stream'
                })

                clients.push(res)
            }).listen(port)

            build.onEnd(() => {
                clients.forEach(res => {
                    res.write('data: update\n\n')
                    res.end()
                })
                clients.length = 0
            })
        }
    }

    return plugin
}

module.exports = {
    esbuildPluginLiveReload
}