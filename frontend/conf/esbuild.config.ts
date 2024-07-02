const { sassPlugin } = require('esbuild-sass-plugin');

const createEsbuildDefaultConfig = (PATHS, additionalProperties = {}, additionalPlugins = []) => ({    
    bundle: true,
    format: 'esm',
    loader: { '.js': 'jsx', '.ts': 'tsx' },
    logLevel: 'info',
    plugins: [
      sassPlugin()
    ],
    target: ['es2020'],
    ...additionalProperties
})

module.exports = {
    createEsbuildDefaultConfig,
}
