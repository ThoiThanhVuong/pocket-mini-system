import { StockIn } from '../../domain/entities/warehouse/stock-in.entity';

export const IStockInServiceKey = 'IStockInService';

export interface StockInItemInput {
    productId: string;
    quantity: number;
    price: number;
}

export interface IStockInService {
    createStockIn(supplierId: string, warehouseId: string, userId: string, referenceCode: string, items: StockInItemInput[], notes?: string): Promise<StockIn>;
    approveStockIn(id: string): Promise<StockIn>;
    completeStockIn(id: string): Promise<StockIn>;
    cancelStockIn(id: string): Promise<StockIn>;
    getAll(warehouseId?: string, status?: string): Promise<StockIn[]>;
    getById(id: string): Promise<StockIn | null>;
}
