import { apiClient, parseWithSchema } from '@/shared/api';
import {
  debtTransactionSchema,
  debtTransactionsPaginatedResponseSchema,
  type ListDebtTransactionsQuery,
  listDebtTransactionsQuerySchema,
} from '../model/schemas';

class DebtTransactionsApi {
  private readonly client = apiClient;

  async findAll(
    userId: string,
    debtId: string,
    query: ListDebtTransactionsQuery = {},
  ) {
    const params = listDebtTransactionsQuerySchema.parse(query);
    const response = await this.client.get(
      `/users/${userId}/debts/${debtId}/transactions`,
      { params },
    );

    return parseWithSchema(debtTransactionsPaginatedResponseSchema, response.data);
  }

  async findOne(userId: string, debtId: string, debtTransactionId: string) {
    const response = await this.client.get(
      `/users/${userId}/debts/${debtId}/transactions/${debtTransactionId}`,
    );

    return parseWithSchema(debtTransactionSchema, response.data);
  }
}

export const debtTransactionsApi = new DebtTransactionsApi();
