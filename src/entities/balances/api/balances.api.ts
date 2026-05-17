import type { FindAccountByQuery } from '@/entities/accounts';
import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type Balance,
  balanceSchema,
  type UpsertBalanceDto,
  upsertBalanceSchema,
} from '../model/schemas';

class BalancesApi {
  private readonly client = apiClient;

  create = async (payload: UpsertBalanceDto) => {
    const body = upsertBalanceSchema.parse(payload);
    const response = await this.client.post<Balance>('/balances', body);

    return parseWithSchema(balanceSchema, response.data);
  };

  find = async (params?: FindAccountByQuery) => {
    const { data } = await this.client.get<Balance>('/balances', { params });

    return parseWithSchema(balanceSchema, data);
  };
}

export const balancesApi = new BalancesApi();
