import { apiClient, parseWithSchema } from '@/shared/api';
import {
  createPlanPayloadSchema,
  type CreatePlanPayload,
  type ListPlansQuery,
  listPlansQuerySchema,
  type Plan,
  planSchema,
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

  create = async (payload: CreatePlanPayload) => {
    const body = createPlanPayloadSchema.parse(payload);
    const response = await this.client.post<Plan>('/plans', body);

    return parseWithSchema(planSchema, response.data);
  };
}

export const plansApi = new PlansApi();
