import api from '@/lib/axios';
import { Product, CreateProductDto, UpdateProductDto } from '@/types/inventory/product';
import { ApiResponse, PaginatedResult } from '@/types/common/api';

export const ProductService = {
  async getAllProducts(params?: { search?: string; isActive?: boolean; categoryId?: string; page?: number; limit?: number }): Promise<PaginatedResult<Product>> {
    const response = await api.get<ApiResponse<PaginatedResult<Product>>>('/products', { params });
    return response.data.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  async createProduct(data: CreateProductDto): Promise<Product> {
    const response = await api.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data.data;
  },

  async updateProductPrice(id: string, price: number): Promise<Product> {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/price`, { price });
    return response.data.data;
  },

  async updateProductStockLevel(id: string, minStockLevel: number): Promise<Product> {
    const response = await api.patch<ApiResponse<Product>>(`/products/${id}/stock`, { minStockLevel });
    return response.data.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  },
};
