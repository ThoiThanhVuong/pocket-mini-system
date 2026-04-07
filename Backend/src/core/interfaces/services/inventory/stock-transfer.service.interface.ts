import { StockTransfer } from '../../../domain/entities/warehouse/stock-transfer.entity';

export const IStockTransferServiceKey = 'IStockTransferService';

export interface StockTransferItemInput {
    productId: string;
    quantity: number;
}

export interface IStockTransferService {
    createTransfer(
        fromWarehouseId: string, toWarehouseId: string, userId: string,
        referenceCode: string, items: StockTransferItemInput[],
        notes?: string,
    ): Promise<StockTransfer>;
    approveTransfer(id: string): Promise<StockTransfer>;
    completeTransfer(id: string): Promise<StockTransfer>;
    cancelTransfer(id: string): Promise<StockTransfer>;
    getAll(warehouseId?: string, status?: string): Promise<StockTransfer[]>;
    getById(id: string): Promise<StockTransfer | null>;
}
