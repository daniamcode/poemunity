module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/src/**/*.test.js', '**/src/**/*.spec.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/*.spec.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000
}
