import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type Snapshot,
  type SnapshotFindByQuery,
  snapshotSchema,
} from '../model/schemas';

class SnapshotsApi {
  private readonly client = apiClient;

  async findBy(params: SnapshotFindByQuery) {
    const { accountId, date } = params;
    const { data } = await this.client.get<Snapshot>(`/accounts/${accountId}/snapshots`, {
      params: { date },
    });

    return parseWithSchema(snapshotSchema, data);
  }
}

export const snapshotsApi = new SnapshotsApi();
