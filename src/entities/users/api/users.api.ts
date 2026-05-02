import { apiClient, parseWithSchema } from '@/shared/api';
import {
  type UpdateUserDto,
  updateUserSchema,
  userSchema,
} from '../model/schemas';

class UsersApi {
  private readonly client = apiClient;

  async me() {
    const response = await this.client.get('/users/me');

    return parseWithSchema(userSchema, response.data);
  }

  async updateMe(payload: UpdateUserDto) {
    const body = updateUserSchema.parse(payload);
    const response = await this.client.patch('/users/me', body);

    return parseWithSchema(userSchema, response.data);
  }

  async removeMe() {
    await this.client.delete('/users/me');
  }
}

export const usersApi = new UsersApi();
