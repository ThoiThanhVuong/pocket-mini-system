import api from '@/lib/axios';
import { Warehouse, CreateWarehouseDto, UpdateWarehouseDto } from '@/types/inventory/warehouse';
import { ApiResponse } from '@/types/common/api';

export const WarehouseService = {
  async getAllWarehouses(all: boolean = false): Promise<Warehouse[]> {
    const response = await api.get<ApiResponse<Warehouse[]>>('/warehouses', {
      params: { all }
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
