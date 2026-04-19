import { StockOut } from '../../../domain/entities/warehouse/stock-out.entity';
import { IPaginationOptions, IPaginatedResult } from '../../../../shared/types/pagination.type';

export interface StockOutItemInput {
    productId: string;
    quantity: number;
    price: number;
}

export const IStockOutServiceKey = 'IStockOutService';

export interface IStockOutService {
    createStockOut(customerId: string, warehouseId: string, userId: string, referenceCode: string, items: StockOutItemInput[], notes?: string): Promise<StockOut>;
    approveStockOut(id: string): Promise<StockOut>;
    completeStockOut(id: string): Promise<StockOut>;
    cancelStockOut(id: string): Promise<StockOut>;
    getAll(filters?: { warehouseId?: string, status?: string, search?: string, customerId?: string }, options?: IPaginationOptions): Promise<IPaginatedResult<StockOut>>;
    getById(id: string): Promise<StockOut | null>;
    getByCustomer(customerId: string): Promise<StockOut[]>;
}
