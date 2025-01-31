export default [
  // ESLint recommended configuration directly added to the array
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
        structuredClone: 'readonly'
      }
    },
    rules: {
      'no-console': 'error',
      'eqeqeq': 'error',
      'no-unused-vars': 'warn',
      'no-debugger': 'error',
      'no-undef': 'error',
      'no-unreachable': 'error',
      'curly': 'error',
      'semi': ['error', 'always'],
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
    },
  },
];