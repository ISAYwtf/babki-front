import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type ListPlansQuery,
  listPlansQuerySchema,
  type PlansPaginatedResponse,
  plansPaginatedResponseSchema,
} from '../model/schemas';

class PlansApi {
  private readonly client = apiClient;

  findAll = async (query: ListPlansQuery = {}) => {
    const params = listPlansQuerySchema.parse(query);
    const response = await this.client.get<PlansPaginatedResponse>('/plans', { params });

    return parseWithSchema(plansPaginatedResponseSchema, response.data);
  };
}

export const plansApi = new PlansApi();
