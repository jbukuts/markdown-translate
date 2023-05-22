module.exports = {
  extends: ['airbnb', 'prettier'],
  plugins: ['prettier'],
  rules: {
    indent: ['error', 2],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto'
      }
    ],
    'no-unused-vars': [
      'error',
      {
        destructuredArrayIgnorePattern: '^_'
      }
    ],
    'one-var': [2, 'never'],
    'no-underscore-dangle': 'off',
    'import/no-extraneous-dependencies': [
      'off',
      {
        packageDir: ['']
      }
    ]
  },
  env: {
    browser: true,
    node: true
  }
};
