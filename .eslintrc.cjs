module.exports = {
  root: true,

  parser: '@typescript-eslint/parser',

  plugins: ['@typescript-eslint'],

  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],

  parserOptions: {
    project: './tsconfig.eslint.json'
  },

  ignorePatterns: ['package.json'],

  rules: {
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-this-alias': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',

    'prefer-arrow-callback': 'off',
    'no-plusplus': 'off',
    'object-curly-spacing': 'off',
    'arrow-parens': 'off',
    'comma-dangle': 'off',
    'indent': 'off',
    'no-console': 'off',
    'no-unused-expressions': 'off',
    'object-curly-newline': 'warn',
    'no-prototype-builtins': 'warn',
    'quotes': 'off',
    'prefer-const': 'warn',
    'no-async-promise-executor': 'warn',
    'no-constant-condition': 'warn',

    'max-len': [
      'warn',
      { code: 140, tabWidth: 2, ignoreUrls: true },
    ],

    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],

    'no-use-before-define': ['warn', { functions: false }],

    'no-restricted-properties': [
      'error',
      { property: 'lenght' },
    ],

    'no-mixed-operators': [
      'error',
      { allowSamePrecedence: true },
    ],

    'no-underscore-dangle': [
      'warn',
      {
        allow: ['__', '_id', '_watcher'],
      },
    ],
  },
};
