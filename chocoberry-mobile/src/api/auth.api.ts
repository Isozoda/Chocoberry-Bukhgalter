import { apiClient } from './axios'
import type { LoginDto, RegisterDto, AuthResponse } from '@/types/auth.types'

export const authApi = {
  login: (dto: LoginDto): Promise<AuthResponse> =>
    apiClient.post('/auth/login', dto),

  register: (dto: RegisterDto): Promise<AuthResponse> =>
    apiClient.post('/auth/register', dto),

  me: (): Promise<AuthResponse['user']> =>
    apiClient.get('/auth/me'),
}
