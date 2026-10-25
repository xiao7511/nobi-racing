import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import ts from 'typescript-eslint';
import globals from 'globals';

export default ts.config(
  { ignores: ['**/node_modules/**', '**/dist/**', '**/target/**', '.cache/**', '.tools/**', 'playwright-report/**', 'test-results/**', 'packages/contracts/src/generated/validators.mjs'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.{js,mjs,ts,vue}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] },
  },
  { files: ['**/*.vue'], languageOptions: { parserOptions: { parser: ts.parser } } },
);
