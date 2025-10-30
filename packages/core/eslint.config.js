import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import vitestPlugin from '@vitest/eslint-plugin';

export default [
  {
    ignores: ['**/dist', '**/*.d.ts'],
  },

  ...tseslint.configs.recommended, // basic typescript rules

  prettierRecommended, // basic prettier rules using prettier.config.js

  eslintConfigPrettier, // disable all rules that config with prettier

  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: true,
      },
    },
  },

  {
    ...vitestPlugin.configs.recommended,
    files: ['src/**/*.spec.ts'],
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    rules: {
      'vitest/expect-expect': 'off',
    },
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
];
