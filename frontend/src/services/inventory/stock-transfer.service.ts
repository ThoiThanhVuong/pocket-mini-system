import api from '@/lib/axios';
import { StockTransfer, CreateStockTransferDto } from '@/types/inventory/stock-transfer';
import { ApiResponse } from '@/types/common/api';

export const StockTransferService = {
  async getAllStockTransfers(params?: { warehouseId?: string; status?: string }): Promise<StockTransfer[]> {
    const response = await api.get<ApiResponse<StockTransfer[]>>('/stock-transfer', { params });
    return response.data.data;
  },

  async getStockTransferById(id: string): Promise<StockTransfer> {
    const response = await api.get<ApiResponse<StockTransfer>>(`/stock-transfer/${id}`);
    return response.data.data;
  },

  async createStockTransfer(data: CreateStockTransferDto): Promise<StockTransfer> {
    const response = await api.post<ApiResponse<StockTransfer>>('/stock-transfer', data);
    return response.data.data;
  },

  async approveStockTransfer(id: string): Promise<StockTransfer> {
    const response = await api.post<ApiResponse<StockTransfer>>(`/stock-transfer/${id}/approve`);
    return response.data.data;
  },

  async completeStockTransfer(id: string): Promise<StockTransfer> {
    const response = await api.post<ApiResponse<StockTransfer>>(`/stock-transfer/${id}/complete`);
    return response.data.data;
  },

  async cancelStockTransfer(id: string): Promise<StockTransfer> {
    const response = await api.post<ApiResponse<StockTransfer>>(`/stock-transfer/${id}/cancel`);
    return response.data.data;
  }
};
