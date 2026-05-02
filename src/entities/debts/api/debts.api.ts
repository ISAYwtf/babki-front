import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type CreateDebtDto,
  createDebtSchema,
  debtSchema,
  debtsPaginatedResponseSchema,
  type ListDebtsQuery,
  listDebtsQuerySchema,
  type RepayDebtDto,
  repayDebtSchema,
  type UpdateDebtDto,
  updateDebtSchema,
} from '../model/schemas';

class DebtsApi {
  private readonly client = apiClient;

  async create(payload: CreateDebtDto) {
    const body = createDebtSchema.parse(payload);
    const response = await this.client.post('/debts', body);

    return parseWithSchema(debtSchema, response.data);
  }

  async findAll(query: ListDebtsQuery = {}) {
    const params = listDebtsQuerySchema.parse(query);
    const response = await this.client.get('/debts', { params });

    return parseWithSchema(debtsPaginatedResponseSchema, response.data);
  }

  async findOne(debtId: string) {
    const response = await this.client.get(`/debts/${debtId}`);

    return parseWithSchema(debtSchema, response.data);
  }

  async update(debtId: string, payload: UpdateDebtDto) {
    const body = updateDebtSchema.parse(payload);
    const response = await this.client.patch(`/debts/${debtId}`, body);

    return parseWithSchema(debtSchema, response.data);
  }

  async repay(debtId: string, payload: RepayDebtDto) {
    const body = repayDebtSchema.parse(payload);
    const response = await this.client.post(
      `/debts/${debtId}/repayments`,
      body,
    );

    return parseWithSchema(debtSchema, response.data);
  }

  async remove(debtId: string) {
    await this.client.delete(`/debts/${debtId}`);
  }
}

export const debtsApi = new DebtsApi();
