import globals from 'globals';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import { fixupPluginRules } from '@eslint/compat';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default tseslint.config([
  {
    ignores: ['**/dist/', '**/build/', '**/coverage/*'],
  },
  eslint.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  },
  {
    plugins: {
      'react-hooks': fixupPluginRules(eslintPluginReactHooks),
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
        ...globals.node,
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      ...eslintPluginReactHooks.configs.recommended.rules,
    },
  },
]);
