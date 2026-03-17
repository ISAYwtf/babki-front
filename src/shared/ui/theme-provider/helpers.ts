import type {
  ResolvedTheme,
  Theme,
} from './types';

export const COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
export const THEME_VALUES: Theme[] = ['dark', 'light', 'system'];

export const isTheme = (value: string | null): value is Theme => {
  if (value === null) {
    return false;
  }

  return THEME_VALUES.includes(value as Theme);
};

export function getSystemTheme(): ResolvedTheme {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return 'dark';
  }

  return 'light';
}

export const disableTransitionsTemporarily = () => {
  const style = document.createElement('style');
  style.appendChild(
    document.createTextNode(
      '*,*::before,*::after{-webkit-transition:none!important;transition:none!important}',
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove();
      });
    });
  };
};

export const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']",
  );
  return !!editableParent;
};

export const getToggledTheme = (currentTheme: Theme) => {
  if (currentTheme === 'dark') {
    return 'light';
  }
  if (currentTheme === 'light') {
    return 'dark';
  }
  return getSystemTheme() === 'dark'
    ? 'light'
    : 'dark';
};
