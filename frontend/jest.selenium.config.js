require('dotenv').config()

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/selenium'],
    testMatch: ['**/*.spec.ts'],
    testTimeout: 60_000,
    globals: {
        'ts-jest': {
            tsconfig: {
                module: 'commonjs',
                esModuleInterop: true,
                allowSyntheticDefaultImports: true,
            },
        },
    },
}
