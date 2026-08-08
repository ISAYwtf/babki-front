import { useDeleteTransactionMutation } from '@/entities/transactions';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Menu } from '@base-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  type FC,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  refreshExpenseDeletionQueries,
  removeExpenseFromCachedLists,
} from '../model/cache';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

interface ExpenseActionsProps {
  transactionId: string;
  accountId: string;
}

export const ExpenseActions: FC<ExpenseActionsProps> = ({
  transactionId,
  accountId,
}) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteTransactionMutation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleDeleteRequest = () => {
    deleteMutation.reset();
    setDeleteOpen(true);
  };

  const handleCancel = () => {
    if (deleteMutation.isPending) return;
    setDeleteOpen(false);
    deleteMutation.reset();
  };

  const handleConfirm = async () => {
    await deleteMutation.mutateAsync({ transactionId });
    setDeleteOpen(false);
    removeExpenseFromCachedLists(queryClient, transactionId);
    refreshExpenseDeletionQueries(queryClient, accountId);
  };

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          ref={triggerRef}
          aria-label={t('expenses.actions.open')}
          render={<Button.Icon type="button" />}
        >
          <Icon icon="IcDots20" />
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner
            align="end"
            sideOffset={4}
            className="z-50 outline-none"
          >
            <Menu.Popup
              className="rounded-lg border bg-popover p-1 shadow-md outline-none"
            >
              <Menu.Item
                aria-label={t('expenses.actions.delete')}
                label={t('expenses.actions.delete')}
                className="
                  flex h-8 cursor-default items-center gap-2 rounded-md px-2 text-sm text-destructive outline-none
                  data-highlighted:bg-destructive/10
                "
                onClick={handleDeleteRequest}
              >
                <Icon icon="IcCross24" />
                <span>{t('expenses.actions.deleteLabel')}</span>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      <DeleteConfirmDialog
        open={deleteOpen}
        pending={deleteMutation.isPending}
        error={deleteMutation.isError ? t('expenses.errors.delete') : undefined}
        finalFocus={triggerRef}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </>
  );
};
