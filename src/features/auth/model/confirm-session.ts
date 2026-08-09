export const confirmSession = async (
  accessToken: string | null,
  loadCurrentUser: () => Promise<unknown>,
) => {
  if (!accessToken) {
    return false;
  }

  try {
    return Boolean(await loadCurrentUser());
  } catch {
    return false;
  }
};
