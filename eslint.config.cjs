const js = require('@eslint/js');
module.exports = [js.configs.recommended, {
  files: ['**/*.cjs'],
  languageOptions: { sourceType: 'commonjs', ecmaVersion: 2022, globals: {
    console: 'readonly', process: 'readonly', Buffer: 'readonly', URL: 'readonly',
    setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly',
    clearInterval: 'readonly', AbortController: 'readonly', AbortSignal: 'readonly', fetch: 'readonly',
    __dirname: 'readonly',
  } },
}];
