// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['node_modules/**', 'reports/**', 'playwright-report/**', 'test-results/**'],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
      // Playwright fixture functions always take `({}, use)` for a no-dependency fixture -- required
      // by the (fixtures, use) signature shape, not a mistake.
      'no-empty-pattern': 'off',
    },
  },
);
