import { StockTransfer } from '../../../domain/entities/warehouse/stock-transfer.entity';
import { IPaginationOptions, IPaginatedResult } from '../../../../shared/types/pagination.type';

export interface StockTransferItemInput {
    productId: string;
    quantity: number;
}

export const IStockTransferServiceKey = 'IStockTransferService';

export interface IStockTransferService {
    createTransfer(
        fromWarehouseId: string, toWarehouseId: string, userId: string,
        referenceCode: string, items: StockTransferItemInput[],
        notes?: string,
    ): Promise<StockTransfer>;
    approveTransfer(id: string): Promise<StockTransfer>;
    completeTransfer(id: string): Promise<StockTransfer>;
    cancelTransfer(id: string): Promise<StockTransfer>;
    getAll(filters?: { fromWarehouseId?: string, toWarehouseId?: string, status?: string, search?: string }, options?: IPaginationOptions): Promise<IPaginatedResult<StockTransfer>>;
    getById(id: string): Promise<StockTransfer | null>;
}
