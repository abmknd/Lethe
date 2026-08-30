import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

/**
 * THE LINT GATE.
 *
 * Scoped to the same place as `tsconfig.check.json`: the rebrand surface, the
 * design system and the generated icon set. `src/app` is legacy and is not
 * linted yet — a gate that is red on the day it lands is a gate everyone learns
 * to ignore.
 *
 * The rule set is deliberately about CORRECTNESS, not style. There is no
 * formatter in this repo and adding opinions about quote marks would bury the
 * findings that matter under a thousand that do not. What is on:
 *
 *   - the typescript-eslint recommended set, minus the rules `tsc` already owns
 *   - react-hooks, which catches the stale-closure and missing-dependency bugs
 *     that a typecheck cannot see
 *   - react-refresh, so a module cannot quietly break fast refresh
 *
 * `src/assets/system_icons` is GENERATED. It is linted for correctness but
 * exempted from the naming rule, because its component names come from Figma.
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'coverage', 'supabase/functions'] },
  {
    files: ['src/rebrand/**/*.{ts,tsx}', 'src/assets/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // `tsc` reports these with better messages and full type information, so
      // having them here too would double every finding.
      '@typescript-eslint/no-unused-vars': 'off',

      // The ones worth failing a build over.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'no-implicit-coercion': 'error',
    },
  },
);
