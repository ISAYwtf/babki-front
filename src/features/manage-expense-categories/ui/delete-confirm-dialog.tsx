import { AlertDialog } from '@/shared/ui/alert-dialog';
import { Button } from '@/shared/ui/button';
import { Typography } from '@/shared/ui/typography';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface DeleteConfirmDialogProps {
  open: boolean;
  pending: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({
  open,
  pending,
  error,
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
      // The mutation keeps its error so the confirmation can explain the failure.
    }
  };

  return (
    <AlertDialog.Base open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Content className="max-w-sm">
        <AlertDialog.Header>
          <AlertDialog.Title>{t('expenseCategories.management.delete.title')}</AlertDialog.Title>
        </AlertDialog.Header>
        <AlertDialog.Body>
          <AlertDialog.Description>
            {t('expenseCategories.management.delete.description')}
          </AlertDialog.Description>
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
            {t('expenseCategories.management.delete.cancel')}
          </AlertDialog.Close>
          <Button.Base
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={pending}
          >
            {pending
              ? t('expenseCategories.management.delete.deleting')
              : t('expenseCategories.management.delete.confirm')}
          </Button.Base>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Base>
  );
};
