import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y-x';

const shared = {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  // Content comes from Zod-validated collections; `any` means the contract was bypassed.
  '@typescript-eslint/no-explicit-any': 'error',
  'no-console': ['warn', { allow: ['warn', 'error'] }],
};

export default [
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'public/**'] },

  js.configs.recommended,

  // Scoped to real TS files: unscoped, these blocks also claim `.astro` and
  // replace the astro parser, which breaks frontmatter parsing.
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ['**/*.{ts,tsx,mjs,js}'] })),

  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],

  {
    files: ['**/*.astro'],
    plugins: { '@typescript-eslint': tseslint.plugin },
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.astro'], sourceType: 'module' },
      globals: { ...globals.browser },
    },
    rules: shared,
  },

  {
    files: ['**/*.{ts,tsx,mjs,js}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: shared,
  },

  {
    files: ['**/*.tsx'],
    plugins: { 'jsx-a11y-x': jsxA11y },
    rules: jsxA11y.configs.recommended.rules,
  },

  { files: ['scripts/**/*.mjs'], rules: { 'no-console': 'off' } },
];
