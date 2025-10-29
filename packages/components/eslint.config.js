import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import vitestPlugin from '@vitest/eslint-plugin';
import { luminaPlugin } from '@arcgis/eslint-config/plugins/lumina';
import calcitePlugin from '@esri/eslint-plugin-calcite-components';

export default [
  {
    ignores: ['**/dist', '**/docs', '**/hydrate', '**/*.d.ts'],
  },

  ...tseslint.configs.recommended, // basic typescript rules

  prettierRecommended, // basic prettier rules using prettier.config.js

  eslintConfigPrettier, // disable all rules that config with prettier

  {
    files: ['src/*.{ts,tsx}'],
  },

  {
    plugins: {
      '@esri/calcite-components': calcitePlugin,
      lumina: luminaPlugin,
    },
  },

  /**
   * There are probably more calcite like rules that will be helpful in the future.
   * https://github.com/Esri/calcite-design-system/blob/dev/packages/calcite-components/eslint.config.mjs
   */
  {
    rules: {
      'lumina/member-ordering': 'warn',

      '@typescript-eslint/no-explicit-any': 'warn',

      '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: 'h' }],
    },
  },

  {
    ...vitestPlugin.configs.recommended,
    files: ['**/*.{e2e,spec}.ts', 'src/tests/**/*'],
    settings: {
      vitest: {
        typecheck: true,
      },
    },
    rules: {
      'vitest/expect-expect': 'off',
      '@esri/calcite-components/no-dynamic-createelement': 'off',
    },
    languageOptions: {
      globals: { ...globals.builtin, ...globals.browser, ...vitestPlugin.environments?.env.globals },
    },
  },
];
