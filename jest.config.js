/** @type {import('jest').Config} */
const config = {
  rootDir: '.',
  testEnvironment: 'node',
  moduleDirectories: ['node_modules', '<rootDir>/translate'],
  moduleFileExtensions: ['js'],
  // testMatch: ['<rootDir>/**/*(*.)test.js'],
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
    '/jest.config.js'
  ],
  reporters: ['default'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '/dist/', '/output/'],
  transform: {
    '^.+\\.js$': ['babel-jest']
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/(?!node-fetch)/.*'],
  verbose: false
};

export default config;
