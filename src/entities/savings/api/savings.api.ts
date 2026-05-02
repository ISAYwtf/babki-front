import { apiClient, parseWithSchema } from '@/shared/api';
import {
  savingSchema,
  type UpsertSavingDto,
  upsertSavingSchema,
} from '../model/schemas';

class SavingsApi {
  private readonly client = apiClient;

  async findByUserId(userId: string, asOfDate?: string) {
    const { data } = await this.client.get(`/users/${userId}/savings`, {
      params: { asOfDate },
    });

    if (!data) {
      return null;
    }

    return parseWithSchema(savingSchema, data);
  }

  async upsert(userId: string, payload: UpsertSavingDto) {
    const body = upsertSavingSchema.parse(payload);
    const response = await this.client.put(`/users/${userId}/savings`, body);

    return parseWithSchema(savingSchema, response.data);
  }
}

export const savingsApi = new SavingsApi();
