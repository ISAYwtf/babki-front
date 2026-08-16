interface LoginChallenge {
  requiresTwoFactor: true;
  challengeToken: string;
  expiresAt: string;
}

type LoginStage = 'credentials' | 'recovery' | 'totp';

export interface LoginFlowState {
  stage: LoginStage;
  challenge: LoginChallenge | null;
  redirect: string | null;
  password: string;
}

export const createLoginFlowState = (redirect: string | null = null): LoginFlowState => ({
  stage: 'credentials',
  challenge: null,
  redirect,
  password: '',
});

export const startTwoFactorChallenge = (
  state: LoginFlowState,
  challenge: LoginChallenge,
): LoginFlowState => ({
  ...state,
  stage: 'totp',
  challenge,
  password: '',
});

export const setLoginFactorMethod = (
  state: LoginFlowState,
  method: 'recovery' | 'totp',
  isPending: boolean,
): LoginFlowState => {
  if (isPending || !state.challenge) {
    return state;
  }

  return {
    ...state,
    stage: method,
  };
};

export const restartPasswordLogin = (state: LoginFlowState): LoginFlowState => (
  createLoginFlowState(state.redirect)
);
