interface EndSessionDependencies {
  clearToken: () => void;
  clearCache: () => void;
  navigateToLogin: (redirect: string | null) => void;
}

const hasControlCharacter = (value: string) => Array.from(value).some((character) => {
  const code = character.charCodeAt(0);
  return code <= 31 || code === 127;
});

export const getSafeInternalRedirect = (value: unknown): string | null => {
  if (
    typeof value !== 'string'
    || !value.startsWith('/')
    || value.startsWith('//')
    || value.includes('\\')
    || hasControlCharacter(value)
  ) {
    return null;
  }

  try {
    decodeURI(value);
    return value;
  } catch {
    return null;
  }
};

export const endSession = (
  dependencies: EndSessionDependencies,
  redirect?: unknown,
) => {
  dependencies.clearToken();
  dependencies.clearCache();
  dependencies.navigateToLogin(getSafeInternalRedirect(redirect));
};
