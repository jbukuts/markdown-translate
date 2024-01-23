module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier', 'jest'],
  parserOptions: { ecmaVersion: 2020 },
  rules: {
    indent: ['error', 2],
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    'no-unused-vars': ['error', { destructuredArrayIgnorePattern: '^_' }],
    'one-var': [2, 'never'],
    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': ['off', { packageDir: [''] }]
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    'jest/globals': true
  }
};
