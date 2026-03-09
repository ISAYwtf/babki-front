import { routePaths } from '@/shared/router';
import type { RouteObject } from 'react-router-dom';

export const mainPageRoute: RouteObject = {
  path: routePaths.main,
  lazy: async () => {
    const [Component] = await Promise.all([
      import('./main').then((module) => module.default),
    ]);
    return { Component };
  },
};
