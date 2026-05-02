import { apiClient, parseWithSchema } from '@/shared/api';
import { savingSchema } from '../model/schemas';

class SavingsApi {
  private readonly client = apiClient;

  async findByUserId() {
    const { data } = await this.client.get('/savings');

    if (!data) {
      return null;
    }

    return parseWithSchema(savingSchema, data);
  }

  async create() {
    const response = await this.client.post('/savings');

    return parseWithSchema(savingSchema, response.data);
  }

  async remove(savingId: string) {
    await this.client.delete(`/savings/${savingId}`);
  }
}

export const savingsApi = new SavingsApi();
