interface AuthSessionResponse<TUser> {
  accessToken: string;
  user: TUser;
}

interface AuthSessionDependencies<TUser> {
  clearQueryData: () => void;
  setAccessToken: (accessToken: string) => void;
  resetUnauthorizedHandling: () => void;
  setCurrentUser: (user: TUser) => void;
}

export type AuthSessionTransition = 'identity-change' | 'same-user';

export const establishAuthSession = <TUser>(
  response: AuthSessionResponse<TUser>,
  dependencies: AuthSessionDependencies<TUser>,
  transition: AuthSessionTransition,
) => {
  if (transition === 'identity-change') {
    dependencies.clearQueryData();
  }

  dependencies.setAccessToken(response.accessToken);
  dependencies.resetUnauthorizedHandling();
  dependencies.setCurrentUser(response.user);
};
