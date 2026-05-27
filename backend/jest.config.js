module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  maxWorkers: 1,
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/migrations/**',
    '!src/scripts/**',
    '!src/**/index.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/teardown.js'],
  coverageDirectory: 'coverage'
};
