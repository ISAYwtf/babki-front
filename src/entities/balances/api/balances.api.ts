import { apiClient, parseWithSchema } from '@/shared/api';
import {
  balanceSchema,
  type UpsertBalanceDto,
  upsertBalanceSchema,
} from '../model/schemas';

class BalancesApi {
  private readonly client = apiClient;

  async findByUserId(userId: string) {
    const response = await this.client.get(`/users/${userId}/balance`);

    return parseWithSchema(balanceSchema, response.data);
  }

  async upsert(userId: string, payload: UpsertBalanceDto) {
    const body = upsertBalanceSchema.parse(payload);
    const response = await this.client.put(`/users/${userId}/balance`, body);

    return parseWithSchema(balanceSchema, response.data);
  }
}

export const balancesApi = new BalancesApi();
