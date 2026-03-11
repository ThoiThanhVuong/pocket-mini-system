import api from '@/lib/axios';
import { Supplier } from '@/types/partners/supplier';
import { ApiResponse } from '@/types/common/api';

export const SupplierService = {
  async getAllSuppliers(params?: { search?: string; status?: string }): Promise<Supplier[]> {
    const response = await api.get<ApiResponse<Supplier[]>>(`/suppliers`, { params });
    return response.data.data;
  },

  async getSupplierById(id: string): Promise<Supplier> {
    const response = await api.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return response.data.data;
  },

  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.post<ApiResponse<Supplier>>(`/suppliers`, data);
    return response.data.data;
  },

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const response = await api.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return response.data.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    await api.delete(`/suppliers/${id}`);
  },
};
