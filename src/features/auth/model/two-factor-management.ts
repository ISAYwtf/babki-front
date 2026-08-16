import type {
  TwoFactorSetupResponse,
  TwoFactorStatus,
} from './auth-form';

export type TwoFactorManagementView = 'loading'
  | 'error'
  | 'disabled'
  | 'pending'
  | 'enabled'
  | 'setup'
  | 'confirmation'
  | 'recovery'
  | 'regeneration'
  | 'disable';

export interface TwoFactorManagementState {
  view: TwoFactorManagementView;
  provisioning: TwoFactorSetupResponse | null;
  recoveryCodes: string[] | null;
  recoveryCodesRemaining?: number;
}

const stateWithoutSecrets = (view: TwoFactorManagementView): TwoFactorManagementState => ({
  view,
  provisioning: null,
  recoveryCodes: null,
});

export const createTwoFactorManagementState = () => stateWithoutSecrets('loading');

export const getTwoFactorStatusAfterSetup = (): TwoFactorStatus => ({
  status: 'pending',
  recoveryCodesRemaining: 0,
});

export const showManagementError = () => stateWithoutSecrets('error');

export const showTwoFactorStatus = (status: TwoFactorStatus): TwoFactorManagementState => (
  status.status === 'enabled'
    ? {
      ...stateWithoutSecrets('enabled'),
      recoveryCodesRemaining: status.recoveryCodesRemaining,
    }
    : stateWithoutSecrets(status.status)
);

export const startSetupAuthorization = () => stateWithoutSecrets('setup');

export const showProvisioning = (
  provisioning: TwoFactorSetupResponse,
): TwoFactorManagementState => ({
  view: 'confirmation',
  provisioning,
  recoveryCodes: null,
});

export const restartSetup = () => stateWithoutSecrets('setup');

export const expireProvisioning = () => stateWithoutSecrets('pending');

export const startRecoveryRegeneration = (
  recoveryCodesRemaining: number,
): TwoFactorManagementState => ({
  ...stateWithoutSecrets('regeneration'),
  recoveryCodesRemaining,
});

export const startDisable = (
  recoveryCodesRemaining: number,
): TwoFactorManagementState => ({
  ...stateWithoutSecrets('disable'),
  recoveryCodesRemaining,
});

export const showRecoveryCodes = (recoveryCodes: string[]): TwoFactorManagementState => ({
  view: 'recovery',
  provisioning: null,
  recoveryCodes,
});

export const clearTwoFactorSecrets = (
  _state: TwoFactorManagementState,
): Pick<TwoFactorManagementState, 'provisioning' | 'recoveryCodes'> => ({
  provisioning: null,
  recoveryCodes: null,
});

export const canDismissTwoFactorManagement = (
  state: TwoFactorManagementState,
  recoveryAcknowledged: boolean,
  lifecyclePending = false,
) => !lifecyclePending && (state.view !== 'recovery' || recoveryAcknowledged);

export const canStartTwoFactorLifecycle = (lifecyclePending: boolean) => (
  !lifecyclePending
);

export const getTwoFactorManagementCloseCleanup = (
  open: boolean,
): TwoFactorManagementState | null => (
  open ? null : createTwoFactorManagementState()
);
