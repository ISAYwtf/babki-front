import { apiClient, parseWithSchema } from '@/shared/api';
import {
  accountSchema,
  type UpsertAccountDto,
  upsertAccountSchema,
} from '../model/schemas';

class AccountsApi {
  private readonly client = apiClient;

  async findByDate(asOfDate?: string) {
    const { data } = await this.client.get('/accounts', {
      params: { asOfDate },
    });

    if (!data) {
      return null;
    }

    return parseWithSchema(accountSchema, data);
  }

  async create(payload: UpsertAccountDto) {
    const body = upsertAccountSchema.parse(payload);
    const response = await this.client.post('/accounts', body);

    return parseWithSchema(accountSchema, response.data);
  }

  async update(accountId: string, payload: Partial<UpsertAccountDto>) {
    const body = upsertAccountSchema.partial().parse(payload);
    const response = await this.client.patch(`/accounts/${accountId}`, body);

    return parseWithSchema(accountSchema, response.data);
  }

  async remove(accountId: string) {
    await this.client.delete(`/accounts/${accountId}`);
  }
}

export const accountsApi = new AccountsApi();
