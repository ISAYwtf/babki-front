import type { Theme } from '@/shared/ui/theme-provider/types';
import { createContext } from 'react';

export interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeProviderContext = createContext<
  ThemeProviderState | undefined
>(undefined);
