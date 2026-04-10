import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**', '*.config.js', '*.config.ts'],
  },

  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules
  ...tseslint.configs.recommended,

  // Main config for TypeScript/React files
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // React hooks rules
      ...reactHooks.configs.recommended.rules,

      // React refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // TypeScript strict rules - no any allowed (per CLAUDE.md)
      '@typescript-eslint/no-explicit-any': [
        'warn',
        { ignoreRestArgs: false },
      ],

      // Unused vars as warnings (common during development)
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Console usage
      'no-console': [
        'warn',
        { allow: ['warn', 'error', 'assert'] },
      ],

      // Code quality
      'no-duplicate-imports': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
    },
  },

  // Test file overrides
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },
);
