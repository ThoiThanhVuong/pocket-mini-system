import api from '@/lib/axios';
import { Inventory } from '@/types/inventory/stock';
import { ApiResponse } from '@/types/common/api';

export const StockService = {
  async getStock(params?: { warehouseId?: string; productId?: string }): Promise<Inventory[]> {
    const response = await api.get<ApiResponse<Inventory[]>>('/stock', { params });
    // Dữ liệu trả về có thể là object hoặc mảng. Api đang trả về mảng.
    return Array.isArray(response.data.data) ? response.data.data : [response.data.data as unknown as Inventory];
  },

  async getLowStock(warehouseId: string): Promise<Inventory[]> {
    const response = await api.get<ApiResponse<Inventory[]>>('/stock/low-stock', { params: { warehouseId } });
    return response.data.data;
  },

  async getTotalStockByProduct(productId: string): Promise<{ productId: string; totalQuantity: number }> {
    const response = await api.get<ApiResponse<{ productId: string; totalQuantity: number }>>(`/stock/total/${productId}`);
    return response.data.data;
  }
};
