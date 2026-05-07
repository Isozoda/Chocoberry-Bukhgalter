import api from './axios'
import type { LoginDto, RegisterDto, AuthResponse, User } from '@/types/auth.types'

export const authApi = {
  register: (dto: RegisterDto): Promise<AuthResponse> =>
    api.post('/auth/register', dto),

  login: (dto: LoginDto): Promise<AuthResponse> =>
    api.post('/auth/login', dto),

  me: (): Promise<User> =>
    api.get('/auth/me'),
}
