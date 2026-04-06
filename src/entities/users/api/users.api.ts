import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type CreateUserDto,
  createUserSchema,
  type ListUsersQuery,
  listUsersQuerySchema,
  type UpdateUserDto,
  updateUserSchema,
  userSchema,
  usersPaginatedResponseSchema,
} from '../model/schemas';

class UsersApi {
  private readonly client = apiClient;

  async create(payload: CreateUserDto) {
    const body = createUserSchema.parse(payload);
    const response = await this.client.post('/users', body);

    return parseWithSchema(userSchema, response.data);
  }

  async findAll(query: ListUsersQuery = {}) {
    const params = listUsersQuerySchema.parse(query);
    const response = await this.client.get('/users', { params });

    return parseWithSchema(usersPaginatedResponseSchema, response.data);
  }

  async findOne(userId: string) {
    const response = await this.client.get(`/users/${userId}`);

    return parseWithSchema(userSchema, response.data);
  }

  async update(userId: string, payload: UpdateUserDto) {
    const body = updateUserSchema.parse(payload);
    const response = await this.client.patch(`/users/${userId}`, body);

    return parseWithSchema(userSchema, response.data);
  }

  async remove(userId: string) {
    await this.client.delete(`/users/${userId}`);
  }
}

export const usersApi = new UsersApi();
