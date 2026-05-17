export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name: string
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  businessId?: string
}

export interface AuthResponse {
  access_token: string
  user: AuthUser
}
