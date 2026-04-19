import api from '@/lib/axios';
import { Warehouse, CreateWarehouseDto, UpdateWarehouseDto } from '@/types/inventory/warehouse';
import { ApiResponse, PaginatedResult } from '@/types/common/api';

export const WarehouseService = {
  async getAllWarehouses(params?: { all?: boolean; page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResult<Warehouse>> {
    const response = await api.get<ApiResponse<PaginatedResult<Warehouse>>>('/warehouses', {
      params: params
    });
    return response.data.data;
  },

  async getWarehouseById(id: string): Promise<Warehouse> {
    const response = await api.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
    return response.data.data;
  },

  async createWarehouse(data: CreateWarehouseDto): Promise<Warehouse> {
    const response = await api.post<ApiResponse<Warehouse>>('/warehouses', data);
    return response.data.data;
  },

  async updateWarehouse(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    const response = await api.put<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
    return response.data.data;
  },

  async deleteWarehouse(id: string): Promise<void> {
    await api.delete(`/warehouses/${id}`);
  },
};
