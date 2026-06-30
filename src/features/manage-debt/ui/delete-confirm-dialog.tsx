import { type useDeleteDebtMutation } from '@/entities/debts';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Typography } from '@/shared/ui/typography';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { getMutationErrorMessage } from '../model/errors';

interface DeleteConfirmDialogProps {
  open: boolean;
  debtId: string;
  mutation: ReturnType<typeof useDeleteDebtMutation>;
  onCancel: () => void;
  onConfirmed: () => void;
}

export const DeleteConfirmDialog: FC<DeleteConfirmDialogProps> = ({
  open,
  debtId,
  mutation,
  onCancel,
  onConfirmed,
}) => {
  const { t } = useTranslation();
  const mutationError = getMutationErrorMessage(mutation.error);

  const handleOpenChange = (next: boolean) => {
    if (mutation.isPending) return;
    if (!next) {
      mutation.reset();
      onCancel();
    }
  };

  const handleConfirm = async () => {
    await mutation.mutateAsync({ debtId });
    mutation.reset();
    onConfirmed();
  };

  return (
    <Dialog.Base open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content className="max-w-sm">
        <Dialog.Header>
          <Dialog.Title>{t('debts.delete.title')}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          <Dialog.Description>{t('debts.delete.description')}</Dialog.Description>
          {mutationError && (
            <Typography.Caption1 className="text-destructive">{mutationError}</Typography.Caption1>
          )}
        </Dialog.Body>
        <Dialog.Footer>
          <Button.Base
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={mutation.isPending}
          >
            {t('debts.delete.cancel')}
          </Button.Base>
          <Button.Base
            variant="destructive"
            onClick={handleConfirm}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? t('debts.delete.deleting') : t('debts.delete.confirm')}
          </Button.Base>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Base>
  );
};
