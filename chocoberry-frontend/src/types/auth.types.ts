export interface User {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'ACCOUNTANT'
  businessId?: string
  business?: { id: string; name: string; type: string }
  createdAt: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}
