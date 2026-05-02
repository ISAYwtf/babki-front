import { apiClient, parseWithSchema } from '@/shared/api';
import {
  authResponseSchema,
  type LoginDto,
  loginSchema,
  type RegisterDto,
  registerSchema,
} from '../model/schemas';

class AuthApi {
  private readonly client = apiClient;

  async login(payload: LoginDto) {
    const body = loginSchema.parse(payload);
    const response = await this.client.post('/auth/login', body);

    return parseWithSchema(authResponseSchema, response.data);
  }

  async register(payload: RegisterDto) {
    const body = registerSchema.parse(payload);
    const response = await this.client.post('/auth/register', body);

    return parseWithSchema(authResponseSchema, response.data);
  }
}

export const authApi = new AuthApi();
