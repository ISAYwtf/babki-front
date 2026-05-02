import { apiClient, parseWithSchema } from '@/shared/api';
import {
  createExpenseCategorySchema,
  type CreateExpenseCategoryDto,
  expenseCategorySchema,
  type UpdateExpenseCategoryDto,
  updateExpenseCategorySchema,
} from '../model/schemas';

const zExpenseCategoryArraySchema = expenseCategorySchema.array();

class ExpenseCategoriesApi {
  private readonly client = apiClient;

  async create(payload: CreateExpenseCategoryDto) {
    const body = createExpenseCategorySchema.parse(payload);
    const response = await this.client.post('/expense-categories', body);

    return parseWithSchema(expenseCategorySchema, response.data);
  }

  async findAll() {
    const response = await this.client.get('/expense-categories');

    return parseWithSchema(zExpenseCategoryArraySchema, response.data);
  }

  async findOne(categoryId: string) {
    const response = await this.client.get(`/expense-categories/${categoryId}`);

    return parseWithSchema(expenseCategorySchema, response.data);
  }

  async update(categoryId: string, payload: UpdateExpenseCategoryDto) {
    const body = updateExpenseCategorySchema.parse(payload);
    const response = await this.client.patch(
      `/expense-categories/${categoryId}`,
      body,
    );

    return parseWithSchema(expenseCategorySchema, response.data);
  }

  async remove(categoryId: string) {
    await this.client.delete(`/expense-categories/${categoryId}`);
  }
}

export const expenseCategoriesApi = new ExpenseCategoriesApi();
