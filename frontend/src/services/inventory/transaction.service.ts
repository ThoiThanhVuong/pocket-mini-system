import api from '@/lib/axios';
import { ApiResponse } from '@/types/common/api';

import { Transaction } from '@/types/inventory/transaction';

export const TransactionService = {
  async getAllTransactions(params?: { warehouseId?: string; status?: string; type?: string; search?: string }): Promise<Transaction[]> {
    const response = await api.get<ApiResponse<Transaction[]>>('/transactions', { params });
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },

  async approveTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any> {
    const response = await api.post(`/transactions/${id}/approve`, { type });
    return response.data;
  },

  async completeTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any> {
    const response = await api.post(`/transactions/${id}/complete`, { type });
    return response.data;
  },

  async cancelTransaction(id: string, type: 'IN' | 'OUT' | 'TRANSFER'): Promise<any> {
    const response = await api.post(`/transactions/${id}/cancel`, { type });
    return response.data;
  }
};
