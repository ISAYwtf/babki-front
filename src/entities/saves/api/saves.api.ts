import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type CreateSaveDto,
  createSaveSchema,
  type Save,
  type SaveRevenue,
  saveRevenueSchema,
  saveSchema,
  type SavesPaginatedResponse,
  savesPaginatedResponseSchema,
  type ListSavesQuery,
  listSavesQuerySchema,
  type UpdateSaveDto,
  updateSaveSchema,
} from '../model/schemas';

class SavesApi {
  private readonly client = apiClient;

  create = async (payload: CreateSaveDto) => {
    const body = createSaveSchema.parse(payload);
    const response = await this.client.post<Save>('/saves', body);

    return parseWithSchema(saveSchema, response.data);
  };

  findAll = async (query: ListSavesQuery = {}) => {
    const params = listSavesQuerySchema.parse(query);
    const response = await this.client.get<SavesPaginatedResponse>('/saves', { params });

    return parseWithSchema(savesPaginatedResponseSchema, response.data);
  };

  findTotalRevenue = async (query: ListSavesQuery = {}) => {
    const params = listSavesQuerySchema.parse(query);
    const response = await this.client.get<SaveRevenue>('/saves/revenue', { params });

    return parseWithSchema(saveRevenueSchema, response.data);
  };

  findOne = async (incomeId: string) => {
    const response = await this.client.get<Save>(`/saves/${incomeId}`);

    return parseWithSchema(saveSchema, response.data);
  };

  update = async (incomeId: string, payload: UpdateSaveDto) => {
    const body = updateSaveSchema.parse(payload);
    const response = await this.client.patch<Save>(`/saves/${incomeId}`, body);

    return parseWithSchema(saveSchema, response.data);
  };
}

export const savesApi = new SavesApi();
