import type { FindAccountByQuery } from '@/entities/accounts';
import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type Saving,
  savingSchema,
} from '../model/schemas';

class SavingsApi {
  private readonly client = apiClient;

  create = async () => {
    const response = await this.client.post<Saving>('/savings');
    return parseWithSchema(savingSchema, response.data);
  };

  find = async (params?: FindAccountByQuery) => {
    const response = await this.client.get<Saving>('/savings', { params });
    return parseWithSchema(savingSchema, response.data);
  };
}

export const savingsApi = new SavingsApi();
