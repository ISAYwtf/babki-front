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

  async create(userId: string, payload: CreateExpenseCategoryDto) {
    const body = createExpenseCategorySchema.parse(payload);
    const response = await this.client.post(`/users/${userId}/expense-categories`, body);

    return parseWithSchema(expenseCategorySchema, response.data);
  }

  async findAll(userId: string) {
    const response = await this.client.get(`/users/${userId}/expense-categories`);

    return parseWithSchema(zExpenseCategoryArraySchema, response.data);
  }

  async findOne(userId: string, categoryId: string) {
    const response = await this.client.get(
      `/users/${userId}/expense-categories/${categoryId}`,
    );

    return parseWithSchema(expenseCategorySchema, response.data);
  }

  async update(userId: string, categoryId: string, payload: UpdateExpenseCategoryDto) {
    const body = updateExpenseCategorySchema.parse(payload);
    const response = await this.client.patch(
      `/users/${userId}/expense-categories/${categoryId}`,
      body,
    );

    return parseWithSchema(expenseCategorySchema, response.data);
  }

  async remove(userId: string, categoryId: string) {
    await this.client.delete(`/users/${userId}/expense-categories/${categoryId}`);
  }
}

export const expenseCategoriesApi = new ExpenseCategoriesApi();
