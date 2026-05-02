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
    debtId: string,
    query: ListDebtTransactionsQuery = {},
  ) {
    const params = listDebtTransactionsQuerySchema.parse(query);
    const response = await this.client.get(
      `/debts/${debtId}/transactions`,
      { params },
    );

    return parseWithSchema(debtTransactionsPaginatedResponseSchema, response.data);
  }

  async findOne(debtId: string, debtTransactionId: string) {
    const response = await this.client.get(
      `/debts/${debtId}/transactions/${debtTransactionId}`,
    );

    return parseWithSchema(debtTransactionSchema, response.data);
  }
}

export const debtTransactionsApi = new DebtTransactionsApi();
