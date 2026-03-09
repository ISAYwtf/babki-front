import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import { configs, helpers, plugins } from 'eslint-config-airbnb-extended';
import reactRefresh from 'eslint-plugin-react-refresh';

const gitignorePath = path.resolve('.', '.gitignore');

const jsConfig = defineConfig([
  {
    name: 'js/config',
    ...js.configs.recommended,
  },
  plugins.stylistic,
  plugins.importX,
  ...configs.base.recommended,
]);

const reactConfig = defineConfig([
  plugins.react,
  plugins.reactHooks,
  plugins.reactA11y,
  reactRefresh.configs.vite,
  ...configs.react.recommended,
]);

const typescriptConfig = defineConfig([
  plugins.typescriptEslint,
  ...configs.base.typescript,
  ...configs.react.typescript,
]);

const { jsFiles, tsFiles } = helpers.extensions;

export default defineConfig([
  // Ignore files and folders listed in .gitignore
  includeIgnoreFile(gitignorePath),
  // JavaScript config
  ...jsConfig,
  // React config
  ...reactConfig,
  // TypeScript config
  ...typescriptConfig,
  {
    files: [...jsFiles, ...tsFiles],
    rules: {
      'react/react-in-jsx-scope': 0,
      'react/function-component-definition': [2, {
        namedComponents: ['function-declaration', 'function-expression', 'arrow-function'],
        unnamedComponents: ['function-expression', 'arrow-function'],
      }],
      'react/button-has-type': 0,
      'react/require-default-props': 0,
      'jsx-a11y/heading-has-content': 0,
      'jsx-a11y/anchor-has-content': 0,
      'import-x/prefer-default-export': 0,
      'import-x/namespace': [2, { allowComputed: true }],
      '@stylistic/jsx-max-props-per-line': [2, { maximum: 2 }],
      '@stylistic/max-len': [2, { code: 120, tabWidth: 2 }],
    },
  },
]);
