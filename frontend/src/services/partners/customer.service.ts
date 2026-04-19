import api from '@/lib/axios';
import { Customer } from '@/types/partners/customer';
import { ApiResponse, PaginatedResult } from '@/types/common/api';

export const CustomerService = {
  async getAllCustomers(params?: { search?: string; status?: string; customerType?: string; page?: number; limit?: number }): Promise<PaginatedResult<Customer>> {
    const response = await api.get<ApiResponse<PaginatedResult<Customer>>>(`/customers`, { params });
    return response.data.data;
  },

  async getCustomerById(id: string): Promise<Customer> {
    const response = await api.get<ApiResponse<Customer>>(`/customers/${id}`);
    return response.data.data;
  },

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const response = await api.post<ApiResponse<Customer>>(`/customers`, data);
    return response.data.data;
  },

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    const response = await api.put<ApiResponse<Customer>>(`/customers/${id}`, data);
    return response.data.data;
  },

  async deleteCustomer(id: string): Promise<void> {
    await api.delete(`/customers/${id}`);
  },

  async getCustomerHistory(id: string): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`/stock-out/customer/${id}`);
    return response.data.data;
  },
};
