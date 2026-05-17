import { z } from 'zod';
import {
  dateStringSchema,
  entityMetaSchema,
} from '@/shared/api';

export const snapshotSchema = z
  .object({
    accountId: z.string(),
    amount: z.number().min(0),
    date: dateStringSchema,
  })
  .extend(entityMetaSchema.shape);

export const SnapshotFindByQuerySchema = z.object({
  accountId: z.string(),
  date: dateStringSchema,
});

export type Snapshot = z.infer<typeof snapshotSchema>;
export type SnapshotFindByQuery = z.infer<typeof SnapshotFindByQuerySchema>;
