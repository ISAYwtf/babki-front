import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type CreateIncomeDto,
  createIncomeSchema,
  incomeRevenueSchema,
  incomeSchema,
  incomesPaginatedResponseSchema,
  type ListIncomesQuery,
  listIncomesQuerySchema,
  type UpdateIncomeDto,
  updateIncomeSchema,
} from '../model/schemas';

class IncomesApi {
  private readonly client = apiClient;

  async create(userId: string, payload: CreateIncomeDto) {
    const body = createIncomeSchema.parse(payload);
    const response = await this.client.post(`/users/${userId}/incomes`, body);

    return parseWithSchema(incomeSchema, response.data);
  }

  async findAll(userId: string, query: ListIncomesQuery = {}) {
    const params = listIncomesQuerySchema.parse(query);
    const response = await this.client.get(`/users/${userId}/incomes`, { params });

    return parseWithSchema(incomesPaginatedResponseSchema, response.data);
  }

  async findTotalRevenue(userId: string, query: ListIncomesQuery = {}) {
    const params = listIncomesQuerySchema.parse(query);
    const response = await this.client.get(`/users/${userId}/incomes/revenue`, { params });

    return parseWithSchema(incomeRevenueSchema, response.data);
  }

  async findOne(userId: string, incomeId: string) {
    const response = await this.client.get(`/users/${userId}/incomes/${incomeId}`);

    return parseWithSchema(incomeSchema, response.data);
  }

  async update(userId: string, incomeId: string, payload: UpdateIncomeDto) {
    const body = updateIncomeSchema.parse(payload);
    const response = await this.client.patch(`/users/${userId}/incomes/${incomeId}`, body);

    return parseWithSchema(incomeSchema, response.data);
  }

  async remove(userId: string, incomeId: string) {
    await this.client.delete(`/users/${userId}/incomes/${incomeId}`);
  }
}

export const incomesApi = new IncomesApi();
