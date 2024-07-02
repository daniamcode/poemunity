/* eslint-disable no-console */
const { build, context } = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')

const {
    esbuildPluginLiveReload,
} = require('./utils/webserver.js')

const { createEsbuildDefaultConfig } = require('./conf/esbuild.config.ts')

const RELOAD_PORT = 8080
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
const isWatchMode = config['watch'] !== undefined
const isReloadMode = config['reload'] !== undefined
const isDev = process.env.NODE_ENV !== 'production'
const cspWsLocalhost = isDev ? `http://localhost:${RELOAD_PORT}` : ''

const specificConfig = {
    entryPoints: ['src/index.tsx'],
    minify: !isDev,
    outdir: './build',
    sourcemap: isDev,
    splitting: true
}

// const esbuildConfigBase = createEsbuildDefaultConfig(null, specificConfig)

// const esbuildConfigReload = {
//     ...esbuildConfigBase,
//     banner: {
//         js: `
//             (() => new EventSource('http://localhost:${RELOAD_PORT}/live').addEventListener('message', e => location.reload()))();
//         `
//     },
//     plugins: [...esbuildConfigBase.plugins, esbuildPluginLiveReload({ port: RELOAD_PORT })]
// }

const esbuildConfig = {
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.REACT_APP_ADMIN': JSON.stringify(process.env.REACT_APP_ADMIN || '')
  },
  entryPoints: ['src/index.tsx'],
  outdir: './build',
  bundle: true,
  format: 'esm',
  loader: { 
    '.js': 'jsx',
    '.ts': 'tsx', 
    '.eot': 'dataurl',
    '.js': 'jsx',
    '.png': 'file',
    '.svg': 'dataurl',
    '.ttf': 'dataurl',
    '.woff': 'dataurl',
    '.woff2': 'dataurl'
  },
  logLevel: 'info',
//   plugins: [sassPlugin(), esbuildPluginLiveReload({ port: RELOAD_PORT })],
  plugins: [sassPlugin()],
  target: ['es2020'],
}

// const esbuildConfig = isReloadMode ? esbuildConfigReload : esbuildConfigBase

if (isWatchMode) {
    context(esbuildConfig).then(ctx => {
        console.log('Entering watch mode...')
        ctx.watch()
    })
} else {
    console.log('Building...')
    build(esbuildConfig)
}
