/* eslint-disable no-console */
const { build, context } = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')

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
const isDev = process.env.NODE_ENV !== 'production'
console.log(process.argv)
console.log(isWatchMode)
console.log(isDev)

const esbuildConfig = {
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    'process.env.REACT_APP_ADMIN': JSON.stringify(process.env.REACT_APP_ADMIN || '')
  },
  entryPoints: ['src/index.tsx'],
  outdir: './build',
  // bundle: !isDev,
  minify: !isDev,
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
  plugins: [sassPlugin()],
  target: ['es2020'],
}

if (isWatchMode) {
    context(esbuildConfig).then(ctx => {
        console.log('Entering watch mode...')
        ctx.watch()
    })
} else {
    console.log('Building...')
    build(esbuildConfig)
}
