import { AlertDialog } from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { Typography } from '@/shared/ui/typography';
import type {
  FC,
  RefObject,
} from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmDialogProps {
  open: boolean;
  pending: boolean;
  error?: string;
  finalFocus: RefObject<HTMLButtonElement | null>;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({
  open,
  pending,
  error,
  finalFocus,
  onCancel,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const handleOpenChange = (nextOpen: boolean) => {
    if (pending || nextOpen) return;
    onCancel();
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch {
      // The mutation state keeps the retryable failure visible in this dialog.
    }
  };

  return (
    <AlertDialog.Base open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Content
        className="max-w-sm"
        finalFocus={finalFocus}
        onBackdropClick={pending ? undefined : onCancel}
      >
        <AlertDialog.Header>
          <AlertDialog.Title>{t('expenses.delete.title')}</AlertDialog.Title>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <AlertDialog.Description>{t('expenses.delete.description')}</AlertDialog.Description>
          {error && (
            <Typography.Caption1 className="text-destructive" role="alert">
              {error}
            </Typography.Caption1>
          )}
        </AlertDialog.Body>
        <AlertDialog.Footer>
          <AlertDialog.Close
            render={(
              <Button.Base
                type="button"
                variant="outline"
                disabled={pending}
              />
            )}
          >
            {t('expenses.delete.cancel')}
          </AlertDialog.Close>
          <Button.Base
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending ? t('expenses.delete.deleting') : t('expenses.delete.confirm')}
          </Button.Base>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Base>
  );
};
