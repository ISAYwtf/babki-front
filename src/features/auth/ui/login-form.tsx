import { useState } from 'react';
import { getSafeInternalRedirect } from '../model/session';
import {
  createLoginFlowState,
  restartPasswordLogin,
  setLoginFactorMethod,
  startTwoFactorChallenge,
} from '../model/login-flow';
import { CredentialsLoginForm } from './credentials-login-form';
import { RecoveryLoginForm } from './recovery-login-form';
import { TotpLoginForm } from './totp-login-form';

interface LoginFormProps {
  redirect?: string;
}

export function LoginForm({ redirect }: LoginFormProps) {
  const [flow, setFlow] = useState(() => (
    createLoginFlowState(getSafeInternalRedirect(redirect))
  ));

  if (flow.stage === 'credentials' || !flow.challenge) {
    return (
      <CredentialsLoginForm
        redirect={flow.redirect}
        onChallenge={(challenge) => {
          setFlow((current) => startTwoFactorChallenge(current, challenge));
        }}
      />
    );
  }

  const commonProps = {
    challenge: flow.challenge,
    redirect: flow.redirect,
    onRestart: () => setFlow((current) => restartPasswordLogin(current)),
  };

  if (flow.stage === 'recovery') {
    return (
      <RecoveryLoginForm
        {...commonProps}
        onUseTotp={(isPending) => {
          setFlow((current) => setLoginFactorMethod(current, 'totp', isPending));
        }}
      />
    );
  }

  return (
    <TotpLoginForm
      {...commonProps}
      onUseRecovery={(isPending) => {
        setFlow((current) => setLoginFactorMethod(current, 'recovery', isPending));
      }}
    />
  );
}
