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

  async create(payload: CreateExpenseDto) {
    const body = createExpenseSchema.parse(payload);
    const response = await this.client.post('/expenses', body);

    return parseWithSchema(expenseSchema, response.data);
  }

  async findAll(query: ListExpensesQuery = {}) {
    const params = listExpensesQuerySchema.parse(query);
    const response = await this.client.get('/expenses', { params });

    return parseWithSchema(expensesPaginatedResponseSchema, response.data);
  }

  async findOne(expenseId: string) {
    const response = await this.client.get(`/expenses/${expenseId}`);

    return parseWithSchema(expenseSchema, response.data);
  }

  async update(expenseId: string, payload: UpdateExpenseDto) {
    const body = updateExpenseSchema.parse(payload);
    const response = await this.client.patch(`/expenses/${expenseId}`, body);

    return parseWithSchema(expenseSchema, response.data);
  }

  async remove(expenseId: string) {
    await this.client.delete(`/expenses/${expenseId}`);
  }
}

export const expensesApi = new ExpensesApi();
