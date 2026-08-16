export type RecoveryCopyResult = 'idle' | 'copying' | 'copied' | 'error';

export interface RecoveryCodesState {
  recoveryCodes: string[] | null;
  acknowledged: boolean;
  copyResult: RecoveryCopyResult;
}

export interface RecoveryCodeField {
  code: string;
  id: string;
  number: number;
}

export const createRecoveryCodeFields = (codes: string[]): RecoveryCodeField[] => (
  codes.map((code, index) => ({
    code,
    id: `two-factor-recovery-code-${index + 1}`,
    number: index + 1,
  }))
);

export const formatRecoveryCodesForCopy = (codes: string[]) => codes.join('\n');

export const canDismissRecoveryCodes = (acknowledged: boolean) => acknowledged;

export const canStartClipboardCopy = (copyResult: RecoveryCopyResult) => (
  copyResult !== 'copying'
);

export const copyRecoveryCodes = async (
  codes: string[],
  writeText: (text: string) => Promise<void>,
): Promise<Exclude<RecoveryCopyResult, 'idle' | 'copying'>> => {
  try {
    await writeText(formatRecoveryCodesForCopy(codes));
    return 'copied';
  } catch {
    return 'error';
  }
};

export const clearRecoveryCodes = (
  _state: RecoveryCodesState,
): RecoveryCodesState => ({
  recoveryCodes: null,
  acknowledged: false,
  copyResult: 'idle',
});
