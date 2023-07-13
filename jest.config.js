/** @type {import('jest').Config} */
const config = {
  rootDir: '.',
  // testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/translate'],
  moduleFileExtensions: ['js'],
  testMatch: ['<rootDir>/**/*(*.)test.js'],
  collectCoverage: true,
  collectCoverageFrom: ['**/**.js'],
  coverageReporters: ['text-summary', 'html', 'lcov'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/output/',
    '/coverage/',
    '/babel.config.cjs',
    '/rollup.config.js',
    '/jest.config.js',
    './bin.js'
  ],
  reporters: ['default'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '/dist/', '/output/', './bin.js'],
  transform: {
    '^.+\\.js$': ['babel-jest']
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!node-fetch)/.*'],
  verbose: true,
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100
    }
  }
};

export default config;
