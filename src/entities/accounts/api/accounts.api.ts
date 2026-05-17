import { apiClient } from '@/shared/api';

class AccountsApi {
  private readonly client = apiClient;

  delete = async (accountId: string) => {
    const response = await this.client.delete(`/accounts/${accountId}`);
    return response.data;
  };
}

export const accountsApi = new AccountsApi();
