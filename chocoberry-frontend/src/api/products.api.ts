import api from './axios'
import type { Product, CreateProductDto, RecipeDto } from '@/types/product.types'
import type { PaginatedResponse } from '@/types/api.types'

export const productsApi = {
  list: (params?: { cupType?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Product>> =>
    api.get('/products', { params }),

  create: (dto: CreateProductDto): Promise<Product> =>
    api.post('/products', dto),

  getById: (id: string): Promise<Product> =>
    api.get(`/products/${id}`),

  update: (id: string, dto: Partial<CreateProductDto>): Promise<Product> =>
    api.patch(`/products/${id}`, dto),

  delete: (id: string): Promise<void> =>
    api.delete(`/products/${id}`),

  uploadImage: (id: string, file: File): Promise<Product> => {
    const formData = new FormData()
    formData.append('image', file)
    // Our axios instance defaults Content-Type to application/json, which makes axios
    // JSON-encode the FormData instead of sending it as multipart. Unset it here so the
    // browser sets the correct multipart/form-data header (with boundary) itself.
    return api.post(`/products/${id}/image`, formData, {
      headers: { 'Content-Type': undefined },
    })
  },

  setRecipe: (id: string, dto: RecipeDto): Promise<Product> =>
    api.post(`/products/${id}/recipe`, dto),

  getRecipe: (id: string): Promise<Product> =>
    api.get(`/products/${id}/recipe`),
}
