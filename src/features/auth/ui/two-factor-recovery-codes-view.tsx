import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Typography } from '@/shared/ui/typography';
import {
  canStartClipboardCopy,
  canDismissRecoveryCodes,
  copyRecoveryCodes,
  createRecoveryCodeFields,
  type RecoveryCopyResult,
} from '../model/recovery-codes';

interface TwoFactorRecoveryCodesViewProps {
  codes: string[];
  onAcknowledgeChange: (acknowledged: boolean) => void;
  onDone: () => void;
}

export function TwoFactorRecoveryCodesView({
  codes,
  onAcknowledgeChange,
  onDone,
}: TwoFactorRecoveryCodesViewProps) {
  const { t } = useTranslation();
  const [acknowledged, setAcknowledged] = useState(false);
  const [copyResult, setCopyResult] = useState<RecoveryCopyResult>('idle');
  const codeFields = createRecoveryCodeFields(codes);
  const fieldsetRef = useRef<HTMLFieldSetElement>(null);
  const copyPendingRef = useRef(false);

  useEffect(() => {
    fieldsetRef.current?.focus();
  }, []);

  const handleAcknowledgement = (checked: boolean) => {
    setAcknowledged(checked);
    onAcknowledgeChange(checked);
  };

  const handleCopy = async () => {
    if (!canStartClipboardCopy(copyResult) || copyPendingRef.current) return;
    copyPendingRef.current = true;
    setCopyResult('copying');
    try {
      setCopyResult(await copyRecoveryCodes(
        codes,
        (text) => navigator.clipboard.writeText(text),
      ));
    } finally {
      copyPendingRef.current = false;
    }
  };

  return (
    <div>
      <Dialog.Description>{t('auth.twoFactor.recovery.description')}</Dialog.Description>
      <div className="mt-5 flex min-w-0 flex-col gap-4">
        <fieldset
          ref={fieldsetRef}
          className="rounded-lg border bg-muted/40 p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
          tabIndex={-1}
        >
          <legend className="px-1 text-sm font-medium">
            {t('auth.twoFactor.recovery.listLabel')}
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {codeFields.map(({ code, id, number }) => (
              <div className="min-w-0" key={id}>
                <label className="sr-only" htmlFor={id}>
                  {t('auth.twoFactor.recovery.codeLabel', { number })}
                </label>
                <Input.Base
                  id={id}
                  className="h-9 min-w-0 select-all px-2 font-mono text-[10px]"
                  type="text"
                  value={code}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                />
              </div>
            ))}
          </div>
        </fieldset>
        <Button.Base
          type="button"
          variant="outline"
          disabled={copyResult === 'copying'}
          aria-busy={copyResult === 'copying'}
          onClick={handleCopy}
        >
          {t(copyResult === 'copying'
            ? 'auth.twoFactor.recovery.copying'
            : 'auth.twoFactor.recovery.copyAll')}
        </Button.Base>
        {copyResult !== 'idle' && (
          <Typography.Caption1
            className={copyResult === 'error' ? 'text-destructive' : 'text-muted-foreground'}
            role="status"
            aria-live="polite"
          >
            {t(copyResult === 'copying'
              ? 'auth.twoFactor.recovery.copying'
              : copyResult === 'copied'
                ? 'auth.twoFactor.recovery.copied'
                : 'auth.twoFactor.recovery.copyError')}
          </Typography.Caption1>
        )}
        <label className="flex cursor-pointer items-start gap-3" htmlFor="recovery-codes-saved">
          <input
            id="recovery-codes-saved"
            className="mt-1 size-4 shrink-0 accent-primary"
            type="checkbox"
            checked={acknowledged}
            onChange={(event) => handleAcknowledgement(event.target.checked)}
          />
          <Typography.Body3>{t('auth.twoFactor.recovery.acknowledge')}</Typography.Body3>
        </label>
        {!acknowledged && (
          <Typography.Caption1 className="text-muted-foreground">
            {t('auth.twoFactor.recovery.saveRequired')}
          </Typography.Caption1>
        )}
      </div>
      <Dialog.Footer>
        <Button.Base
          type="button"
          disabled={!canDismissRecoveryCodes(acknowledged)}
          onClick={onDone}
        >
          {t('auth.twoFactor.recovery.done')}
        </Button.Base>
      </Dialog.Footer>
    </div>
  );
}
