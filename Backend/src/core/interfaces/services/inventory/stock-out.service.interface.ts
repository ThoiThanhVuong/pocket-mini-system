import { StockOut } from '../../../domain/entities/warehouse/stock-out.entity';

export const IStockOutServiceKey = 'IStockOutService';

export interface StockOutItemInput {
    productId: string;
    quantity: number;
    price: number;
}

export interface IStockOutService {
    createStockOut(customerId: string, warehouseId: string, userId: string, referenceCode: string, items: StockOutItemInput[], notes?: string): Promise<StockOut>;
    approveStockOut(id: string): Promise<StockOut>;
    completeStockOut(id: string): Promise<StockOut>;
    cancelStockOut(id: string): Promise<StockOut>;
    getAll(warehouseId?: string, status?: string): Promise<StockOut[]>;
    getById(id: string): Promise<StockOut | null>;
}
