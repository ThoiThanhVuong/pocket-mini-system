import api from '@/lib/axios';
import { StockIn, CreateStockInDto } from '@/types/inventory/stock-in';
import { ApiResponse, PaginatedResult } from '@/types/common/api';

export const StockInService = {
  async getAllStockIns(params?: { 
    warehouseId?: string; 
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResult<StockIn>> {
    const response = await api.get<ApiResponse<PaginatedResult<StockIn>>>('/stock-in', { params });
    return response.data.data;
  },

  async getStockInById(id: string): Promise<StockIn> {
    const response = await api.get<ApiResponse<StockIn>>(`/stock-in/${id}`);
    return response.data.data;
  },

  async createStockIn(data: CreateStockInDto): Promise<StockIn> {
    const response = await api.post<ApiResponse<StockIn>>('/stock-in', data);
    return response.data.data;
  },

  async approveStockIn(id: string): Promise<StockIn> {
    const response = await api.post<ApiResponse<StockIn>>(`/stock-in/${id}/approve`);
    return response.data.data;
  },

  async completeStockIn(id: string): Promise<StockIn> {
    const response = await api.post<ApiResponse<StockIn>>(`/stock-in/${id}/complete`);
    return response.data.data;
  },

  async cancelStockIn(id: string): Promise<StockIn> {
    const response = await api.post<ApiResponse<StockIn>>(`/stock-in/${id}/cancel`);
    return response.data.data;
  }
};
