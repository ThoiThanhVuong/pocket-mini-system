import api from '@/lib/axios';
import { StockOut, CreateStockOutDto } from '@/types/inventory/stock-out';
import { ApiResponse, PaginatedResult } from '@/types/common/api';

export const StockOutService = {
  async getAllStockOuts(params?: { 
    warehouseId?: string; 
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResult<StockOut>> {
    const response = await api.get<ApiResponse<PaginatedResult<StockOut>>>('/stock-out', { params });
    return response.data.data;
  },

  async getStockOutById(id: string): Promise<StockOut> {
    const response = await api.get<ApiResponse<StockOut>>(`/stock-out/${id}`);
    return response.data.data;
  },

  async createStockOut(data: CreateStockOutDto): Promise<StockOut> {
    const response = await api.post<ApiResponse<StockOut>>('/stock-out', data);
    return response.data.data;
  },

  async approveStockOut(id: string): Promise<StockOut> {
    const response = await api.post<ApiResponse<StockOut>>(`/stock-out/${id}/approve`);
    return response.data.data;
  },

  async completeStockOut(id: string): Promise<StockOut> {
    const response = await api.post<ApiResponse<StockOut>>(`/stock-out/${id}/complete`);
    return response.data.data;
  },

  async cancelStockOut(id: string): Promise<StockOut> {
    const response = await api.post<ApiResponse<StockOut>>(`/stock-out/${id}/cancel`);
    return response.data.data;
  }
};
