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

  async create(payload: CreateIncomeDto) {
    const body = createIncomeSchema.parse(payload);
    const response = await this.client.post('/incomes', body);

    return parseWithSchema(incomeSchema, response.data);
  }

  async findAll(query: ListIncomesQuery = {}) {
    const params = listIncomesQuerySchema.parse(query);
    const response = await this.client.get('/incomes', { params });

    return parseWithSchema(incomesPaginatedResponseSchema, response.data);
  }

  async findTotalRevenue(query: ListIncomesQuery = {}) {
    const params = listIncomesQuerySchema.parse(query);
    const response = await this.client.get('/incomes/revenue', { params });

    return parseWithSchema(incomeRevenueSchema, response.data);
  }

  async findOne(incomeId: string) {
    const response = await this.client.get(`/incomes/${incomeId}`);

    return parseWithSchema(incomeSchema, response.data);
  }

  async update(incomeId: string, payload: UpdateIncomeDto) {
    const body = updateIncomeSchema.parse(payload);
    const response = await this.client.patch(`/incomes/${incomeId}`, body);

    return parseWithSchema(incomeSchema, response.data);
  }

  async remove(incomeId: string) {
    await this.client.delete(`/incomes/${incomeId}`);
  }
}

export const incomesApi = new IncomesApi();
