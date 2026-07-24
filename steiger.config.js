import { defineConfig } from 'steiger';
import fsd from '@feature-sliced/steiger-plugin';

const config = defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ['**/routeTree.gen.ts'],
    rules: {
      'fsd/insignificant-slice': 'off',
    },
  },
  {
    files: ['./src/{entities,features,pages,widgets}/**'],
    rules: {
      'fsd/import-locality': 'error',
    },
  },
  {
    files: ['./src/shared/assets/**'],
    rules: {
      'fsd/segments-by-purpose': 'off',
    },
  },
  {
    files: ['./src/shared/types/**'],
    rules: {
      'fsd/public-api': 'off',
      'fsd/segments-by-purpose': 'off',
    },
  },
]);

export default config;
