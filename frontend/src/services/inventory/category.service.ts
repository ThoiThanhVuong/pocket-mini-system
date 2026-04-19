import api from '@/lib/axios';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types/inventory/category';
import { ApiResponse, PaginatedResult } from '@/types/common/api';

export const CategoryService = {
  async getAllCategories(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResult<Category>> {
    const response = await api.get<ApiResponse<PaginatedResult<Category>>>('/categories', { params });
    return response.data.data;
  },

  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  async createCategory(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post<ApiResponse<Category>>('/categories', data);
    return response.data.data;
  },

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await api.put<ApiResponse<Category>>(`/categories/${id}`, data);
    return response.data.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
