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

  async create(userId: string, payload: CreateDebtDto) {
    const body = createDebtSchema.parse(payload);
    const response = await this.client.post(`/users/${userId}/debts`, body);

    return parseWithSchema(debtSchema, response.data);
  }

  async findAll(userId: string, query: ListDebtsQuery = {}) {
    const params = listDebtsQuerySchema.parse(query);
    const response = await this.client.get(`/users/${userId}/debts`, { params });

    return parseWithSchema(debtsPaginatedResponseSchema, response.data);
  }

  async findOne(userId: string, debtId: string) {
    const response = await this.client.get(`/users/${userId}/debts/${debtId}`);

    return parseWithSchema(debtSchema, response.data);
  }

  async update(userId: string, debtId: string, payload: UpdateDebtDto) {
    const body = updateDebtSchema.parse(payload);
    const response = await this.client.patch(`/users/${userId}/debts/${debtId}`, body);

    return parseWithSchema(debtSchema, response.data);
  }

  async repay(userId: string, debtId: string, payload: RepayDebtDto) {
    const body = repayDebtSchema.parse(payload);
    const response = await this.client.post(
      `/users/${userId}/debts/${debtId}/repayments`,
      body,
    );

    return parseWithSchema(debtSchema, response.data);
  }

  async remove(userId: string, debtId: string) {
    await this.client.delete(`/users/${userId}/debts/${debtId}`);
  }
}

export const debtsApi = new DebtsApi();
