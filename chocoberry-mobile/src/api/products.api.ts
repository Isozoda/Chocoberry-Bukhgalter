import { apiClient } from './axios'
import type { Product, CreateProductDto, RecipeIngredientDto } from '@/types/product.types'
import type { PaginatedResponse } from '@/types/api.types'

export const productsApi = {
  list: (params?: Record<string, unknown>): Promise<PaginatedResponse<Product>> =>
    apiClient.get('/products', { params }),

  create: (dto: CreateProductDto): Promise<Product> =>
    apiClient.post('/products', dto),

  getById: (id: string): Promise<Product> =>
    apiClient.get(`/products/${id}`),

  update: (id: string, dto: Partial<CreateProductDto>): Promise<Product> =>
    apiClient.patch(`/products/${id}`, dto),

  delete: (id: string): Promise<void> =>
    apiClient.delete(`/products/${id}`),

  updateRecipe: (id: string, ingredients: RecipeIngredientDto[]): Promise<Product> =>
    apiClient.post(`/products/${id}/recipe`, { ingredients }),
}
