import { apiClient, parseWithSchema } from '@/shared/api';
import {
  accountSchema,
  type UpsertAccountDto,
  upsertAccountSchema,
} from '../model/schemas';

class AccountsApi {
  private readonly client = apiClient;

  async findByUserId(userId: string, asOfDate?: string) {
    const { data } = await this.client.get(`/users/${userId}/accounts`, {
      params: { asOfDate },
    });

    if (!data) {
      return null;
    }

    return parseWithSchema(accountSchema, data);
  }

  async upsert(userId: string, payload: UpsertAccountDto) {
    const body = upsertAccountSchema.parse(payload);
    const response = await this.client.put(`/users/${userId}/accounts`, body);

    return parseWithSchema(accountSchema, response.data);
  }
}

export const accountsApi = new AccountsApi();
