// http is node native, not a npm library
const http = require('node:http');
const { context } = require('esbuild')
const { sassPlugin } = require('esbuild-sass-plugin')
const { esbuildPluginLiveReload } = require('./src/utils/webserver')

async function startServer() {
  // Dynamically import esbuild
  const esbuild = await import('esbuild');

  const RELOAD_PORT = 8942;
  const argPattern = /--(\w+)(?:=(\w+))?/;

  function parseArguments() {
    return process.argv.slice(2).reduce((acc, val) => {
      const match = argPattern.exec(val);
      if (match) {
        acc[match[1]] = match[2] ?? '';
      }
      return acc;
    }, {});
  }

  const config = parseArguments();
  const isWatchMode = config['watch'] !== undefined;
  const isReloadMode = config['reload'] !== undefined;
  const isDev = process.env.NODE_ENV !== 'production';
  const cspWsLocalhost = isDev ? `http://localhost:${RELOAD_PORT}` : '';

  const specificConfig = {
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        'process.env.REACT_APP_ADMIN': JSON.stringify(process.env.REACT_APP_ADMIN || '')
      },
      entryPoints: ['src/index.tsx'],
      outdir: './build',
      // bundle: !isDev,
      bundle: true,
      minify: !isDev,
      format: 'esm',
      sourcemap: isDev,
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
  };

  const esbuildConfigBase = {
    ...specificConfig,
  };

  const esbuildConfigReload = {
    ...esbuildConfigBase,
    banner: {
      js: `
        (() => new EventSource('http://localhost:${RELOAD_PORT}/live').addEventListener('message', e => location.reload()))();
      `,
    },
    plugins: [
      ...(esbuildConfigBase.plugins || []),
      esbuildPluginLiveReload({ port: RELOAD_PORT }),
    ],
  };

  const esbuildConfig = isReloadMode ? esbuildConfigReload : esbuildConfigBase;

  if (isWatchMode) {
    context(esbuildConfig).then(async (ctx) => {
      console.log('Entering watch mode, meaning that if a file is changed, a rebuild occurs...');
      await ctx.watch();

      // Start esbuild's server on a random local port
      const { host, port } = await ctx.serve({ servedir: 'build' });

      // Start a proxy server on port 3000
      http.createServer((req, res) => {
        const options = {
          hostname: host,
          port: port,
          path: req.url,
          method: req.method,
          headers: req.headers,
        };

        // Forward each incoming request to esbuild
        const proxyReq = http.request(options, (proxyRes) => {
          // If esbuild returns "not found", send a custom 404 page
          if (proxyRes.statusCode === 404) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>A custom 404 page</h1>');
            return;
          }

          // Otherwise, forward the response from esbuild to the client
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res, { end: true });
        });

        // Forward the body of the request to esbuild
        req.pipe(proxyReq, { end: true });
      }).listen(3000, () => {
        console.log('Proxy server running at http://localhost:3000');
      });
    });
  } else {
    console.log('Building...');
    esbuild.build(esbuildConfig).catch((err) => {
      console.error('Error during build:', err);
      process.exit(1);
    });
  }
}

startServer().catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});