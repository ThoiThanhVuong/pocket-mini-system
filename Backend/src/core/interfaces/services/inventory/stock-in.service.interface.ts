import { StockIn } from '../../../domain/entities/warehouse/stock-in.entity';
import { IPaginationOptions, IPaginatedResult } from '../../../../shared/types/pagination.type';

export interface StockInItemInput {
    productId: string;
    quantity: number;
    price: number;
}

export const IStockInServiceKey = 'IStockInService';

export interface IStockInService {
    createStockIn(supplierId: string, warehouseId: string, userId: string, referenceCode: string, items: StockInItemInput[], notes?: string): Promise<StockIn>;
    approveStockIn(id: string): Promise<StockIn>;
    completeStockIn(id: string): Promise<StockIn>;
    cancelStockIn(id: string): Promise<StockIn>;
    getAll(filters?: { warehouseId?: string, status?: string, search?: string, supplierId?: string }, options?: IPaginationOptions): Promise<IPaginatedResult<StockIn>>;
    getById(id: string): Promise<StockIn | null>;
}
