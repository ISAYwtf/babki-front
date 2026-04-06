import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type CreateExpenseDto,
  createExpenseSchema,
  expenseSchema,
  expensesPaginatedResponseSchema,
  type ListExpensesQuery,
  listExpensesQuerySchema,
  type UpdateExpenseDto,
  updateExpenseSchema,
} from '../model/schemas';

class ExpensesApi {
  private readonly client = apiClient;

  async create(userId: string, payload: CreateExpenseDto) {
    const body = createExpenseSchema.parse(payload);
    const response = await this.client.post(`/users/${userId}/expenses`, body);

    return parseWithSchema(expenseSchema, response.data);
  }

  async findAll(userId: string, query: ListExpensesQuery = {}) {
    const params = listExpensesQuerySchema.parse(query);
    const response = await this.client.get(`/users/${userId}/expenses`, { params });

    return parseWithSchema(expensesPaginatedResponseSchema, response.data);
  }

  async findOne(userId: string, expenseId: string) {
    const response = await this.client.get(`/users/${userId}/expenses/${expenseId}`);

    return parseWithSchema(expenseSchema, response.data);
  }

  async update(userId: string, expenseId: string, payload: UpdateExpenseDto) {
    const body = updateExpenseSchema.parse(payload);
    const response = await this.client.patch(`/users/${userId}/expenses/${expenseId}`, body);

    return parseWithSchema(expenseSchema, response.data);
  }

  async remove(userId: string, expenseId: string) {
    await this.client.delete(`/users/${userId}/expenses/${expenseId}`);
  }
}

export const expensesApi = new ExpensesApi();
